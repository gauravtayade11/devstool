export function encodeState(state: unknown): string {
  return btoa(JSON.stringify(state))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

export function decodeState<T>(encoded: string): T | null {
  try {
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64)) as T;
  } catch {
    return null;
  }
}

export function getSharedState<T>(): T | null {
  if (typeof window === "undefined") return null;
  const s = new URLSearchParams(window.location.search).get("s");
  if (!s) return null;
  return decodeState<T>(s);
}

export function buildShareUrl(state: unknown): string {
  const encoded = encodeState(state);
  const url = new URL(window.location.href);
  url.searchParams.set("s", encoded);
  return url.toString();
}
