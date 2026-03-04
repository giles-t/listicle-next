/**
 * Extract plain text from a TipTap JSON content string.
 * Handles both raw JSON and plain-text descriptions for backward compatibility.
 */
export function extractPlainText(content: string | null | undefined): string {
  if (!content) return "";

  try {
    const doc = JSON.parse(content);
    return collectText(doc).trim();
  } catch {
    return content;
  }
}

function collectText(node: any): string {
  if (!node) return "";
  if (node.type === "text") return node.text ?? "";
  if (!Array.isArray(node.content)) return "";
  return node.content.map(collectText).join(node.type === "doc" ? "\n" : "");
}
