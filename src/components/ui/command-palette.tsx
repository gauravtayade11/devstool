"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Braces, Hash, Network, KeyRound, Clock, FileCode2,
  ListTree, Settings2, FileJson, GitBranch, Globe, ShieldAlert,
  GitCompare, FileText, X,
} from "lucide-react";

const TOOLS = [
  { name: "JSON Formatter", description: "Format, validate and minify JSON", path: "/json-formatter", icon: <Braces className="w-4 h-4" />, tags: ["json", "format", "validate", "minify"] },
  { name: "Base64 Encoder", description: "Encode and decode Base64 strings", path: "/base64", icon: <Hash className="w-4 h-4" />, tags: ["base64", "encode", "decode"] },
  { name: "URL Encoder", description: "Encode and decode URL parameters", path: "/url-encoder", icon: <Network className="w-4 h-4" />, tags: ["url", "encode", "decode", "uri"] },
  { name: "JWT Decoder", description: "Inspect JSON Web Tokens", path: "/jwt", icon: <KeyRound className="w-4 h-4" />, tags: ["jwt", "token", "auth", "decode"] },
  { name: "Timestamp Converter", description: "Convert Unix timestamps to dates", path: "/timestamp", icon: <Clock className="w-4 h-4" />, tags: ["timestamp", "unix", "date", "time", "epoch"] },
  { name: "UUID Generator", description: "Generate RFC-4122 UUIDs", path: "/uuid", icon: <FileCode2 className="w-4 h-4" />, tags: ["uuid", "guid", "generate"] },
  { name: "Diff Checker", description: "Compare two texts side by side", path: "/diff-checker", icon: <GitCompare className="w-4 h-4" />, tags: ["diff", "compare", "text"] },
  { name: "Markdown Preview", description: "Write and preview Markdown", path: "/markdown-preview", icon: <FileText className="w-4 h-4" />, tags: ["markdown", "preview", "md", "gfm"] },
  { name: "YAML Validator", description: "Lint and format YAML configs", path: "/yaml-validator", icon: <ListTree className="w-4 h-4" />, tags: ["yaml", "validate", "lint", "kubernetes", "k8s"] },
  { name: "ENV Parser", description: "Parse and validate .env files", path: "/env-parser", icon: <Settings2 className="w-4 h-4" />, tags: ["env", "dotenv", "environment", "variables"] },
  { name: "Log Formatter", description: "Format and filter JSON logs", path: "/log-formatter", icon: <FileJson className="w-4 h-4" />, tags: ["log", "format", "filter", "json"] },
  { name: "Dockerfile Linter", description: "Lint Dockerfiles for best practices", path: "/dockerfile-linter", icon: <FileCode2 className="w-4 h-4" />, tags: ["docker", "dockerfile", "lint"] },
  { name: "Git Command Builder", description: "Build complex git commands", path: "/git-builder", icon: <GitBranch className="w-4 h-4" />, tags: ["git", "command", "builder"] },
  { name: "Cron Builder", description: "Build and understand cron expressions", path: "/cron-builder", icon: <Clock className="w-4 h-4" />, tags: ["cron", "schedule", "expression"] },
  { name: "Port Reference", description: "Look up well-known port numbers", path: "/port-reference", icon: <Network className="w-4 h-4" />, tags: ["port", "tcp", "udp", "network"] },
  { name: "HTTP Headers", description: "Inspect response headers and security", path: "/http-headers", icon: <Globe className="w-4 h-4" />, tags: ["http", "headers", "security", "cors"] },
  { name: "Secret Scanner", description: "Detect exposed credentials and keys", path: "/secret-scanner", icon: <ShieldAlert className="w-4 h-4" />, tags: ["secret", "scan", "credentials", "api key", "aws", "token"] },
];

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = TOOLS.filter((t) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.includes(q))
    );
  });

  const navigate = useCallback((path: string) => {
    router.push(path);
    onClose();
    setQuery("");
    setActiveIdx(0);
  }, [router, onClose]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => { setActiveIdx(0); }, [query]);

  useEffect(() => {
    const el = listRef.current?.children[activeIdx] as HTMLElement;
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, filtered.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
      if (e.key === "Enter" && filtered[activeIdx]) { navigate(filtered[activeIdx].path); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, activeIdx, filtered, navigate, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Palette */}
      <div
        className="relative w-full max-w-xl mx-4 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl shadow-black/60 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
          <Search className="w-4 h-4 text-zinc-500 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools..."
            className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-zinc-500 hover:text-zinc-300">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-zinc-500 bg-zinc-800 border border-zinc-700 rounded">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="overflow-y-auto max-h-80 py-2 no-scrollbar">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-zinc-500">No tools found</div>
          ) : (
            filtered.map((tool, i) => (
              <button
                key={tool.path}
                onClick={() => navigate(tool.path)}
                onMouseEnter={() => setActiveIdx(i)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  i === activeIdx ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-800/50"
                }`}
              >
                <span className={`shrink-0 ${i === activeIdx ? "text-indigo-400" : "text-zinc-500"}`}>
                  {tool.icon}
                </span>
                <div className="min-w-0">
                  <div className={`text-sm font-medium ${i === activeIdx ? "text-white" : "text-zinc-300"}`}>
                    {tool.name}
                  </div>
                  <div className="text-xs text-zinc-500 truncate">{tool.description}</div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-zinc-800 flex items-center gap-4 text-[10px] text-zinc-600">
          <span><kbd className="font-mono">↑↓</kbd> navigate</span>
          <span><kbd className="font-mono">↵</kbd> open</span>
          <span><kbd className="font-mono">esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
