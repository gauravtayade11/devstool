"use client";

import { useState } from "react";
import { ShieldCheck, Copy, Check, Trash2, AlertTriangle, Clock } from "lucide-react";
import * as x509 from "@peculiar/x509";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(d: Date) {
  return d.toUTCString().replace("GMT", "UTC");
}

function daysUntil(d: Date): number {
  return Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function hexColon(hex: string): string {
  return (hex.match(/../g) ?? []).join(":").toUpperCase();
}

async function fingerprint(certBuf: ArrayBuffer, algo: string): Promise<string> {
  const buf = await crypto.subtle.digest(algo, certBuf);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join(":");
}

function parseName(name: string): Record<string, string> {
  const out: Record<string, string> = {};
  name.split(", ").forEach((part) => {
    const eq = part.indexOf("=");
    if (eq > -1) out[part.slice(0, eq)] = part.slice(eq + 1);
  });
  return out;
}

interface CertInfo {
  subject: Record<string, string>;
  issuer: Record<string, string>;
  validFrom: Date;
  validTo: Date;
  daysLeft: number;
  sans: string[];
  serialNumber: string;
  keyAlgorithm: string;
  signatureAlgorithm: string;
  version: number;
  sha256: string;
  sha1: string;
  isCA: boolean;
}

async function decode(pem: string): Promise<CertInfo> {
  const cert = new x509.X509Certificate(pem);
  const raw = cert.rawData;

  const [sha256fp, sha1fp] = await Promise.all([
    fingerprint(raw, "SHA-256"),
    fingerprint(raw, "SHA-1"),
  ]);

  const sans: string[] = [];
  try {
    const sanExt = cert.getExtension("2.5.29.17");
    if (sanExt) {
      const sanText = sanExt.toString();
      const matches = sanText.match(/DNS:([^,\s]+)/g) ?? [];
      sans.push(...matches.map((m) => m.replace("DNS:", "")));
      const ipMatches = sanText.match(/IP:([^,\s]+)/g) ?? [];
      sans.push(...ipMatches.map((m) => m.replace("IP:", "")));
    }
  } catch {}

  let isCA = false;
  try {
    const bcExt = cert.getExtension("2.5.29.19");
    if (bcExt) isCA = bcExt.toString().includes("cA=true");
  } catch {}

  return {
    subject: parseName(cert.subject),
    issuer: parseName(cert.issuer),
    validFrom: cert.notBefore,
    validTo: cert.notAfter,
    daysLeft: daysUntil(cert.notAfter),
    sans,
    serialNumber: hexColon(cert.serialNumber),
    keyAlgorithm: cert.publicKey.algorithm.name ?? "Unknown",
    signatureAlgorithm: cert.signatureAlgorithm.name ?? "Unknown",
    version: 3,
    sha256: sha256fp.toUpperCase(),
    sha1: sha1fp.toUpperCase(),
    isCA,
  };
}

// ── Components ────────────────────────────────────────────────────────────────

function CopyBtn({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="p-1 text-zinc-600 hover:text-zinc-300 transition-colors">
      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-zinc-800/60 last:border-0 gap-4">
      <span className="text-xs text-zinc-500 shrink-0 w-36">{label}</span>
      <div className="flex items-center gap-1 min-w-0">
        <span className={`text-xs text-zinc-200 break-all ${mono ? "font-mono" : ""}`}>{value}</span>
        <CopyBtn value={value} />
      </div>
    </div>
  );
}

function ExpiryBadge({ days }: { days: number }) {
  if (days < 0) return <span className="flex items-center gap-1 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full"><AlertTriangle className="w-3 h-3" /> Expired {Math.abs(days)}d ago</span>;
  if (days < 30) return <span className="flex items-center gap-1 text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-full"><Clock className="w-3 h-3" /> Expires in {days}d</span>;
  return <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full"><ShieldCheck className="w-3 h-3" /> Valid · {days}d left</span>;
}

const SAMPLE_PEM = `-----BEGIN CERTIFICATE-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2a2rwplBQLzHPZe5TNJT
-----END CERTIFICATE-----`;

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SslDecoderPage() {
  const [pem, setPem] = useState("");
  const [info, setInfo] = useState<CertInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDecode = async () => {
    const trimmed = pem.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      const result = await decode(trimmed);
      setInfo(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to parse certificate");
    } finally {
      setLoading(false);
    }
  };

  const nameStr = (n: Record<string, string>) =>
    Object.entries(n).map(([k, v]) => `${k}=${v}`).join(", ") || "—";

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">SSL Certificate Decoder</h1>
          <p className="text-xs text-zinc-500">Inspect subject, SANs, expiry, fingerprints — all client-side</p>
        </div>
      </div>

      {/* Input */}
      <div className="flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between">
          <label className="text-xs text-zinc-400">PEM Certificate</label>
          {pem && <button onClick={() => { setPem(""); setInfo(null); setError(null); }} className="flex items-center gap-1 text-xs text-zinc-600 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>}
        </div>
        <textarea
          value={pem}
          onChange={(e) => setPem(e.target.value)}
          placeholder={"-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----"}
          spellCheck={false}
          className="w-full h-36 bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-xs font-mono text-zinc-200 placeholder-zinc-600 resize-none focus:outline-none focus:border-zinc-600 transition-colors no-scrollbar"
        />
        <button
          onClick={handleDecode}
          disabled={!pem.trim() || loading}
          className="self-start flex items-center gap-1.5 px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white transition-colors disabled:opacity-40"
        >
          {loading ? "Decoding..." : "Decode Certificate"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Results */}
      {info && (
        <div className="flex flex-col gap-4">
          {/* Expiry banner */}
          <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-white">{info.subject["CN"] ?? nameStr(info.subject)}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{info.isCA ? "Certificate Authority" : "End-entity certificate"} · v{info.version}</p>
            </div>
            <ExpiryBadge days={info.daysLeft} />
          </div>

          {/* Subject & Issuer */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Subject</p>
              {Object.entries(info.subject).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between py-1 text-xs">
                  <span className="text-zinc-600 w-10 shrink-0">{k}</span>
                  <span className="text-zinc-200 text-right break-all">{v}</span>
                </div>
              ))}
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Issuer</p>
              {Object.entries(info.issuer).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between py-1 text-xs">
                  <span className="text-zinc-600 w-10 shrink-0">{k}</span>
                  <span className="text-zinc-200 text-right break-all">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider pt-3 pb-1">Details</p>
            <Row label="Valid From" value={formatDate(info.validFrom)} />
            <Row label="Valid To" value={formatDate(info.validTo)} />
            <Row label="Serial Number" value={info.serialNumber} mono />
            <Row label="Key Algorithm" value={info.keyAlgorithm} />
            <Row label="Signature Algo" value={info.signatureAlgorithm} />
          </div>

          {/* SANs */}
          {info.sans.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3">Subject Alternative Names ({info.sans.length})</p>
              <div className="flex flex-wrap gap-2">
                {info.sans.map((san) => (
                  <span key={san} className="px-2.5 py-1 bg-zinc-800 rounded-md font-mono text-xs text-zinc-300">{san}</span>
                ))}
              </div>
            </div>
          )}

          {/* Fingerprints */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider pt-3 pb-1">Fingerprints</p>
            <Row label="SHA-256" value={info.sha256} mono />
            <Row label="SHA-1" value={info.sha1} mono />
          </div>
        </div>
      )}

      {/* Empty state */}
      {!info && !error && (
        <div className="text-center py-12 text-zinc-600 text-sm">
          Paste a PEM certificate above and click Decode
        </div>
      )}
    </div>
  );
}
