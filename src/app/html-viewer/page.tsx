"use client";

import { useState, useMemo } from "react";
import {
  Eye, Copy, Trash2, Maximize2, Minimize2,
  Monitor, Smartphone, Tablet, RotateCcw, Download,
} from "lucide-react";

type Device = "desktop" | "tablet" | "mobile";

const DEVICE: Record<Device, { width: string; label: string }> = {
  desktop: { width: "100%",  label: "Desktop" },
  tablet:  { width: "768px", label: "768 px" },
  mobile:  { width: "375px", label: "375 px" },
};

const STARTER = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Preview</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: #0f172a;
      color: #e2e8f0;
      padding: 2rem;
      min-height: 100vh;
    }
    h1 { font-size: 2rem; font-weight: 700; color: #818cf8; margin-bottom: .75rem; }
    p  { color: #94a3b8; line-height: 1.65; margin-bottom: 1rem; }
    .card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 1.25rem 1.5rem;
      margin-bottom: 1rem;
    }
    .badge {
      display: inline-block;
      padding: .2rem .65rem;
      border-radius: 999px;
      font-size: .75rem;
      font-weight: 600;
      background: #312e81;
      color: #a5b4fc;
      margin-right: .4rem;
    }
    button {
      margin-top: 1rem;
      padding: .55rem 1.25rem;
      background: #4f46e5;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: .875rem;
      cursor: pointer;
    }
    button:hover { background: #4338ca; }
  </style>
</head>
<body>
  <h1>Hello, DevsTool!</h1>
  <p>Edit the HTML on the left — the preview updates instantly.</p>
  <div class="card">
    <p>
      <span class="badge">HTML</span>
      <span class="badge">CSS</span>
      <span class="badge">JS</span>
      Fully sandboxed. Scripts, styles, and forms all work.
    </p>
    <button onclick="this.textContent = 'It works! 🎉'">Click me</button>
  </div>
  <div class="card">
    <p>Switch between <strong>Desktop</strong>, <strong>Tablet</strong>, and <strong>Mobile</strong> widths using the toolbar above the preview.</p>
  </div>
</body>
</html>`;

export default function HtmlViewerPage() {
  const [html, setHtml]           = useState(STARTER);
  const [device, setDevice]       = useState<Device>("desktop");
  const [wrapSnippet, setWrapSnippet] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [copied, setCopied]       = useState(false);

  const srcDoc = useMemo(() => {
    if (!wrapSnippet) return html;
    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif;padding:16px;background:#fff;color:#111;line-height:1.5}</style></head><body>${html}</body></html>`;
  }, [html, wrapSnippet]);

  const copyHtml = () => {
    navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const downloadHtml = () => {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "preview.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // No key prop — React updates srcDoc in-place without remounting the iframe.
  // Rendered in exactly ONE place at a time (split view OR fullscreen, never both).
  const PreviewFrame = (
    <iframe
      srcDoc={srcDoc}
      sandbox="allow-scripts allow-forms allow-modals allow-popups"
      title="HTML Preview"
      className="w-full h-full border-0"
    />
  );

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
            <Eye className="w-4 h-4 text-orange-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">HTML Viewer</h1>
            <p className="text-xs text-zinc-500">Live preview — scripts, styles &amp; forms all run in-browser</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Wrap snippet toggle */}
          <button
            onClick={() => setWrapSnippet((v) => !v)}
            title="Wrap snippet inside a minimal HTML page boilerplate"
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors ${
              wrapSnippet
                ? "bg-orange-500/15 border-orange-500/30 text-orange-300"
                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            Wrap snippet
          </button>

          {/* Device width */}
          <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 gap-0.5">
            {(["desktop", "tablet", "mobile"] as Device[]).map((d) => (
              <button
                key={d}
                onClick={() => setDevice(d)}
                title={DEVICE[d].label}
                className={`p-1.5 rounded-md transition-colors ${
                  device === d ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {d === "desktop" && <Monitor className="w-3.5 h-3.5" />}
                {d === "tablet"  && <Tablet  className="w-3.5 h-3.5" />}
                {d === "mobile"  && <Smartphone className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>

          <button
            onClick={copyHtml}
            disabled={!html}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors disabled:opacity-40"
          >
            <Copy className="w-3.5 h-3.5" /> {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={downloadHtml}
            disabled={!html}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" /> Download
          </button>
          <button
            onClick={() => setFullscreen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" /> Fullscreen
          </button>
          <button
            onClick={() => setHtml(STARTER)}
            title="Restore starter template"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <button
            onClick={() => setHtml("")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        </div>
      </div>

      {/* Split: editor | preview */}
      <div className="grid grid-cols-2 gap-3 flex-1 min-h-0">
        {/* Editor */}
        <div className="flex flex-col gap-1.5 min-h-0">
          <label className="text-xs font-medium text-zinc-400 shrink-0">HTML</label>
          <textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            placeholder="Paste or type HTML here..."
            spellCheck={false}
            className="flex-1 w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm font-mono text-zinc-200 placeholder-zinc-600 resize-none focus:outline-none focus:border-zinc-600 no-scrollbar"
          />
        </div>

        {/* Preview */}
        <div className="flex flex-col gap-1.5 min-h-0">
          <div className="flex items-center justify-between shrink-0">
            <label className="text-xs font-medium text-zinc-400">Preview</label>
            {device !== "desktop" && (
              <span className="text-[10px] text-zinc-600 font-mono">{DEVICE[device].label}</span>
            )}
          </div>
          <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden flex justify-center">
            <div
              className="h-full transition-[width] duration-300 bg-white"
              style={{ width: DEVICE[device].width }}
            >
              {/* Only render here when NOT in fullscreen — prevents two iframes existing at once */}
              {!fullscreen && PreviewFrame}
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen overlay */}
      {fullscreen && (
        <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 shrink-0 gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-zinc-300">Live Preview</span>
              {/* Device toggle inside fullscreen too */}
              <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 gap-0.5">
                {(["desktop", "tablet", "mobile"] as Device[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDevice(d)}
                    title={DEVICE[d].label}
                    className={`p-1.5 rounded-md transition-colors ${
                      device === d ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {d === "desktop" && <Monitor className="w-3.5 h-3.5" />}
                    {d === "tablet"  && <Tablet  className="w-3.5 h-3.5" />}
                    {d === "mobile"  && <Smartphone className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
              {device !== "desktop" && (
                <span className="text-[10px] text-zinc-600 font-mono">{DEVICE[device].label}</span>
              )}
            </div>
            <button
              onClick={() => setFullscreen(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
            >
              <Minimize2 className="w-3.5 h-3.5" /> Exit fullscreen
            </button>
          </div>
          <div className="flex-1 bg-zinc-800/30 flex justify-center overflow-hidden">
            <div
              className="h-full transition-[width] duration-300 bg-white shadow-2xl"
              style={{ width: DEVICE[device].width }}
            >
              {PreviewFrame}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
