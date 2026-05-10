"use client";

import { useState, useEffect, useCallback } from "react";
import { Hash, Copy, Check, Upload, Trash2 } from "lucide-react";
import { saveHistory, getHistory } from "@/lib/tool-history";

// ── MD5 implementation (no external dep) ─────────────────────────────────────
function md5(input: string): string {
  const str = unescape(encodeURIComponent(input));
  function safeAdd(x: number, y: number) { const lsw = (x & 0xffff) + (y & 0xffff); const msw = (x >> 16) + (y >> 16) + (lsw >> 16); return (msw << 16) | (lsw & 0xffff); }
  function bitRotateLeft(num: number, cnt: number) { return (num << cnt) | (num >>> (32 - cnt)); }
  function md5cmn(q: number, a: number, b: number, x: number, s: number, t: number) { return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b); }
  function md5ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn((b & c) | (~b & d), a, b, x, s, t); }
  function md5gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn((b & d) | (c & ~d), a, b, x, s, t); }
  function md5hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn(b ^ c ^ d, a, b, x, s, t); }
  function md5ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn(c ^ (b | ~d), a, b, x, s, t); }
  const m: number[] = [];
  const l = str.length;
  for (let i = 0; i < l; i++) m[i >> 2] = (m[i >> 2] ?? 0) | (str.charCodeAt(i) << ((i % 4) * 8));
  m[l >> 2] = (m[l >> 2] ?? 0) | (0x80 << ((l % 4) * 8));
  m[(((l + 64) >>> 9) << 4) + 14] = l * 8;
  let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
  for (let i = 0; i < m.length; i += 16) {
    const [oa, ob, oc, od] = [a, b, c, d];
    a = md5ff(a,b,c,d,m[i+0]??0,7,-680876936);    b = md5ff(d,a,b,c,m[i+1]??0,12,-389564586);  c = md5ff(c,d,a,b,m[i+2]??0,17,606105819);   d = md5ff(b,c,d,a,m[i+3]??0,22,-1044525330);
    a = md5ff(a,b,c,d,m[i+4]??0,7,-176418897);    b = md5ff(d,a,b,c,m[i+5]??0,12,1200080426);  c = md5ff(c,d,a,b,m[i+6]??0,17,-1473231341); d = md5ff(b,c,d,a,m[i+7]??0,22,-45705983);
    a = md5ff(a,b,c,d,m[i+8]??0,7,1770035416);    b = md5ff(d,a,b,c,m[i+9]??0,12,-1958414417); c = md5ff(c,d,a,b,m[i+10]??0,17,-42063);      d = md5ff(b,c,d,a,m[i+11]??0,22,-1990404162);
    a = md5ff(a,b,c,d,m[i+12]??0,7,1804603682);   b = md5ff(d,a,b,c,m[i+13]??0,12,-40341101);  c = md5ff(c,d,a,b,m[i+14]??0,17,-1502002290); d = md5ff(b,c,d,a,m[i+15]??0,22,1236535329);
    a = md5gg(a,b,c,d,m[i+1]??0,5,-165796510);    b = md5gg(d,a,b,c,m[i+6]??0,9,-1069501632);  c = md5gg(c,d,a,b,m[i+11]??0,14,643717713);   d = md5gg(b,c,d,a,m[i+0]??0,20,-373897302);
    a = md5gg(a,b,c,d,m[i+5]??0,5,-701558691);    b = md5gg(d,a,b,c,m[i+10]??0,9,38016083);    c = md5gg(c,d,a,b,m[i+15]??0,14,-660478335);  d = md5gg(b,c,d,a,m[i+4]??0,20,-405537848);
    a = md5gg(a,b,c,d,m[i+9]??0,5,568446438);     b = md5gg(d,a,b,c,m[i+14]??0,9,-1019803690); c = md5gg(c,d,a,b,m[i+3]??0,14,-187363961);   d = md5gg(b,c,d,a,m[i+8]??0,20,1163531501);
    a = md5gg(a,b,c,d,m[i+13]??0,5,-1444681467);  b = md5gg(d,a,b,c,m[i+2]??0,9,-51403784);    c = md5gg(c,d,a,b,m[i+7]??0,14,1735328473);   d = md5gg(b,c,d,a,m[i+12]??0,20,-1926607734);
    a = md5hh(a,b,c,d,m[i+5]??0,4,-378558);       b = md5hh(d,a,b,c,m[i+8]??0,11,-2022574463); c = md5hh(c,d,a,b,m[i+11]??0,16,1839030562);  d = md5hh(b,c,d,a,m[i+14]??0,23,-35309556);
    a = md5hh(a,b,c,d,m[i+1]??0,4,-1530992060);   b = md5hh(d,a,b,c,m[i+4]??0,11,1272893353);  c = md5hh(c,d,a,b,m[i+7]??0,16,-155497632);   d = md5hh(b,c,d,a,m[i+10]??0,23,-1094730640);
    a = md5hh(a,b,c,d,m[i+13]??0,4,681279174);    b = md5hh(d,a,b,c,m[i+0]??0,11,-358537222);  c = md5hh(c,d,a,b,m[i+3]??0,16,-722521979);   d = md5hh(b,c,d,a,m[i+6]??0,23,76029189);
    a = md5hh(a,b,c,d,m[i+9]??0,4,-640364487);    b = md5hh(d,a,b,c,m[i+12]??0,11,-421815835); c = md5hh(c,d,a,b,m[i+15]??0,16,530742520);   d = md5hh(b,c,d,a,m[i+2]??0,23,-995338651);
    a = md5ii(a,b,c,d,m[i+0]??0,6,-198630844);    b = md5ii(d,a,b,c,m[i+7]??0,10,1126891415);  c = md5ii(c,d,a,b,m[i+14]??0,15,-1416354905); d = md5ii(b,c,d,a,m[i+5]??0,21,-57434055);
    a = md5ii(a,b,c,d,m[i+12]??0,6,1700485571);   b = md5ii(d,a,b,c,m[i+3]??0,10,-1894986606); c = md5ii(c,d,a,b,m[i+10]??0,15,-1051523);     d = md5ii(b,c,d,a,m[i+1]??0,21,-2054922799);
    a = md5ii(a,b,c,d,m[i+8]??0,6,1873313359);    b = md5ii(d,a,b,c,m[i+15]??0,10,-30611744);  c = md5ii(c,d,a,b,m[i+6]??0,15,-1560198380);  d = md5ii(b,c,d,a,m[i+13]??0,21,1309151649);
    a = md5ii(a,b,c,d,m[i+4]??0,6,-145523070);    b = md5ii(d,a,b,c,m[i+11]??0,10,-1120210379);c = md5ii(c,d,a,b,m[i+2]??0,15,718787259);    d = md5ii(b,c,d,a,m[i+9]??0,21,-343485551);
    a = safeAdd(a,oa); b = safeAdd(b,ob); c = safeAdd(c,oc); d = safeAdd(d,od);
  }
  return [a,b,c,d].map(n => (n < 0 ? n + 0x100000000 : n).toString(16).padStart(8,"0").match(/../g)!.map(x=>x[1]+x[0]).join("")).join("");
}

