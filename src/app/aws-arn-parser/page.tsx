"use client";

import { useState, useEffect } from "react";
import { Cloud, Copy, Check, Clock, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { saveHistory, getHistory } from "@/lib/tool-history";

const MAX_INPUT = 500;

interface ArnFields {
  raw: string;
  partition: string;
  service: string;
  region: string;
  account: string;
  resourceType: string;
  resourceId: string;
}

const EXAMPLES = [
  "arn:aws:s3:::my-bucket",
  "arn:aws:ec2:us-east-1:123456789012:instance/i-0abcd1234ef567890",
  "arn:aws:lambda:us-west-2:987654321098:function:my-function",
  "arn:aws:iam::123456789012:role/MyRole",
  "arn:aws:rds:eu-west-1:123456789012:db:my-database",
  "arn:aws:sns:ap-southeast-1:123456789012:my-topic",
];

const SERVICE_COLORS: Record<string, string> = {
  s3: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  ec2: "text-orange-400 bg-orange-500/10 border-orange-500/30",
  lambda: "text-purple-400 bg-purple-500/10 border-purple-500/30",
  iam: "text-red-400 bg-red-500/10 border-red-500/30",
  rds: "text-green-400 bg-green-500/10 border-green-500/30",
  sns: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  sqs: "text-pink-400 bg-pink-500/10 border-pink-500/30",
  dynamodb: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
  cloudwatch: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
};

function getServiceColor(service: string): string {
  return SERVICE_COLORS[service.toLowerCase()] ?? "text-zinc-400 bg-zinc-800 border-zinc-700";
}

function parseArn(input: string): { valid: true; fields: ArnFields } | { valid: false; error: string } {
  const trimmed = input.trim();
  if (!trimmed) return { valid: false, error: "Enter an ARN to parse." };
  if (!trimmed.startsWith("arn:")) return { valid: false, error: 'Invalid ARN: must start with "arn:".' };

  const parts = trimmed.split(":");
  if (parts.length < 6) return { valid: false, error: "Invalid ARN: too few components (expected at least 6 colon-separated parts)." };

  const [, partition, service, region, account, ...resourceParts] = parts;

  if (!partition) return { valid: false, error: "Invalid ARN: missing partition." };
  if (!service) return { valid: false, error: "Invalid ARN: missing service." };

  const resourceRaw = resourceParts.join(":");

  let resourceType = "";
  let resourceId = resourceRaw;

  if (resourceRaw.includes("/")) {
    const slashIdx = resourceRaw.indexOf("/");
    resourceType = resourceRaw.slice(0, slashIdx);
    resourceId = resourceRaw.slice(slashIdx + 1);
  } else if (resourceParts.length >= 2) {
    resourceType = resourceParts[0];
    resourceId = resourceParts.slice(1).join(":");
  }

  return {
    valid: true,
    fields: {
      raw: trimmed,
      partition,
      service,
      region: region || "",
      account: account || "",
      resourceType,
      resourceId,
    },
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
}

function FieldCard({ label, value, mono, badge, emptyText = "—" }: FieldCardProps) {
  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex flex-col gap-1.5">
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

export default function AwsArnParser() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ReturnType<typeof parseArn> | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    setHistory(getHistory("aws-arn-parser"));
  }, []);

  const handleInput = (value: string) => {
    const capped = value.slice(0, MAX_INPUT);
    setInput(capped);
    if (!capped.trim()) {
      setResult(null);
      return;
    }
    const parsed = parseArn(capped);
    setResult(parsed);
    if (parsed.valid) {
      saveHistory("aws-arn-parser", capped.trim());
      setHistory(getHistory("aws-arn-parser"));
    }
  };

  const loadExample = (arn: string) => {
    handleInput(arn);
  };

  const fields = result?.valid ? result.fields : null;

  return (
    <div className="flex flex-col h-full py-4">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
          <Cloud className="w-4 h-4 text-orange-400" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">AWS ARN Parser</h1>
          <p className="text-xs text-zinc-500">Parse and validate AWS ARN strings into their components.</p>
        </div>
      </div>

      {/* Input */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-zinc-400" htmlFor="arn-input">ARN String</label>
          <span className="text-[10px] text-zinc-600 font-mono">{input.length}/{MAX_INPUT}</span>
        </div>
        <input
          id="arn-input"
          type="text"
          value={input}
          onChange={(e) => handleInput(e.target.value)}
          placeholder="arn:aws:s3:::my-bucket"
          maxLength={MAX_INPUT}
          spellCheck={false}
          autoComplete="off"
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-orange-500/40 focus:border-orange-500/40 transition-colors"
        />
      </div>

      {/* Examples */}
      <div className="mb-6">
        <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2 font-semibold">Quick examples</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => loadExample(ex)}
              className="px-2.5 py-1 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-100 hover:border-zinc-600 transition-colors font-mono truncate max-w-[260px]"
              title={ex}
            >
              {ex.length > 42 ? ex.slice(0, 42) + "…" : ex}
            </button>
          ))}
        </div>
      </div>

      {/* Status badge */}
      {result !== null && (
        <div className="mb-4">
          {result.valid ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Valid ARN
            </span>
          ) : (
            <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span className="text-sm text-red-400">{result.error}</span>
            </div>
          )}
        </div>
      )}

      {/* Parsed fields grid */}
      {fields && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <FieldCard label="Partition" value={fields.partition} mono />
          <FieldCard
            label="Service"
            value={fields.service}
            badge={
              <span className={`text-[10px] px-1.5 py-0.5 rounded border font-bold uppercase ${getServiceColor(fields.service)}`}>
                {fields.service.toUpperCase()}
              </span>
            }
          />
          <FieldCard label="Region" value={fields.region} mono emptyText="Global" />
          <FieldCard label="Account ID" value={fields.account} mono emptyText="AWS-managed" />
          <FieldCard label="Resource Type" value={fields.resourceType} mono emptyText="—" />
          <FieldCard label="Resource ID" value={fields.resourceId} mono />
        </div>
      )}

      {/* Empty state */}
      {result === null && (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-16 text-zinc-700">
          <AlertCircle className="w-8 h-8 mb-3 opacity-40" />
          <p className="text-sm font-medium">Paste an ARN above to parse it</p>
          <p className="text-xs mt-1 opacity-70">Supports all standard AWS ARN formats</p>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="mt-auto pt-4 border-t border-zinc-800/60">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-zinc-600 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Recent:
            </span>
            {history.map((h, i) => (
              <button
                key={i}
                onClick={() => loadExample(h)}
                className="px-2.5 py-1 text-xs bg-zinc-900 border border-zinc-800 rounded-md text-zinc-500 hover:text-zinc-200 hover:border-zinc-700 transition-colors font-mono truncate max-w-[260px]"
                title={h}
              >
                {h.length > 40 ? h.slice(0, 40) + "…" : h}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
