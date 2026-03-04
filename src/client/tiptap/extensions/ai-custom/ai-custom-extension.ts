import { Extension } from "@tiptap/core"
import { Plugin, PluginKey } from "@tiptap/pm/state"
import { Decoration, DecorationSet } from "@tiptap/pm/view"
import type {
  AiRejectOptions,
  AiStorageState,
  TextOptions,
} from "./ai-types"
import { buildPrompt } from "./ai-prompts"

declare module "@tiptap/core" {
  interface Storage {
    ai: AiStorageState
    aiAdvanced?: AiStorageState
  }
}

const AI_PLUGIN_KEY = new PluginKey("aiCustom")

const defaultStorage: AiStorageState = {
  response: null,
  originalDocJson: null,
  insertRange: null,
  state: "idle",
  lastPromptOptions: null,
  lastPromptText: null,
  generatedWith: null,
  abortController: null,
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    aiCustom: {
      aiTextPrompt: (options: TextOptions & { text: string }) => ReturnType
      aiFixSpellingAndGrammar: (options?: TextOptions) => ReturnType
      aiExtend: (options?: TextOptions) => ReturnType
      aiShorten: (options?: TextOptions) => ReturnType
      aiSimplify: (options?: TextOptions) => ReturnType
      aiRephrase: (options?: TextOptions) => ReturnType
      aiEmojify: (options?: TextOptions) => ReturnType
      aiComplete: (options?: TextOptions) => ReturnType
      aiSummarize: (options?: TextOptions) => ReturnType
      aiAdjustTone: (tone: string, options?: TextOptions) => ReturnType
      aiTranslate: (language: string, options?: TextOptions) => ReturnType
      aiAccept: () => ReturnType
      aiReject: (options?: AiRejectOptions) => ReturnType
      aiRegenerate: (options?: TextOptions) => ReturnType
    }
  }
}

function getSelectedHtml(editor: import("@tiptap/core").Editor): string {
  const { state } = editor
  const { selection } = state
  const slice = selection.content()
  const dom = editor.view.serializeForClipboard(slice).dom
  return dom.innerHTML
}

function getSelectedText(editor: import("@tiptap/core").Editor): string {
  const { state } = editor
  const { from, to } = state.selection
  return state.doc.textBetween(from, to, "\n")
}

async function executeAiRequest(
  editor: import("@tiptap/core").Editor,
  promptText: string,
  options: TextOptions
) {
  const storage = editor.storage.ai as AiStorageState

  const { from, to } = options.insertAt || editor.state.selection
  storage.originalDocJson = editor.getJSON()
  storage.insertRange = { from, to }
  storage.state = "loading"
  storage.response = null
  storage.generatedWith = null
  storage.lastPromptText = promptText
  storage.lastPromptOptions = { ...options }

  editor.commands.aiGenerationSetIsLoading(true)
  editor.commands.aiGenerationHasMessage(false)

  const abortController = new AbortController()
  storage.abortController = abortController

  try {
    const useStream = options.stream !== false

    const response = await fetch("/api/ai-text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: abortController.signal,
      body: JSON.stringify({
        prompt: promptText,
        tone: options.tone,
        format: options.format || "rich-text",
        stream: useStream,
        model: "gpt-4o-mini",
        maxTokens: 1000,
        temperature: 0.7,
        instructions:
          "Only use heading levels 3 and 4. Do not use heading levels 1 or 2.",
      }),
    })

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Unknown error" }))
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    if (useStream && response.body) {
      await handleStreamResponse(editor, response.body, from, to)
    } else {
      const data = await response.json()
      const html = data.content || ""
      storage.response = html
      insertAiContent(editor, html, from, to)
    }

    storage.state = "done"
    storage.generatedWith = { range: { ...storage.insertRange! } }
    editor.commands.aiGenerationSetIsLoading(false)
    editor.commands.aiGenerationHasMessage(true)
  } catch (error: unknown) {
    if ((error as Error).name === "AbortError") {
      return
    }
    console.error("AI request error:", error)
    storage.state = "error"
    editor.commands.aiGenerationSetIsLoading(false)
    editor.commands.aiGenerationHasMessage(false)
  } finally {
    storage.abortController = null
  }
}

