"use client";

import { useState, useMemo } from "react";
import { Search, Copy, Check } from "lucide-react";
import { useDebounce } from "@/lib/hooks/use-debounce";

// ── Types ─────────────────────────────────────────────────────────────────────

interface MatchResult {
  line: string;
  lineIndex: number;
  matched: boolean;
  fullMatch: string | null;
  matchStart: number;
  matchEnd: number;
  groups: Record<string, string>;
}

// ── Safe regex builder ────────────────────────────────────────────────────────

function buildSafeRegex(
  pattern: string,
  flags: string
): { regex: RegExp | null; error: string | null } {
  if (!pattern) return { regex: null, error: null };
  try {
    const regex = new RegExp(pattern, flags + "g");
    return { regex, error: null };
  } catch (e) {
    return {
      regex: null,
      error: e instanceof Error ? e.message : "Invalid regex",
    };
  }
}

// ── Match processor ───────────────────────────────────────────────────────────

const MAX_EXEC_CALLS = 10_000;

function processLines(
  lines: string[],
  pattern: string,
  flags: string
): { results: MatchResult[]; execCount: number } {
  const { regex } = buildSafeRegex(pattern, flags);
  if (!regex) {
    return {
      results: lines.map((line, i) => ({
        line,
        lineIndex: i,
        matched: false,
        fullMatch: null,
        matchStart: 0,
        matchEnd: 0,
        groups: {},
      })),
      execCount: 0,
    };
  }

  const results: MatchResult[] = [];
  let execCount = 0;

  for (let i = 0; i < lines.length; i++) {
    if (execCount >= MAX_EXEC_CALLS) {
      // bail — add remaining lines as unmatched
      for (let j = i; j < lines.length; j++) {
        results.push({
          line: lines[j],
          lineIndex: j,
          matched: false,
          fullMatch: null,
          matchStart: 0,
          matchEnd: 0,
          groups: {},
        });
      }
      break;
    }

    // Build a fresh single-use regex per line to avoid lastIndex drift issues
    let lineRegex: RegExp | null = null;
    try {
      lineRegex = new RegExp(pattern, flags);
    } catch {
      results.push({
        line: lines[i],
        lineIndex: i,
        matched: false,
        fullMatch: null,
        matchStart: 0,
        matchEnd: 0,
        groups: {},
      });
      continue;
    }

    execCount++;
    const m = lineRegex.exec(lines[i]);

    if (m) {
      results.push({
        line: lines[i],
        lineIndex: i,
        matched: true,
        fullMatch: m[0],
        matchStart: m.index,
        matchEnd: m.index + m[0].length,
        groups: m.groups ? { ...m.groups } : {},
      });
    } else {
      results.push({
        line: lines[i],
        lineIndex: i,
        matched: false,
        fullMatch: null,
        matchStart: 0,
        matchEnd: 0,
        groups: {},
      });
    }
  }

  return { results, execCount };
}

// ── Quick patterns ────────────────────────────────────────────────────────────

const QUICK_PATTERNS = [
  {
    label: "Apache",
    pattern:
      String.raw`(?<ip>\d+\.\d+\.\d+\.\d+).*\[(?<time>[^\]]+)\].*"(?<method>\w+) (?<path>[^\s]+)`,
  },
  {
    label: "JSON field",
    pattern: String.raw`"(?<key>[^"]+)":\s*"(?<value>[^"]+)"`,
  },
  {
    label: "Log level",
    pattern: String.raw`(?<level>ERROR|WARN|INFO|DEBUG)`,
  },
  {
    label: "Timestamp",
    pattern: String.raw`(?<ts>\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2})`,
  },
];

