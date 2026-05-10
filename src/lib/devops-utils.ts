export function sanitizeInput(value: string, maxLength: number): string {
  return value.slice(0, maxLength);
}

export function downloadTextFile(content: string, filename: string, mimeType = "text/plain"): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function buildSafeRegex(pattern: string, flags = ""): RegExp | null {
  try {
    return new RegExp(pattern, flags);
  } catch {
    return null;
  }
}
