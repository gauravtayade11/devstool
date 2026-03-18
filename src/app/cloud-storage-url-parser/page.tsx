"use client";

import { useState } from "react";
import { HardDrive, Copy, Check, AlertCircle, CheckCircle2, XCircle } from "lucide-react";

const MAX_INPUT = 1000;

type Provider = "S3" | "GCS" | "Azure" | "Unknown";

interface ParsedUrl {
  provider: Provider;
  providerLabel: string;
  bucket: string;
  objectKey: string;
  region: string;
  storageHint: string;
  rawUrl: string;
}

const PROVIDER_COLORS: Record<Provider, string> = {
  S3: "text-orange-400 bg-orange-500/10 border-orange-500/30",
  GCS: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  Azure: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
  Unknown: "text-zinc-400 bg-zinc-800 border-zinc-700",
};

const EXAMPLES = [
  {
    label: "S3 path-style",
    url: "https://s3.amazonaws.com/my-bucket/path/to/object.json",
  },
  {
    label: "S3 virtual-hosted",
    url: "https://my-bucket.s3.us-east-1.amazonaws.com/path/to/object.json",
  },
  {
    label: "S3 URI",
    url: "s3://my-bucket/path/to/object.json",
  },
  {
    label: "GCS URI",
    url: "gs://my-bucket/path/to/object.json",
  },
  {
    label: "GCS HTTPS",
    url: "https://storage.googleapis.com/my-bucket/path/to/object.json",
  },
  {
    label: "Azure Blob",
    url: "https://myaccount.blob.core.windows.net/mycontainer/myblob.txt",
  },
];