async function handleStreamResponse(
  editor: import("@tiptap/core").Editor,
  body: ReadableStream<Uint8Array>,
  from: number,
  to: number
) {
  const storage = editor.storage.ai as AiStorageState
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let accumulated = ""
  let currentTo = to
  let hasInserted = false
  let pendingUpdate = false

  const flushUpdate = () => {
    if (!pendingUpdate || !accumulated) return
    pendingUpdate = false

    try {
      if (hasInserted && storage.insertRange) {
        const deleteFrom = storage.insertRange.from
        const deleteTo = storage.insertRange.to
        editor
          .chain()
          .deleteRange({ from: deleteFrom, to: deleteTo })
          .insertContentAt(deleteFrom, accumulated, {
            parseOptions: { preserveWhitespace: false },
          })
          .run()
      } else {
        editor
          .chain()
          .deleteRange({ from, to: currentTo })
          .insertContentAt(from, accumulated, {
            parseOptions: { preserveWhitespace: false },
          })
          .run()
        hasInserted = true
      }

      const newTo = from + editor.state.doc.content.size - (
        storage.originalDocJson
          ? computeOriginalDocSize(editor, storage.originalDocJson, from, to)
          : 0
      )

      const actualNewTo = findInsertEnd(editor, from)
      storage.insertRange = { from, to: actualNewTo }
      storage.response = accumulated

      editor.view.dispatch(
        editor.state.tr.setMeta(AI_PLUGIN_KEY, { decorationRange: { from, to: actualNewTo } })
      )
    } catch {
      // Content parsing can fail mid-stream; will retry on next chunk
    }
  }

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      accumulated += decoder.decode(value, { stream: true })
      pendingUpdate = true

      if (!document.hidden) {
        flushUpdate()
      }
    }

    accumulated += decoder.decode()
    pendingUpdate = true
    flushUpdate()
  } finally {
    reader.releaseLock()
  }
}

function findInsertEnd(
  editor: import("@tiptap/core").Editor,
  from: number
): number {
  const docSize = editor.state.doc.content.size
  return Math.min(docSize, editor.state.doc.nodeSize - 2)
}

function computeOriginalDocSize(
  _editor: import("@tiptap/core").Editor,
  _originalDocJson: unknown,
  _from: number,
  _to: number
): number {
  return 0
}

function insertAiContent(
  editor: import("@tiptap/core").Editor,
  html: string,
  from: number,
  to: number
) {
  const storage = editor.storage.ai as AiStorageState

  editor
    .chain()
    .deleteRange({ from, to })
    .insertContentAt(from, html, {
      parseOptions: { preserveWhitespace: false },
    })
    .run()

  const actualNewTo = findInsertEnd(editor, from)
  storage.insertRange = { from, to: actualNewTo }

  editor.view.dispatch(
    editor.state.tr.setMeta(AI_PLUGIN_KEY, {
      decorationRange: { from, to: actualNewTo },
    })
  )
}

function getContentForAction(
  editor: import("@tiptap/core").Editor,
  options?: TextOptions
): { text: string; from: number; to: number } {
  if (options?.text) {
    const range = options.insertAt || editor.state.selection
    return { text: options.text, from: range.from, to: range.to }
  }

  const { from, to } = options?.insertAt || editor.state.selection
  const html = getSelectedHtml(editor)
  const text = html || getSelectedText(editor)
  return { text, from, to }
}

