"use client";

import { useState } from "react";

export function useCopyToClipboard(timeout = 2000) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (text: string, key = "default") => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), timeout);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return { copy, copied };
}
