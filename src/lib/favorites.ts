const KEY = "devstool:favorites";

export function getFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function isFavorite(path: string): boolean {
  return getFavorites().includes(path);
}

export function toggleFavorite(path: string): string[] {
  const current = getFavorites();
  const next = current.includes(path)
    ? current.filter((p) => p !== path)
    : [...current, path];
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  return next;
}