export const AiCustom = Extension.create({
  name: "ai",

  addStorage() {
    return { ...defaultStorage }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: AI_PLUGIN_KEY,
        state: {
          init() {
            return DecorationSet.empty
          },
          apply(tr, oldSet) {
            const meta = tr.getMeta(AI_PLUGIN_KEY)

            if (meta?.clear) {
              return DecorationSet.empty
            }

            if (meta?.decorationRange) {
              const { from, to } = meta.decorationRange
              if (from >= 0 && to > from && to <= tr.doc.content.size) {
                const deco = Decoration.inline(from, to, {
                  class: "tiptap-ai-insertion",
                })
                return DecorationSet.create(tr.doc, [deco])
              }
              return DecorationSet.empty
            }

            return oldSet.map(tr.mapping, tr.doc)
          },
        },
        props: {
          decorations(state) {
            return AI_PLUGIN_KEY.getState(state)
          },
        },
      }),
    ]
  },

  addCommands() {
    return {
      aiTextPrompt:
        (options) =>
        ({ editor }) => {
          const { text, ...rest } = options
          const { from, to } = rest.insertAt || editor.state.selection
          const fullOptions: TextOptions = {
            ...rest,
            insertAt: { from, to },
          }

          const prompt = buildPrompt("custom", text, {
            tone: rest.tone,
          })

          executeAiRequest(editor, prompt, fullOptions)
          return true
        },

      aiFixSpellingAndGrammar:
        (options) =>
        ({ editor }) => {
          const { text, from, to } = getContentForAction(editor, options)
          const prompt = buildPrompt("fixSpellingAndGrammar", text)
          executeAiRequest(editor, prompt, {
            ...options,
            insertAt: { from, to },
          })
          return true
        },

      aiExtend:
        (options) =>
        ({ editor }) => {
          const { text, from, to } = getContentForAction(editor, options)
          const prompt = buildPrompt("extend", text)
          executeAiRequest(editor, prompt, {
            ...options,
            insertAt: { from, to },
          })
          return true
        },

      aiShorten:
        (options) =>
        ({ editor }) => {
          const { text, from, to } = getContentForAction(editor, options)
          const prompt = buildPrompt("shorten", text)
          executeAiRequest(editor, prompt, {
            ...options,
            insertAt: { from, to },
          })
          return true
        },

      aiSimplify:
        (options) =>
        ({ editor }) => {
          const { text, from, to } = getContentForAction(editor, options)
          const prompt = buildPrompt("simplify", text)
          executeAiRequest(editor, prompt, {
            ...options,
            insertAt: { from, to },
          })
          return true
        },

      aiRephrase:
        (options) =>
        ({ editor }) => {
          const { text, from, to } = getContentForAction(editor, options)
          const prompt = buildPrompt("rephrase", text)
          executeAiRequest(editor, prompt, {
            ...options,
            insertAt: { from, to },
          })
          return true
        },

      aiEmojify:
        (options) =>
        ({ editor }) => {
          const { text, from, to } = getContentForAction(editor, options)
          const prompt = buildPrompt("emojify", text)
          executeAiRequest(editor, prompt, {
            ...options,
            insertAt: { from, to },
          })
          return true
        },

      aiComplete:
        (options) =>
        ({ editor }) => {
          const { text, from, to } = getContentForAction(editor, options)
          const prompt = buildPrompt("complete", text)
          executeAiRequest(editor, prompt, {
            ...options,
            insertAt: { from, to },
          })
          return true
        },

      aiSummarize:
        (options) =>
        ({ editor }) => {
          const { text, from, to } = getContentForAction(editor, options)
          const prompt = buildPrompt("summarize", text)
          executeAiRequest(editor, prompt, {
            ...options,
            insertAt: { from, to },
          })
          return true
        },

      aiAdjustTone:
        (tone, options) =>
        ({ editor }) => {
          const { text, from, to } = getContentForAction(editor, options)
          const prompt = buildPrompt("adjustTone", text, { tone })
          executeAiRequest(editor, prompt, {
            ...options,
            tone,
            insertAt: { from, to },
          })
          return true
        },

      aiTranslate:
        (language, options) =>
        ({ editor }) => {
          const { text, from, to } = getContentForAction(editor, options)
          const prompt = buildPrompt("translate", text, { language })
          executeAiRequest(editor, prompt, {
            ...options,
            language,
            insertAt: { from, to },
          })
          return true
        },

      aiAccept:
        () =>
        ({ editor }) => {
          const storage = editor.storage.ai as AiStorageState
          storage.originalDocJson = null
          storage.insertRange = null
          storage.state = "idle"
          storage.generatedWith = null
          storage.lastPromptOptions = null
          storage.lastPromptText = null
          storage.response = null

          editor.view.dispatch(
            editor.state.tr.setMeta(AI_PLUGIN_KEY, { clear: true })
          )
          return true
        },

      aiReject:
        (options) =>
        ({ editor }) => {
          const storage = editor.storage.ai as AiStorageState

          if (storage.abortController) {
            storage.abortController.abort()
            storage.abortController = null
          }

          if (
            options?.type === "reset" ||
            !storage.originalDocJson
          ) {
            if (storage.originalDocJson) {
              editor.commands.setContent(storage.originalDocJson)
            }
          } else if (storage.originalDocJson) {
            editor.commands.setContent(storage.originalDocJson)
          }

          storage.originalDocJson = null
          storage.insertRange = null
          storage.state = "idle"
          storage.generatedWith = null
          storage.response = null

          editor.view.dispatch(
            editor.state.tr.setMeta(AI_PLUGIN_KEY, { clear: true })
          )
          return true
        },

      aiRegenerate:
        (options) =>
        ({ editor }) => {
          const storage = editor.storage.ai as AiStorageState

          if (storage.originalDocJson) {
            editor.commands.setContent(storage.originalDocJson)
          }

          editor.view.dispatch(
            editor.state.tr.setMeta(AI_PLUGIN_KEY, { clear: true })
          )

          if (storage.lastPromptText && storage.lastPromptOptions) {
            const mergedOptions = { ...storage.lastPromptOptions, ...options }
            const savedOriginal = storage.originalDocJson
            storage.state = "idle"
            storage.insertRange = null
            storage.generatedWith = null
            storage.response = null

            setTimeout(() => {
              storage.originalDocJson = savedOriginal
              executeAiRequest(editor, storage.lastPromptText!, mergedOptions)
            }, 50)
          }

          return true
        },
    }
  },
})
