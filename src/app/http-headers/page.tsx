"use client";

import React, { useState } from "react";
import { Copy, Check, Globe, Send, ShieldAlert, ArrowRight } from "lucide-react";

interface HeaderInfo {
  name: string;
  value: string;
  description?: string;
  category?: "Security" | "CORS" | "Caching" | "Information" | "Other";
  status?: "good" | "warning" | "error" | "neutral";
}

// Very basic definitions for MVP
const HEADER_DEFINITIONS: Record<string, { description: string; category: HeaderInfo["category"], check?: (val: string) => HeaderInfo["status"] }> = {
  "strict-transport-security": {
    description: "Forces browsers to use secure (HTTPS) connections.",
    category: "Security",
    check: (val) => val.includes("max-age") ? "good" : "warning"
  },
  "content-security-policy": {
    description: "Helps detect and mitigate certain types of attacks, including XSS and data injection.",
    category: "Security",
    check: () => "good"
  },
  "x-frame-options": {
    description: "Protects against clickjacking by controlling whether the site can be framed.",
    category: "Security",
    check: (val) => ["DENY", "SAMEORIGIN"].includes(val.toUpperCase()) ? "good" : "warning"
  },
  "x-content-type-options": {
    description: "Prevents MIME-sniffing a response away from the declared content-type.",
    category: "Security",
    check: (val) => val.toLowerCase() === "nosniff" ? "good" : "warning"
  },
  "access-control-allow-origin": {
    description: "Specifies which origins can access the resource.",
    category: "CORS",
    check: (val) => val === "*" ? "error" : "good"
  },
  "cache-control": {
    description: "Directives for caching mechanisms in both requests and responses.",
    category: "Caching",
    check: () => "neutral"
  },
  "server": {
    description: "Information about the software used by the original server.",
    category: "Information",
    check: () => "warning" // Revealing server info is often considered a minor risk
  },
  "x-powered-by": {
    description: "Specifies the technology supporting the web application.",
    category: "Information",
    check: () => "warning" // Similar to server, leaks info
  }
};

export default function HttpHeaders() {
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState<HeaderInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const analyzeHeaders = async (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setError(null);
    setHeaders([]);

    try {
      const res = await fetch(`/api/analyze-headers?url=${encodeURIComponent(url)}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to fetch headers.");
        setIsLoading(false);
        return;
      }

      const headerList: HeaderInfo[] = [];
      Object.entries(data.headers as Record<string, string>).forEach(([name, value]) => {
        const lowerName = name.toLowerCase();
        const def = HEADER_DEFINITIONS[lowerName];
        headerList.push({
          name,
          value,
          description: def?.description || "A standard HTTP header.",
          category: def?.category || "Other",
          status: def?.check ? def.check(value) : "neutral",
        });
      });

      // Sort: Security first, then others alphabetically
      headerList.sort((a, b) => {
        if (a.category === "Security" && b.category !== "Security") return -1;
        if (a.category !== "Security" && b.category === "Security") return 1;
        return a.name.localeCompare(b.name);
      });

      setHeaders(headerList);

      if (headerList.length === 0) {
        setError("No headers returned from this URL.");
      }
    } catch (err) {
      console.error(err);
      setError("Request failed. Check the URL and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    const text = headers.map(h => h.name + ": " + h.value).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const statusColors = {
      good: "text-emerald-400 bg-emerald-400/10 border-emerald-500/20",
      warning: "text-yellow-400 bg-yellow-400/10 border-yellow-500/20",
      error: "text-red-400 bg-red-400/10 border-red-500/20",
      neutral: "text-zinc-400 bg-zinc-800 border-zinc-700"
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto py-4">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Globe className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">HTTP Header Analyzer</h1>
            <p className="text-xs text-zinc-500">Inspect response headers, identify missing security headers, and troubleshoot CORS.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
          <form onSubmit={analyzeHeaders} className="flex gap-3 relative z-10">
              <input
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-shadow shadow-sm"
                  required
              />
              <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-500/20"
              >
                  {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Analyze
                      </>
                  )}
              </button>
          </form>

          {error && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-start text-yellow-200 text-sm animate-in fade-in zoom-in-95">
                  <ShieldAlert className="w-5 h-5 mr-3 text-yellow-500 shrink-0" />
                  <p>{error}</p>
              </div>
          )}

          <div className="flex-1 rounded-xl border border-zinc-800 bg-[#121214] overflow-hidden flex flex-col shadow-xl min-h-[400px]">
             <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-3 shrink-0 flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Response Headers</span>
                <button
                    onClick={handleCopy}
                    disabled={headers.length === 0}
                    className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors flex items-center bg-zinc-800/50 disabled:opacity-50"
                    aria-label="Copy all headers"
               >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500 mr-1.5" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                    <span className="text-[11px] font-medium uppercase tracking-wider">{isCopied ? 'Copied!' : 'Copy'}</span>
               </button>
             </div>

             <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                 {headers.length === 0 && !isLoading ? (
                     <div className="h-full flex flex-col items-center justify-center text-zinc-500 p-8">
                         <Globe className="w-12 h-12 mb-4 opacity-10" />
                         <p className="text-sm text-center max-w-sm">Enter a URL above to inspect its HTTP response headers and security posture.</p>
                     </div>
                 ) : (
                     <div className="divide-y divide-zinc-800/50">
                         {headers.map((header, i) => (
                             <div key={i} className="p-4 hover:bg-zinc-900/50 transition-colors flex flex-col sm:flex-row gap-4">
                                 <div className="sm:w-1/3 shrink-0">
                                     <div className="flex items-center space-x-2 mb-1">
                                         <span className="font-mono font-semibold text-indigo-300 break-all">{header.name}</span>
                                     </div>
                                     <div className="flex items-center space-x-2 mt-2">
                                         {header.category && (
                                              <span className="text-[10px] uppercase tracking-wider text-zinc-500 border border-zinc-800 px-1.5 rounded bg-zinc-900/50">
                                                 {header.category}
                                              </span>
                                         )}
                                         {header.status !== "neutral" && (
                                             <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border ${statusColors[header.status!]}`}>
                                                 {header.status === "good" ? "Secure" : "Info Leak / Weak"}
                                             </span>
                                         )}
                                     </div>
                                 </div>
                                 
                                 <div className="sm:w-2/3 flex flex-col justify-center">
                                     <div className="bg-zinc-950 border border-zinc-800/80 rounded-lg p-3 font-mono text-sm text-zinc-300 break-all mb-2">
                                         {header.value}
                                     </div>
                                     {header.description && (
                                         <p className="text-xs text-zinc-500 flex items-start">
                                            <ArrowRight className="w-3 h-3 mr-1.5 mt-0.5 shrink-0 text-zinc-600" />
                                            {header.description}
                                         </p>
                                     )}
                                 </div>
                             </div>
                         ))}
                     </div>
                 )}
             </div>
          </div>
      </div>
    </div>
  );
}
