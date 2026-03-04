const HEADING_INSTRUCTION =
  "Only use heading levels 3 and 4. Do not use heading levels 1 or 2."

export function buildPrompt(
  action: string,
  text: string,
  options?: { tone?: string; language?: string }
): string {
  switch (action) {
    case "fixSpellingAndGrammar":
      return `Fix all spelling and grammar issues in the following text. Keep the same meaning, tone, and formatting. Only fix errors, do not rephrase. ${HEADING_INSTRUCTION}\n\n${text}`

    case "extend":
      return `Expand and elaborate on the following text to make it longer. Maintain the same style, voice, and meaning. Add relevant detail and depth. ${HEADING_INSTRUCTION}\n\n${text}`

    case "shorten":
      return `Condense the following text to be shorter while preserving all key information and meaning. Remove redundancy and tighten the prose. ${HEADING_INSTRUCTION}\n\n${text}`

    case "simplify":
      return `Rewrite the following text using simpler language and shorter sentences. Make it easier to understand while keeping the same meaning. ${HEADING_INSTRUCTION}\n\n${text}`

    case "rephrase":
      return `Improve the writing quality of the following text. Make it clearer, more engaging, and better structured while keeping the same meaning. ${HEADING_INSTRUCTION}\n\n${text}`

    case "emojify":
      return `Add relevant emojis throughout the following text to make it more expressive and engaging. Keep all the original text intact. ${HEADING_INSTRUCTION}\n\n${text}`

    case "complete":
      return `Continue writing naturally from where the following text ends. Match the existing style, tone, and subject matter. ${HEADING_INSTRUCTION}\n\n${text}`

    case "summarize":
      return `Write a concise summary of the following text that captures all the key points. ${HEADING_INSTRUCTION}\n\n${text}`

    case "adjustTone":
      return `Rewrite the following text in a ${options?.tone || "neutral"} tone. Keep the same meaning and information. ${HEADING_INSTRUCTION}\n\n${text}`

    case "translate":
      return `Translate the following text to ${options?.language || "English"}. Maintain the formatting and structure. ${HEADING_INSTRUCTION}\n\n${text}`

    case "custom":
    default:
      return text
  }
}
