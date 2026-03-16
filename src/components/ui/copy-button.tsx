"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyButtonProps {
  text: string;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md";
}

export function CopyButton({ text, disabled = false, className = "", size = "md" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!text || disabled) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";

  return (
    <button
      onClick={handleCopy}
      disabled={disabled || !text}
      aria-label={copied ? "Copied!" : "Copy to clipboard"}
      className={`p-1.5 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {copied ? (
        <Check className={`${iconSize} text-emerald-500`} />
      ) : (
        <Copy className={iconSize} />
      )}
    </button>
  );
}
