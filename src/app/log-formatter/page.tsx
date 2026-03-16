"use client";

import { useState, useMemo } from "react";
import { Search, Trash2, FileJson, AlertCircle, ChevronDown, ChevronUp, ClipboardPaste, FileDown } from "lucide-react";
import { CopyButton } from "@/components/ui/copy-button";
import { useDebounce } from "@/lib/hooks/use-debounce";

interface LogEntry {
  id: number;
  raw: string;
  parsed: any | null;
  level?: "info" | "warn" | "error" | "debug" | "unknown";
  timestamp?: string;
  message?: string;
  isJson: boolean;
}

const SAMPLE_LOGS = `{"level":"info","time":"2026-03-16T10:00:00Z","msg":"Server started on port 8080","reqId":"abcd-1234"}
[INFO] 2026-03-16 10:00:05 Database connection established
{"level":"debug","time":"2026-03-16T10:01:12Z","msg":"Redis cache hit","key":"user:123"}
{"level":"warn","time":"2026-03-16T10:02:45Z","msg":"High memory usage detected","usage":"85%"}
ERROR: Failed to authenticate user credentials
{"level":"error","time":"2026-03-16T10:05:30Z","msg":"Unhandled exception in payment processing","err":{"code":500,"detail":"Stripe API timeout"}}
{"level":"info","time":"2026-03-16T10:06:00Z","msg":"Payment processing recovered"}`;

const LEVEL_STYLES: Record<string, { badge: string; row: string; text: string }> = {
  error:   { badge: "text-red-400 bg-red-400/10 border-red-500/30",    row: "border-l-2 border-red-500/40",    text: "text-red-300" },
  warn:    { badge: "text-yellow-400 bg-yellow-400/10 border-yellow-500/30", row: "border-l-2 border-yellow-500/40", text: "text-yellow-200" },
  info:    { badge: "text-blue-400 bg-blue-400/10 border-blue-500/30",  row: "border-l-2 border-blue-500/40",  text: "text-zinc-200" },
  debug:   { badge: "text-purple-400 bg-purple-400/10 border-purple-500/30", row: "border-l-2 border-purple-500/40", text: "text-zinc-400" },
  unknown: { badge: "text-zinc-400 bg-zinc-800 border-zinc-700",        row: "",                               text: "text-zinc-400" },
};

