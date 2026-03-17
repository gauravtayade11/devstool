"use client";

import { useState, useMemo } from "react";
import { GitCompare, Trash2, Copy, ArrowLeftRight, Pencil } from "lucide-react";
import * as Diff from "diff";

type DiffMode = "lines" | "words" | "chars";
type ViewState = "input" | "diff";

export default function DiffCheckerPage() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [mode, setMode] = useState<DiffMode>("lines");
  const [view, setView] = useState<ViewState>("input");
  const [copied, setCopied] = useState(false);

  const diff = useMemo(() => {
    if (!left && !right) return [];
    if (mode === "lines") return Diff.diffLines(left, right);
    if (mode === "words") return Diff.diffWords(left, right);
    return Diff.diffChars(left, right);
  }, [left, right, mode]);

  const stats = useMemo(() => {
    let added = 0, removed = 0;
    diff.forEach((part) => {
      const count = mode === "lines"
        ? (part.value.match(/\n/g) || []).length || (part.value ? 1 : 0)
        : part.count ?? 0;
      if (part.added) added += count;
      if (part.removed) removed += count;
    });
    return { added, removed };
  }, [diff, mode]);

  const swap = () => { setLeft(right); setRight(left); };

  const copyDiff = () => {
    const text = diff
      .map((p) => {
        const prefix = p.added ? "+ " : p.removed ? "- " : "  ";
        return p.value
          .split("\n")
          .filter((l, i, arr) => !(i === arr.length - 1 && l === ""))
          .map((l) => prefix + l)
          .join("\n");
      })
      .join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const hasChanges = diff.some((p) => p.added || p.removed);

  // Build per-panel line arrays for diff view
  const leftLines = useMemo(() => {
    const lines: { text: string; type: "removed" | "unchanged" }[] = [];
    if (mode !== "lines") return lines;
    diff.forEach((part) => {
      if (part.added) return;
      const ls = part.value.split("\n").filter((l, i, arr) => !(i === arr.length - 1 && l === ""));
      ls.forEach((l) => lines.push({ text: l, type: part.removed ? "removed" : "unchanged" }));
    });
    return lines;
  }, [diff, mode]);

  const rightLines = useMemo(() => {
    const lines: { text: string; type: "added" | "unchanged" }[] = [];
    if (mode !== "lines") return lines;
    diff.forEach((part) => {
      if (part.removed) return;
      const ls = part.value.split("\n").filter((l, i, arr) => !(i === arr.length - 1 && l === ""));
      ls.forEach((l) => lines.push({ text: l, type: part.added ? "added" : "unchanged" }));
    });
    return lines;
  }, [diff, mode]);

  const compare = () => { if (left || right) setView("diff"); };
  const edit = () => setView("input");

  return (
    <div className="flex flex-col gap-4" style={{ height: "calc(100vh - 9rem)" }}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <GitCompare className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Diff Checker</h1>
            <p className="text-xs text-zinc-500">Compare two texts side by side</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-xs">
            {(["lines", "words", "chars"] as DiffMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-1.5 rounded-md capitalize transition-colors ${
                  mode === m ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <button onClick={swap} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
            <ArrowLeftRight className="w-3.5 h-3.5" /> Swap
          </button>
          {view === "input" ? (
            <button
              onClick={compare}
              disabled={!left && !right}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition-colors disabled:opacity-40"
            >
              Compare
            </button>
          ) : (
            <>
              <button onClick={copyDiff} disabled={!hasChanges} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors disabled:opacity-40">
                <Copy className="w-3.5 h-3.5" /> {copied ? "Copied!" : "Copy diff"}
              </button>
              <button onClick={edit} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
            </>
          )}
          <button onClick={() => { setLeft(""); setRight(""); setView("input"); }} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-red-400 transition-colors">
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        </div>
      </div>

      {/* Stats */}
      {view === "diff" && (
        <div className="flex items-center gap-4 text-xs px-1 shrink-0">
          {hasChanges ? (
            <>
              <span className="text-emerald-400">+{stats.added} {mode === "lines" ? "lines" : mode === "words" ? "words" : "chars"} added</span>
              <span className="text-red-400">-{stats.removed} {mode === "lines" ? "lines" : mode === "words" ? "words" : "chars"} removed</span>
            </>
          ) : (
            <span className="text-zinc-500">Files are identical</span>
          )}
        </div>
      )}

      {/* Panels */}
      <div className="grid grid-cols-2 gap-3 flex-1 min-h-0">
        {/* Left */}
        <div className="flex flex-col gap-2 min-h-0">
          <label className="text-xs font-medium text-zinc-400 shrink-0">Original</label>
          {view === "input" ? (
            <textarea
              value={left}
              onChange={(e) => setLeft(e.target.value)}
              placeholder="Paste original text here..."
              className="flex-1 w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm font-mono text-zinc-200 placeholder-zinc-600 resize-none focus:outline-none focus:border-zinc-600 no-scrollbar"
            />
          ) : (
            <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-3 font-mono text-sm overflow-auto no-scrollbar">
              {mode === "lines" ? leftLines.map((line, i) => (
                <div key={i} className={`px-1 py-0.5 rounded-sm ${line.type === "removed" ? "bg-red-500/15 text-red-300" : "text-zinc-400"}`}>
                  <span className="select-none mr-2 text-xs text-zinc-600">{line.type === "removed" ? "-" : " "}</span>
                  {line.text || "\u00A0"}
                </div>
              )) : (
                <div className="whitespace-pre-wrap break-all leading-6">
                  {diff.filter(p => !p.added).map((part, i) => (
                    <span key={i} className={part.removed ? "bg-red-500/20 text-red-300 rounded px-0.5" : "text-zinc-400"}>
                      {part.value}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right */}
        <div className="flex flex-col gap-2 min-h-0">
          <label className="text-xs font-medium text-zinc-400 shrink-0">Modified</label>
          {view === "input" ? (
            <textarea
              value={right}
              onChange={(e) => setRight(e.target.value)}
              placeholder="Paste modified text here..."
              className="flex-1 w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm font-mono text-zinc-200 placeholder-zinc-600 resize-none focus:outline-none focus:border-zinc-600 no-scrollbar"
            />
          ) : (
            <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-3 font-mono text-sm overflow-auto no-scrollbar">
              {mode === "lines" ? rightLines.map((line, i) => (
                <div key={i} className={`px-1 py-0.5 rounded-sm ${line.type === "added" ? "bg-emerald-500/15 text-emerald-300" : "text-zinc-400"}`}>
                  <span className="select-none mr-2 text-xs text-zinc-600">{line.type === "added" ? "+" : " "}</span>
                  {line.text || "\u00A0"}
                </div>
              )) : (
                <div className="whitespace-pre-wrap break-all leading-6">
                  {diff.filter(p => !p.removed).map((part, i) => (
                    <span key={i} className={part.added ? "bg-emerald-500/20 text-emerald-300 rounded px-0.5" : "text-zinc-400"}>
                      {part.value}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
