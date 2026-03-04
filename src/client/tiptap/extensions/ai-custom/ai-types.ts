export type Tone =
  | "academic"
  | "business"
  | "casual"
  | "childfriendly"
  | "confident"
  | "conversational"
  | "creative"
  | "emotional"
  | "excited"
  | "formal"
  | "friendly"
  | "funny"
  | "humorous"
  | "informative"
  | "inspirational"
  | "memeify"
  | "narrative"
  | "objective"
  | "persuasive"
  | "poetic"
  | string

export type Language =
  | "en"
  | "ko"
  | "zh"
  | "ja"
  | "es"
  | "ru"
  | "fr"
  | "pt"
  | "de"
  | "it"
  | "nl"
  | "id"
  | "vi"
  | "tr"
  | "ar"
  | string

export interface TextOptions {
  text?: string
  stream?: boolean
  format?: string
  tone?: Tone
  language?: Language
  insert?: boolean
  insertAt?: { from: number; to: number }
  regenerate?: boolean
}

export interface AiRejectOptions {
  type?: "reset"
}

export interface AiStorageState {
  response: string | null
  originalDocJson: unknown
  insertRange: { from: number; to: number } | null
  state: "idle" | "loading" | "done" | "error"
  lastPromptOptions: TextOptions | null
  lastPromptText: string | null
  generatedWith: { range: { from: number; to: number } } | null
  abortController: AbortController | null
}