// ── SHA via Web Crypto ────────────────────────────────────────────────────────
async function sha(algorithm: string, input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
}

const ALGOS = [
  { label: "MD5",     id: "md5" },
  { label: "SHA-1",   id: "SHA-1" },
  { label: "SHA-256", id: "SHA-256" },
  { label: "SHA-384", id: "SHA-384" },
  { label: "SHA-512", id: "SHA-512" },
];

function CopyBtn({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      disabled={!value}
      className="p-1.5 text-zinc-600 hover:text-zinc-300 transition-colors disabled:opacity-30"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

export default function HashGeneratorPage() {
  const [input, setInput] = useState("");
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const [uppercase, setUppercase] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => { setHistory(getHistory("hash-generator")); }, []);

  const compute = useCallback(async (text: string) => {
    if (!text) { setHashes({}); return; }
    const results: Record<string, string> = {};
    results["md5"] = md5(text);
    for (const algo of ["SHA-1", "SHA-256", "SHA-384", "SHA-512"]) {
      results[algo] = await sha(algo, text);
    }
    setHashes(results);
  }, []);

  useEffect(() => { compute(input); }, [input, compute]);

  const handleBlur = () => { if (input.trim()) { saveHistory("hash-generator", input); setHistory(getHistory("hash-generator")); } };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setInput(ev.target?.result as string ?? "");
    reader.readAsText(file);
    e.target.value = "";
  };

  const display = (h: string) => uppercase ? h.toUpperCase() : h;

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
          <Hash className="w-4 h-4 text-violet-400" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">Hash Generator</h1>
          <p className="text-xs text-zinc-500">MD5, SHA-1, SHA-256, SHA-384, SHA-512 — all client-side</p>
        </div>
      </div>

      {/* Input */}
      <div className="flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between">
          <label className="text-xs text-zinc-400">Input</label>
          <div className="flex items-center gap-2">
            <input id="hash-file" type="file" className="hidden" onChange={handleFile} />
            <label htmlFor="hash-file" className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" /> Upload file
            </label>
            {input && (
              <button onClick={() => setInput("")} className="flex items-center gap-1 text-xs text-zinc-600 hover:text-red-400 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onBlur={handleBlur}
          placeholder="Type or paste text to hash..."
          spellCheck={false}
          className="w-full h-28 bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm font-mono text-zinc-200 placeholder-zinc-600 resize-none focus:outline-none focus:border-zinc-600 transition-colors no-scrollbar"
        />
      </div>

      {/* Options */}
      <div className="flex items-center gap-3 shrink-0">
        <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
          <input type="checkbox" checked={uppercase} onChange={(e) => setUppercase(e.target.checked)}
            className="rounded border-zinc-700 bg-zinc-900 text-violet-500 focus:ring-0 focus:ring-offset-0" />
          Uppercase output
        </label>
        <span className="text-xs text-zinc-600">{input.length} chars · {new TextEncoder().encode(input).length} bytes</span>
      </div>

      {/* Hash results */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shrink-0">
        {ALGOS.map((algo, i) => {
          const hash = hashes[algo.id] ? display(hashes[algo.id]) : "";
          return (
            <div key={algo.id} className={`flex items-center px-4 py-3 ${i < ALGOS.length - 1 ? "border-b border-zinc-800/60" : ""}`}>
              <span className="w-20 text-xs font-mono font-semibold text-zinc-500 shrink-0">{algo.label}</span>
              <span className="flex-1 font-mono text-xs text-zinc-300 truncate">
                {hash || <span className="text-zinc-700">—</span>}
              </span>
              <CopyBtn value={hash} />
            </div>
          );
        })}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="shrink-0">
          <p className="text-xs text-zinc-600 mb-2">Recent</p>
          <div className="flex flex-wrap gap-2">
            {history.map((h, i) => (
              <button key={i} onClick={() => setInput(h)}
                className="px-2.5 py-1 text-xs bg-zinc-900 border border-zinc-800 rounded-md text-zinc-500 hover:text-zinc-200 hover:border-zinc-700 transition-colors font-mono truncate max-w-[200px]">
                {h.length > 30 ? h.slice(0, 30) + "…" : h}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