export default function LogFormatter() {
  const [inputLogs, setInputLogs] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevels, setSelectedLevels] = useState<Record<string, boolean>>({
    error: true, warn: true, info: true, debug: true, unknown: true,
  });
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [inputOpen, setInputOpen] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 200);

  const parsedLogs = useMemo<LogEntry[]>(() => {
    if (!inputLogs.trim()) return [];

    return inputLogs.split("\n").filter(line => line.trim()).map((line, index) => {
      let isJson = false;
      let parsed = null;
      let level: LogEntry["level"] = "unknown";
      let timestamp = "";
      let message = line;

      if (line.trim().startsWith("{") && line.trim().endsWith("}")) {
        try {
          parsed = JSON.parse(line);
          isJson = true;
          const lvl = (parsed.level || parsed.severity || parsed.logLevel || "").toLowerCase();
          if (["err", "error", "fatal", "panic"].includes(lvl)) level = "error";
          else if (["warn", "warning"].includes(lvl)) level = "warn";
          else if (["info", "notice"].includes(lvl)) level = "info";
          else if (["debug", "trace"].includes(lvl)) level = "debug";
          timestamp = parsed.time || parsed.timestamp || parsed.date || parsed.ts || "";
          message = parsed.message || parsed.msg || "";
        } catch {
          isJson = false;
        }
      }

      if (!isJson) {
        const lower = line.toLowerCase();
        if (lower.includes("error") || lower.includes("fatal") || lower.includes("exception")) level = "error";
        else if (lower.includes("warn")) level = "warn";
        else if (lower.includes("info")) level = "info";
        else if (lower.includes("debug")) level = "debug";
        const tsMatch = line.match(/\b\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}\b/);
        if (tsMatch) timestamp = tsMatch[0];
      }

      return { id: index, raw: line, parsed, level, timestamp, message: message || line, isJson };
    });
  }, [inputLogs]);

  const filteredLogs = useMemo(() => {
    return parsedLogs.filter(log => {
      if (!selectedLevels[log.level!]) return false;
      if (debouncedSearch) return log.raw.toLowerCase().includes(debouncedSearch.toLowerCase());
      return true;
    });
  }, [parsedLogs, selectedLevels, debouncedSearch]);

  // Count per level for the stats bar
  const counts = useMemo(() => {
    return parsedLogs.reduce((acc, log) => {
      acc[log.level!] = (acc[log.level!] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [parsedLogs]);

  const toggleLevel = (level: string) => {
    setSelectedLevels(prev => ({ ...prev, [level]: !prev[level] }));
  };

  const clearLogs = () => {
    setInputLogs("");
    setExpandedRow(null);
  };

  const downloadLogs = () => {
    const text = filteredLogs.map(l => l.raw).join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "logs.log";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">

      {/* ── Header ── */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center">
            <FileJson className="w-6 h-6 mr-3 text-cyan-400" />
            Log Formatter
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Format JSON logs, filter by severity, and inspect complex payloads.</p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/30 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── Stats + Filter Bar ── */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {(["error", "warn", "info", "debug", "unknown"] as const).map(lvl => (
          <button
            key={lvl}
            onClick={() => toggleLevel(lvl)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              selectedLevels[lvl]
                ? LEVEL_STYLES[lvl].badge
                : "bg-zinc-900/50 border-zinc-800 text-zinc-600"
            }`}
          >
            <span className="capitalize">{lvl === "unknown" ? "raw" : lvl}</span>
            {counts[lvl] !== undefined && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${selectedLevels[lvl] ? "bg-black/20" : "bg-zinc-800 text-zinc-500"}`}>
                {counts[lvl]}
              </span>
            )}
          </button>
        ))}

        <div className="ml-auto flex items-center space-x-2 text-xs text-zinc-500">
          <span>{filteredLogs.length} / {parsedLogs.length} lines</span>
          <CopyButton
            text={filteredLogs.map(l => l.raw).join("\n")}
            disabled={filteredLogs.length === 0}
            className="text-zinc-500 hover:text-white hover:bg-zinc-800"
          />
          <button
            onClick={downloadLogs}
            disabled={filteredLogs.length === 0}
            className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-md transition-colors disabled:opacity-40"
            aria-label="Download logs"
            title="Download logs"
          >
            <FileDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Log Viewer ── */}
      <div className="flex-1 min-h-0 rounded-xl border border-zinc-800 bg-[#0d0d0f] overflow-hidden flex flex-col shadow-2xl shadow-black/50">
        {filteredLogs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 p-8 text-center">
            <AlertCircle className="w-10 h-10 mb-3 opacity-20" />
            <p className="text-sm">
              {parsedLogs.length === 0
                ? "Open the input panel below and paste your logs"
                : "No logs match the current filters"}
            </p>
            {parsedLogs.length === 0 && (
              <button
                onClick={() => setInputOpen(true)}
                className="mt-4 flex items-center space-x-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm transition-colors"
              >
                <ClipboardPaste className="w-4 h-4" />
                <span>Paste Logs</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-[13px] divide-y divide-zinc-800/40">
            {filteredLogs.map(log => {
              const styles = LEVEL_STYLES[log.level!] || LEVEL_STYLES.unknown;
              const isExpanded = expandedRow === log.id;
              return (
                <div key={log.id} className={`group ${styles.row}`}>
                  <div
                    onClick={() => log.isJson && setExpandedRow(isExpanded ? null : log.id)}
                    className={`flex items-start px-4 py-2.5 hover:bg-white/[0.03] transition-colors ${log.isJson ? "cursor-pointer" : ""} ${isExpanded ? "bg-white/[0.04]" : ""}`}
                  >
                    {/* Level badge */}
                    <span className={`shrink-0 mt-0.5 mr-3 inline-block w-12 text-center px-1 py-0.5 rounded text-[10px] font-bold uppercase border ${styles.badge}`}>
                      {log.level === "unknown" ? "raw" : log.level}
                    </span>

                    {/* Timestamp */}
                    {log.timestamp && (
                      <span className="shrink-0 mr-3 text-zinc-600 text-xs mt-0.5 hidden sm:block">
                        {log.timestamp.replace("T", " ").replace("Z", "")}
                      </span>
                    )}

                    {/* Message */}
                    <span className={`flex-1 min-w-0 truncate ${styles.text}`}>
                      {typeof log.message === "object"
                        ? JSON.stringify(log.message)
                        : (log.message || "").toString()}
                    </span>

                    {/* JSON indicator */}
                    {log.isJson && (
                      <span className="shrink-0 ml-2 text-zinc-700 group-hover:text-zinc-500 transition-colors text-xs">
                        {isExpanded ? "▲" : "▼"}
                      </span>
                    )}
                  </div>

                  {/* Expanded JSON */}
                  {isExpanded && log.parsed && (
                    <div className="bg-zinc-950 border-t border-zinc-800/50 px-4 py-3 pl-[4.5rem] overflow-x-auto">
                      <pre className="text-cyan-300/80 text-xs leading-relaxed">
                        {JSON.stringify(log.parsed, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Collapsible Input Drawer ── */}
      <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
        <button
          onClick={() => setInputOpen(o => !o)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <ClipboardPaste className="w-4 h-4 text-zinc-500" />
            <span className="font-medium">Raw Input</span>
            {parsedLogs.length > 0 && (
              <span className="text-xs text-zinc-600">{parsedLogs.length} lines loaded</span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {inputOpen && (
              <button
                onClick={(e) => { e.stopPropagation(); clearLogs(); }}
                className="p-1 text-zinc-600 hover:text-rose-400 hover:bg-red-500/10 rounded transition-colors"
                title="Clear logs"
                aria-label="Clear logs"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            {inputOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </div>
        </button>

        {inputOpen && (
          <textarea
            value={inputLogs}
            onChange={(e) => setInputLogs(e.target.value)}
            placeholder="Paste raw log lines here (JSON or plain text)..."
            className="w-full h-40 p-4 bg-transparent text-zinc-400 font-mono text-xs leading-relaxed resize-none focus:outline-none custom-scrollbar border-t border-zinc-800/50 whitespace-pre"
            spellCheck={false}
            autoFocus
          />
        )}
      </div>

    </div>
  );
}