const SAMPLE_LOGS = `192.168.1.100 - frank [10/Oct/2000:13:55:36 -0700] "GET /apache_pb.gif HTTP/1.0" 200 2326
10.0.0.1 - - [11/Mar/2024:08:23:11 +0000] "POST /api/login HTTP/1.1" 401 128
2024-03-15T14:32:01 ERROR Failed to connect to database: timeout after 30s
2024-03-15 14:32:05 INFO Service started successfully on port 8080
2024-03-15 14:32:10 WARN Memory usage at 87% — consider scaling up
{"level":"error","ts":"2024-03-15T14:33:01Z","msg":"connection refused","host":"db-primary"}
{"level":"info","ts":"2024-03-15T14:33:05Z","msg":"request handled","path":"/health"}`;

// ── Highlighted line renderer ─────────────────────────────────────────────────

function HighlightedLine({
  line,
  start,
  end,
}: {
  line: string;
  start: number;
  end: number;
}) {
  if (start === end || end === 0) {
    return <span className="text-zinc-400">{line}</span>;
  }
  return (
    <>
      <span className="text-zinc-400">{line.slice(0, start)}</span>
      <span className="bg-teal-500/30 text-teal-200 rounded px-0.5">
        {line.slice(start, end)}
      </span>
      <span className="text-zinc-400">{line.slice(end)}</span>
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RegexLogParserPage() {
  const [pattern, setPattern] = useState(QUICK_PATTERNS[2].pattern);
  const [flagI, setFlagI] = useState(false);
  const [flagM, setFlagM] = useState(false);
  const [logInput, setLogInput] = useState(SAMPLE_LOGS);
  const [copied, setCopied] = useState(false);

  const debouncedPattern = useDebounce(pattern, 300);

  const flags = `${flagI ? "i" : ""}${flagM ? "m" : ""}`;
  const { regex, error } = useMemo(
    () => buildSafeRegex(debouncedPattern, flags),
    [debouncedPattern, flags]
  );

  const { results, execCount } = useMemo(() => {
    if (!regex || !debouncedPattern) {
      const lines = logInput.split("\n");
      return {
        results: lines.map((line, i) => ({
          line,
          lineIndex: i,
          matched: false,
          fullMatch: null,
          matchStart: 0,
          matchEnd: 0,
          groups: {},
        })),
        execCount: 0,
      };
    }
    const lines = logInput.split("\n");
    return processLines(lines, debouncedPattern, flags);
  }, [regex, debouncedPattern, logInput, flags]);

  const matchCount = results.filter((r) => r.matched).length;
  const hitLimit = execCount >= MAX_EXEC_CALLS;

  const copyPattern = () => {
    navigator.clipboard.writeText(pattern);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
          <Search className="w-4 h-4 text-teal-400" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">Regex Log Parser</h1>
          <p className="text-xs text-zinc-500">
            Test regex against log lines and extract named capture groups —
            client-side
          </p>
        </div>
      </div>

      {/* Section 1: Pattern */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-3 shrink-0">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Pattern
          </p>
          <button
            onClick={copyPattern}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-colors"
          >
            {copied ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        {/* Pattern input + flags */}
        <div className="flex gap-2 items-start">
          <div className="flex-1 flex flex-col gap-1">
            <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden focus-within:border-zinc-600 transition-colors">
              <span className="px-3 py-2 text-zinc-600 font-mono text-sm select-none">
                /
              </span>
              <input
                type="text"
                value={pattern}
                maxLength={500}
                onChange={(e) => setPattern(e.target.value.slice(0, 500))}
                placeholder="(?<level>ERROR|WARN|INFO|DEBUG)"
                spellCheck={false}
                className="flex-1 bg-transparent py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none font-mono"
              />
              <span className="px-3 py-2 text-zinc-600 font-mono text-sm select-none">
                /{flags}
              </span>
            </div>
            {error && (
              <p className="text-xs text-red-400 font-mono">{error}</p>
            )}
            {!error && pattern && (
              <p className="text-xs text-zinc-600">
                {pattern.length}/500 chars
              </p>
            )}
          </div>

          {/* Flags */}
          <div className="flex gap-3 pt-2.5">
            <label className="flex items-center gap-1.5 text-sm text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={flagI}
                onChange={(e) => setFlagI(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-900 accent-teal-500"
              />
              <span className="text-xs font-mono text-zinc-400">
                i (case insensitive)
              </span>
            </label>
            <label className="flex items-center gap-1.5 text-sm text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={flagM}
                onChange={(e) => setFlagM(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-900 accent-teal-500"
              />
              <span className="text-xs font-mono text-zinc-400">
                m (multiline)
              </span>
            </label>
          </div>
        </div>

        {/* Quick pattern buttons */}
        <div className="flex flex-wrap gap-2">
          {QUICK_PATTERNS.map((qp) => (
            <button
              key={qp.label}
              onClick={() => setPattern(qp.pattern)}
              className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                pattern === qp.pattern
                  ? "bg-teal-500/20 border-teal-500/40 text-teal-300"
                  : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {qp.label}
            </button>
          ))}
        </div>
      </div>

      {/* Section 2: Log input */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Log Input
          </p>
          <span className="text-xs text-zinc-600">
            {logInput.length.toLocaleString()} / 50,000 chars
          </span>
        </div>
        <textarea
          value={logInput}
          maxLength={50_000}
          onChange={(e) => setLogInput(e.target.value.slice(0, 50_000))}
          rows={6}
          spellCheck={false}
          placeholder="Paste log lines here…"
          className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors font-mono resize-y w-full"
        />
      </div>

      {/* Section 3: Results */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-3 flex-1 overflow-y-auto no-scrollbar">
        <div className="flex items-center gap-3 shrink-0">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Results
          </p>
          <span
            className={`px-2 py-0.5 text-xs rounded-full font-medium ${
              matchCount > 0
                ? "bg-teal-500/20 text-teal-300"
                : "bg-zinc-800 text-zinc-500"
            }`}
          >
            {matchCount} match{matchCount !== 1 ? "es" : ""}
          </span>
          {hitLimit && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-300">
              Iteration limit reached (10,000 exec calls)
            </span>
          )}
        </div>

        {!debouncedPattern && (
          <p className="text-xs text-zinc-600">
            Enter a regex pattern above to see matches.
          </p>
        )}

        {debouncedPattern && error && (
          <p className="text-xs text-red-400">
            Fix the regex pattern to see results.
          </p>
        )}

        {debouncedPattern && !error && results.length > 0 && (
          <div className="flex flex-col gap-2">
            {results.map((r) => (
              <div
                key={r.lineIndex}
                className={`rounded-lg border p-3 ${
                  r.matched
                    ? "bg-zinc-950 border-teal-500/20"
                    : "bg-zinc-950/50 border-zinc-800/50 opacity-50"
                }`}
              >
                {/* Line with highlight */}
                <p className="font-mono text-xs break-all leading-5">
                  <span className="text-zinc-600 select-none mr-2">
                    {String(r.lineIndex + 1).padStart(3, " ")}
                  </span>
                  {r.matched ? (
                    <HighlightedLine
                      line={r.line}
                      start={r.matchStart}
                      end={r.matchEnd}
                    />
                  ) : (
                    <span className="text-zinc-500">{r.line}</span>
                  )}
                </p>

                {/* Named groups table */}
                {r.matched && Object.keys(r.groups).length > 0 && (
                  <div className="mt-2 pt-2 border-t border-zinc-800">
                    <table className="w-full text-xs">
                      <thead>
                        <tr>
                          <th className="text-left text-zinc-600 font-medium pb-1 pr-4 w-32">
                            Group
                          </th>
                          <th className="text-left text-zinc-600 font-medium pb-1">
                            Value
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(r.groups).map(([k, v]) => (
                          <tr key={k}>
                            <td className="font-mono text-teal-400 pr-4 py-0.5">
                              {k}
                            </td>
                            <td className="font-mono text-zinc-300 py-0.5 break-all">
                              {v ?? ""}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
