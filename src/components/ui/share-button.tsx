"use client";

import { useState } from "react";
import { Link2, Check, AlertCircle } from "lucide-react";
import { buildShareUrl } from "@/lib/share";

interface ShareButtonProps {
  getState: () => unknown;
  disabled?: boolean;
}

const MAX_SHARE_URL_LENGTH = 8000;

export function ShareButton({ getState, disabled }: ShareButtonProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "toolarge">("idle");

  const share = async () => {
    const url = buildShareUrl(getState());

    if (url.length > MAX_SHARE_URL_LENGTH) {
      setStatus("toolarge");
      setTimeout(() => setStatus("idle"), 3000);
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const el = document.createElement("input");
      el.value = url;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setStatus("copied");
    setTimeout(() => setStatus("idle"), 2000);
  };

  return (
    <button
      onClick={share}
      disabled={disabled}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-900 border rounded-lg transition-colors disabled:opacity-40 ${
        status === "toolarge"
          ? "border-amber-500/40 text-amber-400"
          : "border-zinc-800 text-zinc-400 hover:text-indigo-400 hover:border-indigo-500/40"
      }`}
      title={status === "toolarge" ? "Content is too large to share via URL" : "Copy shareable link"}
    >
      {status === "copied" && <Check className="w-3.5 h-3.5 text-emerald-400" />}
      {status === "toolarge" && <AlertCircle className="w-3.5 h-3.5" />}
      {status === "idle" && <Link2 className="w-3.5 h-3.5" />}
      {status === "copied" ? "Copied!" : status === "toolarge" ? "Too large" : "Share"}
    </button>
  );
}
