"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";
import { buildShareUrl } from "@/lib/share";

interface ShareButtonProps {
  getState: () => unknown;
  disabled?: boolean;
}

export function ShareButton({ getState, disabled }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const share = () => {
    const url = buildShareUrl(getState());
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={share}
      disabled={disabled}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-indigo-400 hover:border-indigo-500/40 transition-colors disabled:opacity-40"
      title="Copy shareable link"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Link2 className="w-3.5 h-3.5" />}
      {copied ? "Copied!" : "Share"}
    </button>
  );
}
