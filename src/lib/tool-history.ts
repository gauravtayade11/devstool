const MAX_HISTORY = 5;

export function saveHistory(toolKey: string, value: string): void {
  if (typeof window === "undefined" || !value.trim()) return;
  try {
    const key = `history:${toolKey}`;
    const existing: string[] = JSON.parse(localStorage.getItem(key) ?? "[]");
    const deduped = [value, ...existing.filter((v) => v !== value)].slice(0, MAX_HISTORY);
    localStorage.setItem(key, JSON.stringify(deduped));
  } catch {}
}

export function getHistory(toolKey: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(`history:${toolKey}`) ?? "[]");
  } catch {
    return [];
  }
}
