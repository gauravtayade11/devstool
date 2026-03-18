"use client";

import { useState, useEffect } from "react";
import { Trash2, ShieldAlert, ShieldCheck, AlertCircle, Clock, KeyRound, Lock } from "lucide-react";
import { CopyButton } from "@/components/ui/copy-button";
import { ShareButton } from "@/components/ui/share-button";
import { getSharedState } from "@/lib/share";
import { saveHistory, getHistory } from "@/lib/tool-history";

interface JwtHeader {
  alg: string;
  typ?: string;
  [key: string]: unknown;
}

interface JwtData {
  header: JwtHeader;
  payload: Record<string, unknown> | null;
  signature: string;
  isExpired: boolean;
  expiresAt: Date | null;
  issuedAt: Date | null;
}

function useCountdown(targetDate: Date | null): string {
  const [label, setLabel] = useState("");

  useEffect(() => {
    if (!targetDate) { setLabel(""); return; }

    const tick = () => {
      if (document.hidden) return;
      const diff = Math.floor((targetDate.getTime() - Date.now()) / 1000);
      if (diff <= 0) { setLabel("Expired"); return; }
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      if (h > 0) setLabel(`${h}h ${m}m ${s}s`);
      else if (m > 0) setLabel(`${m}m ${s}s`);
      else setLabel(`${s}s`);
    };

    tick();
    const id = setInterval(tick, 1000);
    const onVisibility = () => { if (!document.hidden) tick(); };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [targetDate]);

  return label;
}

export default function JwtDecoder() {
  const [token, setToken] = useState("");
  const [decoded, setDecoded] = useState<JwtData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const countdown = useCountdown(decoded?.expiresAt ?? null);

  useEffect(() => {
    setHistory(getHistory("jwt"));
  }, []);

  useEffect(() => {
    const s = getSharedState<{ token: string }>();
    if (s?.token) parseJwt(s.token);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const parseJwt = (tokenStr: string) => {
    setToken(tokenStr);
    setError(null);

    if (!tokenStr.trim()) {
      setDecoded(null);
      return;
    }

    try {
      const parts = tokenStr.split(".");
      if (parts.length !== 3) {
        throw new Error("Invalid JWT format. Expected 3 dot-separated parts.");
      }

      // Fix base64 URL encoding issues
      const base64UrlDecode = (str: string) => {
        let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
        const pad = base64.length % 4;
        if (pad) {
          if (pad === 1) throw new Error("Invalid base64 string.");
          base64 += new Array(5 - pad).join("=");
        }
        return decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
      };

      const headerRaw = base64UrlDecode(parts[0]);
      const payloadRaw = base64UrlDecode(parts[1]);
      
      const header = JSON.parse(headerRaw);
      const payload = JSON.parse(payloadRaw);
      
      let isExpired = false;
      let expiresAt = null;
      let issuedAt = null;

      if (payload.exp) {
        expiresAt = new Date(payload.exp * 1000);
        isExpired = Date.now() >= expiresAt.getTime();
      }

      if (payload.iat) {
        issuedAt = new Date(payload.iat * 1000);
      }

      setDecoded({
        header,
        payload,
        signature: parts[2],
        isExpired,
        expiresAt,
        issuedAt
      });

      saveHistory("jwt", tokenStr);
      setHistory(getHistory("jwt"));

    } catch (err: any) {
      setError(err.message || "Failed to parse JWT.");
      setDecoded(null);
    }
  };

  const loadExample = () => {
    // A safe mock JWT (header: HS256, payload: {sub: "1234567890", name: "John Doe", iat: 1516239022})
    parseJwt("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c");
  };

  return (
    <div className="flex flex-col h-full py-4">
      <div className="mb-4 flex items-start space-x-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
        <Lock className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
        <p>
          <span className="font-semibold">Never paste production tokens here.</span> JWT decoding is done entirely in your browser — no data is transmitted — but tokens may contain sensitive claims. Use only test or demo tokens.
        </p>
      </div>

      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <KeyRound className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">JWT Decoder</h1>
              <p className="text-xs text-zinc-500">Decode, inspect, and verify JSON Web Tokens client-side.</p>
            </div>
          </div>
        </div>
         <button 
           onClick={loadExample}
           className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors hidden md:block"
         >
           Load Demo Token
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[500px]">
        
        {/* Input Area (Left) */}
        <div className="flex flex-col rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-inner">
          <div className="bg-zinc-900 h-12 border-b border-zinc-800 flex items-center justify-between px-4 shrink-0">
            <span className="text-sm font-medium text-zinc-300">Encoded Token</span>
             <div className="flex items-center gap-1">
              <ShareButton getState={() => ({ token })} disabled={!token} />
              <button
                onClick={() => { setToken(""); setDecoded(null); setError(null); }}
                className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 rounded transition-colors"
                title="Clear Input"
                aria-label="Clear input"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex-1 relative">
            <textarea
              value={token}
              onChange={(e) => parseJwt(e.target.value)}
              placeholder="Paste your JWT here (eyJhbGci...)"
              className="absolute inset-0 w-full h-full p-6 bg-transparent text-zinc-300 font-mono text-sm leading-relaxed tracking-wide resize-none focus:outline-none focus:ring-0 custom-scrollbar break-all"
              spellCheck={false}
            />
          </div>
          {history.length > 0 && (
            <div className="flex flex-wrap gap-2 px-4 py-2 border-t border-zinc-800">
              <span className="text-xs text-zinc-600 self-center">Recent:</span>
              {history.map((h, i) => (
                <button key={i} onClick={() => parseJwt(h)}
                  className="px-2.5 py-1 text-xs bg-zinc-900 border border-zinc-800 rounded-md text-zinc-500 hover:text-zinc-200 hover:border-zinc-700 transition-colors font-mono truncate max-w-[200px]">
                  {h.length > 30 ? h.slice(0, 30) + "…" : h}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Output Area (Right) */}
        <div className="flex flex-col rounded-xl overflow-hidden border border-zinc-800 bg-[#121214] shadow-inner relative">
           <div className="bg-zinc-900 h-12 border-b border-zinc-800 flex items-center justify-between px-4 shrink-0">
             <span className="text-sm font-medium text-purple-400">Decoded Payload</span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar relative p-4 space-y-4">
            {error ? (
               <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start">
                  <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
                  <span>{error}</span>
               </div>
            ) : !decoded ? (
               <div className="h-full flex items-center justify-center text-zinc-600 font-medium">
                 Waiting for input...
               </div>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Status Bar */}
                <div className="grid grid-cols-2 gap-3">
                   <div className={`p-3 rounded-lg border ${decoded.isExpired ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'} flex flex-col`}>
                      <div className="flex items-center text-xs font-semibold mb-1 opacity-80">
                         {decoded.isExpired ? <ShieldAlert className="w-3.5 h-3.5 mr-1.5" /> : <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />}
                         STATUS
                      </div>
                      <span className="text-sm font-medium">
                        {decoded.isExpired ? 'Token Expired' : 'Token Active'}
                      </span>
                   </div>
                    {decoded.expiresAt && (
                      <div className="p-3 rounded-lg border bg-zinc-900 border-zinc-800 text-zinc-300 flex flex-col">
                          <div className="flex items-center text-xs font-semibold mb-1 opacity-60">
                            <Clock className="w-3.5 h-3.5 mr-1.5" />
                            EXPIRES
                          </div>
                          <span className="text-sm font-medium truncate" title={decoded.expiresAt.toLocaleString()}>
                            {decoded.expiresAt.toLocaleString()}
                          </span>
                          {countdown && (
                            <span className={`text-xs mt-1 font-mono ${decoded.isExpired ? "text-red-400" : "text-emerald-400"}`}>
                              {decoded.isExpired ? "Expired" : `expires in ${countdown}`}
                            </span>
                          )}
                      </div>
                    )}
                </div>

                {/* Header Area */}
                <div className="rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950">
                   <div className="bg-zinc-900 px-3 py-2 text-xs font-semibold text-rose-400 border-b border-zinc-800 flex items-center justify-between">
                     <span>HEADER: <span className="text-zinc-500 font-normal ml-1">Algorithm & Token Type</span></span>
                     <CopyButton text={JSON.stringify(decoded.header, null, 2)} className="text-zinc-500 hover:text-white hover:bg-zinc-800" size="sm" />
                   </div>
                   <pre className="p-4 text-rose-300 font-mono text-sm overflow-x-auto">
                     {JSON.stringify(decoded.header, null, 2)}
                   </pre>
                </div>

                {/* Payload Area */}
                <div className="rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950">
                   <div className="bg-zinc-900 px-3 py-2 text-xs font-semibold text-purple-400 border-b border-zinc-800 flex items-center justify-between">
                     <span>PAYLOAD: <span className="text-zinc-500 font-normal ml-1">Data</span></span>
                     <CopyButton text={JSON.stringify(decoded.payload, null, 2)} className="text-zinc-500 hover:text-white hover:bg-zinc-800" size="sm" />
                   </div>
                   <pre className="p-4 text-purple-300 font-mono text-sm overflow-x-auto">
                     {JSON.stringify(decoded.payload, null, 2)}
                   </pre>
                </div>

                {/* Signature Warning */}
                <div className="rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950">
                   <div className="bg-zinc-900 px-3 py-2 text-xs font-semibold text-blue-400 border-b border-zinc-800 flex items-center justify-between">
                     <span>VERIFY SIGNATURE</span>
                     <span className="text-zinc-500 font-normal">Client-side only</span>
                   </div>
                   <div className="p-4 text-xs text-zinc-400 leading-relaxed font-mono break-all">
                      {decoded.signature}
                      <p className="mt-3 text-yellow-500/80 flex items-start">
                         <AlertCircle className="w-4 h-4 mr-2 shrink-0 mt-0.5" />
                         Note: Signature verification requires the secret key, which is not possible in a purely client-side tool.
                      </p>
                   </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