function parseCloudUrl(input: string): { valid: true; result: ParsedUrl } | { valid: false; error: string } {
  const trimmed = input.trim();
  if (!trimmed) return { valid: false, error: "Enter a cloud storage URL to parse." };

  // S3 URI: s3://bucket/key
  if (trimmed.startsWith("s3://")) {
    const withoutScheme = trimmed.slice(5);
    const slashIdx = withoutScheme.indexOf("/");
    const bucket = slashIdx === -1 ? withoutScheme : withoutScheme.slice(0, slashIdx);
    const objectKey = slashIdx === -1 ? "" : withoutScheme.slice(slashIdx + 1);
    if (!bucket) return { valid: false, error: "Invalid S3 URI: missing bucket name." };
    return {
      valid: true,
      result: { provider: "S3", providerLabel: "Amazon S3", bucket, objectKey, region: "", storageHint: "", rawUrl: trimmed },
    };
  }

  // GCS URI: gs://bucket/key
  if (trimmed.startsWith("gs://")) {
    const withoutScheme = trimmed.slice(5);
    const slashIdx = withoutScheme.indexOf("/");
    const bucket = slashIdx === -1 ? withoutScheme : withoutScheme.slice(0, slashIdx);
    const objectKey = slashIdx === -1 ? "" : withoutScheme.slice(slashIdx + 1);
    if (!bucket) return { valid: false, error: "Invalid GCS URI: missing bucket name." };
    return {
      valid: true,
      result: { provider: "GCS", providerLabel: "Google Cloud Storage", bucket, objectKey, region: "", storageHint: "", rawUrl: trimmed },
    };
  }

  // HTTPS URLs
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { valid: false, error: "Invalid URL: could not parse. Check the format and try again." };
  }

  const host = parsed.hostname;
  const pathname = parsed.pathname;

  // GCS HTTPS: https://storage.googleapis.com/bucket/key
  if (host === "storage.googleapis.com") {
    const parts = pathname.replace(/^\//, "").split("/");
    const bucket = parts[0] ?? "";
    const objectKey = parts.slice(1).join("/");
    if (!bucket) return { valid: false, error: "Invalid GCS URL: missing bucket name." };
    return {
      valid: true,
      result: { provider: "GCS", providerLabel: "Google Cloud Storage", bucket, objectKey, region: "", storageHint: "", rawUrl: trimmed },
    };
  }

  // Azure Blob: https://account.blob.core.windows.net/container/blob
  if (host.endsWith(".blob.core.windows.net")) {
    const parts = pathname.replace(/^\//, "").split("/");
    const container = parts[0] ?? "";
    const blobKey = parts.slice(1).join("/");
    const account = host.replace(".blob.core.windows.net", "");
    if (!container) return { valid: false, error: "Invalid Azure Blob URL: missing container name." };
    return {
      valid: true,
      result: {
        provider: "Azure",
        providerLabel: "Azure Blob Storage",
        bucket: container,
        objectKey: blobKey,
        region: account ? `Account: ${account}` : "",
        storageHint: "",
        rawUrl: trimmed,
      },
    };
  }

  // S3 path-style: https://s3.amazonaws.com/bucket/key
  //                https://s3.region.amazonaws.com/bucket/key
  if (host === "s3.amazonaws.com" || /^s3\.[a-z0-9-]+\.amazonaws\.com$/.test(host)) {
    let region = "";
    const s3RegionMatch = host.match(/^s3\.([a-z0-9-]+)\.amazonaws\.com$/);
    if (s3RegionMatch && s3RegionMatch[1] !== "amazonaws") {
      region = s3RegionMatch[1];
    }
    const parts = pathname.replace(/^\//, "").split("/");
    const bucket = parts[0] ?? "";
    const objectKey = parts.slice(1).join("/");
    if (!bucket) return { valid: false, error: "Invalid S3 URL: missing bucket name." };
    return {
      valid: true,
      result: { provider: "S3", providerLabel: "Amazon S3", bucket, objectKey, region, storageHint: "", rawUrl: trimmed },
    };
  }

  // S3 virtual-hosted: https://bucket.s3.region.amazonaws.com/key
  //                    https://bucket.s3.amazonaws.com/key
  if (host.endsWith(".amazonaws.com")) {
    const s3VirtualMatch = host.match(/^([^.]+)\.s3(?:\.([a-z0-9-]+))?\.amazonaws\.com$/);
    if (s3VirtualMatch) {
      const bucket = s3VirtualMatch[1];
      const region = s3VirtualMatch[2] ?? "";
      const objectKey = pathname.replace(/^\//, "");
      return {
        valid: true,
        result: { provider: "S3", providerLabel: "Amazon S3", bucket, objectKey, region, storageHint: "", rawUrl: trimmed },
      };
    }
    // Catch-all for amazonaws.com URLs we couldn't parse more specifically
    return { valid: false, error: "Unrecognized amazonaws.com URL format." };
  }

  return {
    valid: false,
    error: "Unknown cloud storage URL. Supported: AWS S3, Google Cloud Storage, Azure Blob Storage.",
  };
}

function CopyBtn({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <button
      onClick={handleCopy}
      className="p-1 text-zinc-600 hover:text-zinc-300 transition-colors rounded"
      title="Copy value"
      aria-label="Copy value"
    >
      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

interface FieldCardProps {
  label: string;
  value: string;
  mono?: boolean;
  badge?: React.ReactNode;
  emptyText?: string;
  wide?: boolean;
}

function FieldCard({ label, value, mono, badge, emptyText = "—", wide }: FieldCardProps) {
  return (
    <div className={`bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex flex-col gap-1.5 ${wide ? "col-span-full" : ""}`}>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">{label}</p>
      <div className="flex items-center gap-2 min-h-[1.5rem]">
        {badge}
        {value ? (
          <>
            <span className={`text-sm text-zinc-200 break-all flex-1 ${mono ? "font-mono" : ""}`}>{value}</span>
            <CopyBtn value={value} />
          </>
        ) : (
          <span className="text-sm text-zinc-600 italic">{emptyText}</span>
        )}
      </div>
    </div>
  );
}

export default function CloudStorageUrlParser() {
  const [input, setInput] = useState("");
  const [parseResult, setParseResult] = useState<ReturnType<typeof parseCloudUrl> | null>(null);

  const handleInput = (value: string) => {
    const capped = value.slice(0, MAX_INPUT);
    setInput(capped);
    if (!capped.trim()) {
      setParseResult(null);
      return;
    }
    setParseResult(parseCloudUrl(capped));
  };

  const result = parseResult?.valid ? parseResult.result : null;

  return (
    <div className="flex flex-col h-full py-4">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <HardDrive className="w-4 h-4 text-blue-400" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">Cloud Storage URL Parser</h1>
          <p className="text-xs text-zinc-500">Parse S3, GCS, and Azure Blob Storage URLs into their components.</p>
        </div>
      </div>

      {/* Input */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-zinc-400" htmlFor="cloud-url-input">Storage URL</label>
          <span className="text-[10px] text-zinc-600 font-mono">{input.length}/{MAX_INPUT}</span>
        </div>
        <input
          id="cloud-url-input"
          type="text"
          value={input}
          onChange={(e) => handleInput(e.target.value)}
          placeholder="https://my-bucket.s3.us-east-1.amazonaws.com/path/to/object"
          maxLength={MAX_INPUT}
          spellCheck={false}
          autoComplete="off"
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500/40 focus:border-blue-500/40 transition-colors"
        />
      </div>

      {/* Examples */}
      <div className="mb-6">
        <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2 font-semibold">Quick examples</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map(({ label, url }) => (
            <button
              key={url}
              onClick={() => handleInput(url)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-100 hover:border-zinc-600 transition-colors"
              title={url}
            >
              <span className="font-medium text-zinc-500">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Status badge */}
      {parseResult !== null && (
        <div className="mb-4">
          {parseResult.valid ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Recognized URL
            </span>
          ) : (
            <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span className="text-sm text-red-400">{parseResult.error}</span>
            </div>
          )}
        </div>
      )}

      {/* Parsed fields */}
      {result && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <FieldCard
            label="Provider"
            value={result.providerLabel}
            badge={
              <span className={`text-[10px] px-1.5 py-0.5 rounded border font-bold uppercase ${PROVIDER_COLORS[result.provider]}`}>
                {result.provider}
              </span>
            }
          />
          <FieldCard
            label={result.provider === "Azure" ? "Container" : "Bucket"}
            value={result.bucket}
            mono
          />
          <FieldCard
            label="Region"
            value={result.region}
            mono
            emptyText="Not specified"
          />
          <FieldCard
            label="Object Key / Path"
            value={result.objectKey}
            mono
            emptyText="(root)"
            wide={result.objectKey.length > 40}
          />
        </div>
      )}

      {/* Empty state */}
      {parseResult === null && (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-16 text-zinc-700">
          <AlertCircle className="w-8 h-8 mb-3 opacity-40" />
          <p className="text-sm font-medium">Paste a cloud storage URL above</p>
          <p className="text-xs mt-1 opacity-70">Supports AWS S3, Google Cloud Storage, and Azure Blob Storage</p>
        </div>
      )}
    </div>
  );
}
