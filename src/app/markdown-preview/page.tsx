"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FileText, Eye, Columns2, Trash2, Download } from "lucide-react";
import { CopyButton } from "@/components/ui/copy-button";

type ViewMode = "split" | "edit" | "preview";

const PLACEHOLDER = `# Markdown Preview

Write **markdown** on the left, see the rendered output on the right.

## Features

- GitHub Flavored Markdown (GFM)
- Tables, strikethrough, task lists
- Code blocks with syntax hints
- 100% client-side

## Code Example

\`\`\`bash
docker run -p 3000:3000 myapp
\`\`\`

## Table

| Tool | Category | Client-side |
|------|----------|-------------|
| JSON Formatter | Dev | ✅ |
| Secret Scanner | Security | ✅ |

## Task List

- [x] Write markdown
- [x] See live preview
- [ ] Deploy to production
`;

export default function MarkdownPreviewPage() {
  const [input, setInput] = useState("");
  const [view, setView] = useState<ViewMode>("split");

  const download = () => {
    const blob = new Blob([input], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-4" style={{ height: "calc(100vh - 9rem)" }}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <FileText className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Markdown Preview</h1>
            <p className="text-xs text-zinc-500">Live preview with GitHub Flavored Markdown</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setView("edit")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                view === "edit" ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <FileText className="w-3 h-3" /> Edit
            </button>
            <button
              onClick={() => setView("split")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                view === "split" ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Columns2 className="w-3 h-3" /> Split
            </button>
            <button
              onClick={() => setView("preview")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                view === "preview" ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Eye className="w-3 h-3" /> Preview
            </button>
          </div>
          <CopyButton text={input} disabled={!input} />
          <button
            onClick={download}
            disabled={!input}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" /> .md
          </button>
          <button
            onClick={() => setInput("")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        </div>
      </div>

      {/* Editor / Preview */}
      <div className={`flex-1 min-h-0 grid gap-3 ${view === "split" ? "grid-cols-2" : "grid-cols-1"}`}>
        {/* Editor pane */}
        {(view === "edit" || view === "split") && (
          <div className="flex flex-col gap-2 min-h-0">
            {view === "split" && <label className="text-xs font-medium text-zinc-400">Markdown</label>}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={PLACEHOLDER}
              className="flex-1 w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm font-mono text-zinc-200 placeholder-zinc-700 resize-none focus:outline-none focus:border-zinc-600 overflow-y-auto no-scrollbar"
            />
          </div>
        )}

        {/* Preview pane */}
        {(view === "preview" || view === "split") && (
          <div className="flex flex-col gap-2 min-h-0">
            {view === "split" && <label className="text-xs font-medium text-zinc-400">Preview</label>}
            <div className="flex-1 overflow-auto bg-zinc-900 border border-zinc-800 rounded-lg p-4 prose prose-invert prose-sm max-w-none
              prose-headings:text-white prose-headings:font-semibold
              prose-h1:text-xl prose-h2:text-lg prose-h3:text-base
              prose-p:text-zinc-300 prose-p:leading-relaxed
              prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-white
              prose-code:text-indigo-300 prose-code:bg-zinc-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-zinc-800 prose-pre:border prose-pre:border-zinc-700 prose-pre:rounded-lg
              prose-blockquote:border-l-indigo-500 prose-blockquote:text-zinc-400
              prose-hr:border-zinc-700
              prose-table:text-sm
              prose-th:text-zinc-200 prose-th:bg-zinc-800
              prose-td:text-zinc-400 prose-td:border-zinc-700
              prose-li:text-zinc-300
              prose-ul:marker:text-zinc-500
              prose-ol:marker:text-zinc-500
            ">
              {input ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {input}
                </ReactMarkdown>
              ) : (
                <div className="text-zinc-600 text-sm italic">Preview will appear here...</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
