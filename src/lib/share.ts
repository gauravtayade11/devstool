import LZString from "lz-string";

export function encodeState(state: unknown): string {
  return LZString.compressToEncodedURIComponent(JSON.stringify(state));
}

export function decodeState<T>(encoded: string): T | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    return JSON.parse(json) as T;
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
