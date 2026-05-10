"use client";
import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface Field {
  label: string;
  value: string;
  mono?: boolean;
  badge?: string;
  badgeColor?: string;
}

interface ParsedFieldCardProps {
  title?: string;
  fields: Field[];
  emptyMessage?: string;
  columns?: 2 | 3 | 4;
}

function CopyBtn({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="ml-1 p-0.5 text-zinc-600 hover:text-zinc-300 transition-colors">
      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

export function ParsedFieldCard({ title, fields, emptyMessage = "No data", columns = 2 }: ParsedFieldCardProps) {
  if (!fields.length) return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center text-sm text-zinc-600">{emptyMessage}</div>
  );

  const gridClass = columns === 4 ? "grid-cols-4" : columns === 3 ? "grid-cols-3" : "grid-cols-2";

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      {title && <div className="px-4 py-3 border-b border-zinc-800"><p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{title}</p></div>}
      <div className={`grid ${gridClass} divide-x divide-y divide-zinc-800/60`}>
        {fields.map((f) => (
          <div key={f.label} className="px-4 py-3">
            <p className="text-xs text-zinc-500 mb-1">{f.label}</p>
            <div className="flex items-center gap-1">
              {f.badge && <span className={`text-[10px] px-1.5 py-0.5 rounded border font-bold uppercase mr-1 ${f.badgeColor ?? "text-zinc-400 bg-zinc-800 border-zinc-700"}`}>{f.badge}</span>}
              <span className={`text-sm text-zinc-200 break-all ${f.mono ? "font-mono" : ""}`}>{f.value || <span className="text-zinc-600">—</span>}</span>
              {f.value && <CopyBtn value={f.value} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
