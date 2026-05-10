"use client";
import { Plus, Trash2 } from "lucide-react";

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-zinc-400">{label}{hint && <span className="ml-1 text-zinc-600">({hint})</span>}</label>
      {children}
    </div>
  );
}

export function TextInput({ value, onChange, placeholder, className = "", mono = true }: {
  value: string; onChange: (v: string) => void; placeholder?: string; className?: string; mono?: boolean;
}) {
  return (
    <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} spellCheck={false}
      className={`bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors ${mono ? "font-mono" : ""} ${className}`} />
  );
}

export function SelectInput({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: { label: string; value: string }[] | string[];
}) {
  const normalized = options.map((o) => typeof o === "string" ? { label: o, value: o } : o);
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-600 transition-colors">
      {normalized.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

export function KVList({ items, onChange, keyPlaceholder = "KEY", valPlaceholder = "value", maxLength = 100 }: {
  items: { key: string; value: string }[];
  onChange: (items: { key: string; value: string }[]) => void;
  keyPlaceholder?: string;
  valPlaceholder?: string;
  maxLength?: number;
}) {
  const update = (i: number, field: "key" | "value", v: string) => {
    const next = [...items]; next[i] = { ...next[i], [field]: v.slice(0, maxLength) }; onChange(next);
  };
  return (
    <div className="flex flex-col gap-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input type="text" value={item.key} onChange={(e) => update(i, "key", e.target.value)} placeholder={keyPlaceholder} spellCheck={false}
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors" />
          <input type="text" value={item.value} onChange={(e) => update(i, "value", e.target.value)} placeholder={valPlaceholder} spellCheck={false}
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors" />
          <button onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="p-1.5 text-zinc-600 hover:text-red-400 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button onClick={() => onChange([...items, { key: "", value: "" }])}
        className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors self-start">
        <Plus className="w-3.5 h-3.5" /> Add row
      </button>
    </div>
  );
}
