"use client";

import { useState, useCallback } from "react";
import yaml from "js-yaml";
import { ArrowLeftRight, Copy, Check, Trash2 } from "lucide-react";

type Direction = "json-to-yaml" | "yaml-to-json";

function detect(input: string): Direction {
  const trimmed = input.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) return "json-to-yaml";
  return "yaml-to-json";
}

function convert(input: string, dir: Direction): { output: string; error: string | null } {
  if (!input.trim()) return { output: "", error: null };
  try {
    if (dir === "json-to-yaml") {
      const parsed = JSON.parse(input);
      return { output: yaml.dump(parsed, { indent: 2, lineWidth: -1 }), error: null };
    } else {
      const parsed = yaml.load(input);
      return { output: JSON.stringify(parsed, null, 2), error: null };
    }
  } catch (e: unknown) {
    return { output: "", error: e instanceof Error ? e.message : String(e) };
  }
}

function CopyBtn({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      disabled={!value}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors disabled:opacity-40"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export default function JsonYamlPage() {
  const [input, setInput] = useState("");
  const [dir, setDir] = useState<Direction>("json-to-yaml");
  const [autoDetect, setAutoDetect] = useState(true);

  const effectiveDir = autoDetect && input.trim() ? detect(input) : dir;
  const { output, error } = convert(input, effectiveDir);

  const swap = useCallback(() => {
    if (output) {
      setInput(output);
      setDir(effectiveDir === "json-to-yaml" ? "yaml-to-json" : "json-to-yaml");
      setAutoDetect(false);
    }
  }, [output, effectiveDir]);

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <ArrowLeftRight className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">JSON ↔ YAML Converter</h1>
            <p className="text-xs text-zinc-500">Convert between JSON and YAML instantly</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Direction toggle */}
          <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-xs">
            {(["json-to-yaml", "yaml-to-json"] as Direction[]).map((d) => (
              <button
                key={d}
                onClick={() => { setDir(d); setAutoDetect(false); }}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  effectiveDir === d ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {d === "json-to-yaml" ? "JSON → YAML" : "YAML → JSON"}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-1.5 text-xs text-zinc-500 cursor-pointer hover:text-zinc-300 transition-colors">
            <input type="checkbox" checked={autoDetect} onChange={(e) => setAutoDetect(e.target.checked)}
              className="rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-0" />
            Auto-detect
          </label>
          <button onClick={swap} disabled={!output}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white disabled:opacity-40 transition-colors">
            <ArrowLeftRight className="w-3.5 h-3.5" /> Swap
          </button>
          <button onClick={() => setInput("")} disabled={!input}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-red-400 disabled:opacity-40 transition-colors">
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        </div>
      </div>

      {/* Two panels */}
      <div className="grid grid-cols-2 gap-3 flex-1 min-h-0">
        {/* Input */}
        <div className="flex flex-col gap-2 min-h-0">
          <div className="flex items-center justify-between shrink-0">
            <label className="text-xs font-medium text-zinc-400">
              {effectiveDir === "json-to-yaml" ? "JSON" : "YAML"} Input
            </label>
            <span className="text-xs text-zinc-600">{input.split("\n").length} lines</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={effectiveDir === "json-to-yaml" ? '{\n  "key": "value"\n}' : "key: value"}
            spellCheck={false}
            className="flex-1 w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm font-mono text-zinc-200 placeholder-zinc-600 resize-none focus:outline-none focus:border-zinc-600 transition-colors no-scrollbar"
          />
        </div>

        {/* Output */}
        <div className="flex flex-col gap-2 min-h-0">
          <div className="flex items-center justify-between shrink-0">
            <label className="text-xs font-medium text-zinc-400">
              {effectiveDir === "json-to-yaml" ? "YAML" : "JSON"} Output
            </label>
            <CopyBtn value={output} />
          </div>
          {error ? (
            <div className="flex-1 bg-zinc-900 border border-red-500/30 rounded-lg p-3 font-mono text-xs text-red-400 overflow-auto no-scrollbar">
              {error}
            </div>
          ) : (
            <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-3 font-mono text-sm text-zinc-300 overflow-auto no-scrollbar whitespace-pre">
              {output || <span className="text-zinc-700">Output will appear here...</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
