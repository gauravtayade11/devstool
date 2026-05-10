"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { GitCompare, Trash2, Copy, ArrowLeftRight, ChevronUp, ChevronDown } from "lucide-react";
import * as Diff from "diff";
type DiffMode = "lines" | "words" | "chars";

const LINE_H = 24; // px — matches leading-6 at text-sm

export default function DiffCheckerPage() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [mode, setMode] = useState<DiffMode>("lines");
  const [ignoreWs, setIgnoreWs] = useState(false);
  const [hunkIdx, setHunkIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  const leftDiffRef = useRef<HTMLDivElement>(null);
  const rightDiffRef = useRef<HTMLDivElement>(null);
  const syncRef = useRef(false);

  // Reset hunk navigation when inputs or mode change
  useEffect(() => { setHunkIdx(0); }, [left, right, mode, ignoreWs]);

  const diff = useMemo(() => {
    if (!left && !right) return [];
    const opts = ignoreWs ? { ignoreWhitespace: true } : {};
    if (mode === "lines") return Diff.diffLines(left, right, opts);
    if (mode === "words") return Diff.diffWords(left, right);
    return Diff.diffChars(left, right);
  }, [left, right, mode, ignoreWs]);

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

  const hasChanges = diff.some((p) => p.added || p.removed);

  // Build per-panel line arrays for line mode
  const { leftLines, rightLines } = useMemo(() => {
    if (mode !== "lines") return { leftLines: null, rightLines: null };
    const lLines: { text: string; type: "removed" | "unchanged" }[] = [];
    const rLines: { text: string; type: "added" | "unchanged" }[] = [];
    diff.forEach((part) => {
      const ls = part.value.split("\n");
      if (ls[ls.length - 1] === "") ls.pop();
      if (!part.added) ls.forEach((l) => lLines.push({ text: l, type: part.removed ? "removed" : "unchanged" }));
      if (!part.removed) ls.forEach((l) => rLines.push({ text: l, type: part.added ? "added" : "unchanged" }));
    });
    return { leftLines: lLines, rightLines: rLines };
  }, [diff, mode]);

  // Hunk start lines for jump-to-change (based on left panel line numbers)
  const hunks = useMemo(() => {
    if (!leftLines) return [];
    const positions: number[] = [];
    let inHunk = false;
    leftLines.forEach((line, i) => {
      if (line.type === "removed" && !inHunk) { positions.push(i); inHunk = true; }
      else if (line.type === "unchanged") inHunk = false;
    });
    return positions;
  }, [leftLines]);

  const scrollToHunk = useCallback((idx: number) => {
    const lineNum = hunks[idx];
    if (lineNum == null) return;
    const top = Math.max(0, lineNum * LINE_H - 48);
    if (leftDiffRef.current) leftDiffRef.current.scrollTop = top;
    if (rightDiffRef.current) rightDiffRef.current.scrollTop = top;
  }, [hunks]);

  const goToChange = (dir: 1 | -1) => {
    const next = Math.max(0, Math.min(hunks.length - 1, hunkIdx + dir));
    setHunkIdx(next);
    scrollToHunk(next);
  };

  // Scroll sync between the two diff panels
  const handleLeftScroll = useCallback(() => {
    if (syncRef.current || !rightDiffRef.current || !leftDiffRef.current) return;
    syncRef.current = true;
    rightDiffRef.current.scrollTop = leftDiffRef.current.scrollTop;
    syncRef.current = false;
  }, []);

  const handleRightScroll = useCallback(() => {
    if (syncRef.current || !leftDiffRef.current || !rightDiffRef.current) return;
    syncRef.current = true;
    leftDiffRef.current.scrollTop = rightDiffRef.current.scrollTop;
    syncRef.current = false;
  }, []);

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

  const unit = mode === "lines" ? "lines" : mode === "words" ? "words" : "chars";

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <GitCompare className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Diff Checker</h1>
            <p className="text-xs text-zinc-500">Compare two texts — live, side by side</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode toggle */}
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

          {/* Ignore whitespace */}
          <button
            onClick={() => setIgnoreWs((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors ${
              ignoreWs
                ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-300"
                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            <span className="font-mono text-[11px]">⎵</span>
            Ignore WS
          </button>

          <button onClick={swap} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
            <ArrowLeftRight className="w-3.5 h-3.5" /> Swap
          </button>
          <button onClick={copyDiff} disabled={!hasChanges} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors disabled:opacity-40">
            <Copy className="w-3.5 h-3.5" /> {copied ? "Copied!" : "Copy diff"}
          </button>
          <button
            onClick={() => { setLeft(""); setRight(""); }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        </div>
      </div>

      {/* Input textareas — always visible */}
      <div className="grid grid-cols-2 gap-3 shrink-0">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-400">Original</label>
          <textarea
            value={left}
            onChange={(e) => setLeft(e.target.value)}
            placeholder="Paste original text here..."
            className="h-36 w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm font-mono text-zinc-200 placeholder-zinc-600 resize-none focus:outline-none focus:border-zinc-600 no-scrollbar"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-400">Modified</label>
          <textarea
            value={right}
            onChange={(e) => setRight(e.target.value)}
            placeholder="Paste modified text here..."
            className="h-36 w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm font-mono text-zinc-200 placeholder-zinc-600 resize-none focus:outline-none focus:border-zinc-600 no-scrollbar"
          />
        </div>
      </div>

      {/* Stats + jump-to-change bar */}
      <div className="flex items-center justify-between shrink-0 px-0.5">
        <div className="flex items-center gap-4 text-xs">
          {!left && !right ? (
            <span className="text-zinc-600">Paste text above — diff updates live</span>
          ) : hasChanges ? (
            <>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                +{stats.added} {unit} added
              </span>
              <span className="flex items-center gap-1.5 text-red-400">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                -{stats.removed} {unit} removed
              </span>
            </>
          ) : (
            <span className="text-zinc-500">Files are identical</span>
          )}
        </div>

        {/* Jump to change — line mode only */}
        {mode === "lines" && hunks.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-zinc-500">{hunkIdx + 1} / {hunks.length} change{hunks.length !== 1 ? "s" : ""}</span>
            <button
              onClick={() => goToChange(-1)}
              disabled={hunkIdx === 0}
              className="p-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"
              aria-label="Previous change"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => goToChange(1)}
              disabled={hunkIdx === hunks.length - 1}
              className="p-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"
              aria-label="Next change"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Live diff panels */}
      <div className="grid grid-cols-2 gap-3 flex-1 min-h-0">
        {/* Left */}
        <div
          ref={leftDiffRef}
          onScroll={handleLeftScroll}
          className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-auto no-scrollbar"
        >
          {!left && !right ? (
            <div className="h-full min-h-[80px] flex items-center justify-center text-zinc-600 text-xs">
              Diff will appear here
            </div>
          ) : mode === "lines" && leftLines ? (
            leftLines.map((line, i) => (
              <div
                key={i}
                className={`flex min-w-0 ${line.type === "removed" ? "bg-red-500/10" : ""}`}
              >
                <span className="w-10 shrink-0 text-right pr-2 text-[11px] text-zinc-600 select-none leading-6 border-r border-zinc-800/60 font-mono">
                  {i + 1}
                </span>
                <span className="w-5 shrink-0 text-center text-[11px] text-zinc-600 select-none leading-6 font-mono">
                  {line.type === "removed" ? "-" : " "}
                </span>
                <span className={`flex-1 pl-1 pr-3 text-sm font-mono leading-6 whitespace-pre ${line.type === "removed" ? "text-red-300" : "text-zinc-400"}`}>
                  {line.text || " "}
                </span>
              </div>
            ))
          ) : (
            <div className="p-3 text-sm font-mono leading-6 whitespace-pre-wrap break-all">
              {diff.filter((p) => !p.added).map((part, i) => (
                <span key={i} className={part.removed ? "bg-red-500/20 text-red-300 rounded px-0.5" : "text-zinc-400"}>
                  {part.value}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right */}
        <div
          ref={rightDiffRef}
          onScroll={handleRightScroll}
          className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-auto no-scrollbar"
        >
          {!left && !right ? (
            <div className="h-full min-h-[80px] flex items-center justify-center text-zinc-600 text-xs">
              Diff will appear here
            </div>
          ) : mode === "lines" && rightLines ? (
            rightLines.map((line, i) => (
              <div
                key={i}
                className={`flex min-w-0 ${line.type === "added" ? "bg-emerald-500/10" : ""}`}
              >
                <span className="w-10 shrink-0 text-right pr-2 text-[11px] text-zinc-600 select-none leading-6 border-r border-zinc-800/60 font-mono">
                  {i + 1}
                </span>
                <span className="w-5 shrink-0 text-center text-[11px] text-zinc-600 select-none leading-6 font-mono">
                  {line.type === "added" ? "+" : " "}
                </span>
                <span className={`flex-1 pl-1 pr-3 text-sm font-mono leading-6 whitespace-pre ${line.type === "added" ? "text-emerald-300" : "text-zinc-400"}`}>
                  {line.text || " "}
                </span>
              </div>
            ))
          ) : (
            <div className="p-3 text-sm font-mono leading-6 whitespace-pre-wrap break-all">
              {diff.filter((p) => !p.removed).map((part, i) => (
                <span key={i} className={part.added ? "bg-emerald-500/20 text-emerald-300 rounded px-0.5" : "text-zinc-400"}>
                  {part.value}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
