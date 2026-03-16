"use client";

import { useState, useMemo } from "react";
import { ShieldAlert, ShieldCheck, Search, Trash2, AlertTriangle, Info, ClipboardPaste } from "lucide-react";
import { CopyButton } from "@/components/ui/copy-button";
import { useDebounce } from "@/lib/hooks/use-debounce";

interface SecretPattern {
  id: string;
  name: string;
  severity: "critical" | "high" | "medium";
  pattern: RegExp;
  description: string;
  recommendation: string;
}

interface Finding {
  id: string;
  line: number;
  lineContent: string;
  maskedValue: string;
  pattern: SecretPattern;
}

const PATTERNS: SecretPattern[] = [
  {
    id: "aws_access_key",
    name: "AWS Access Key ID",
    severity: "critical",
    pattern: /\bAKIA[0-9A-Z]{16}\b/g,
    description: "AWS IAM access key ID. Grants programmatic access to AWS services.",
    recommendation: "Revoke immediately via AWS IAM console → Security credentials. Use IAM roles instead of static credentials.",
  },
  {
    id: "github_token",
    name: "GitHub Access Token",
    severity: "critical",
    pattern: /\b(ghp_[a-zA-Z0-9]{36}|gho_[a-zA-Z0-9]{36}|ghs_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]{82})\b/g,
    description: "GitHub personal access token or OAuth token. Can access repositories and APIs.",
    recommendation: "Revoke immediately: GitHub → Settings → Developer settings → Personal access tokens.",
  },
  {
    id: "google_api_key",
    name: "Google API Key",
    severity: "high",
    pattern: /\bAIza[0-9A-Za-z\-_]{35}\b/g,
    description: "Google Cloud / Firebase API key. Scope depends on which APIs are enabled.",
    recommendation: "Restrict or regenerate in Google Cloud Console. Add HTTP referrer or IP restrictions.",
  },
  {
    id: "stripe_live_secret",
    name: "Stripe Live Secret Key",
    severity: "critical",
    pattern: /\b(sk_live_[0-9a-zA-Z]{24,}|rk_live_[0-9a-zA-Z]{24,})\b/g,
    description: "Stripe live secret key. Grants full access to your Stripe account including charges and payouts.",
    recommendation: "Roll the key immediately in the Stripe Dashboard → Developers → API keys.",
  },
  {
    id: "stripe_test_key",
    name: "Stripe Test Key",
    severity: "medium",
    pattern: /\b(sk_test_[0-9a-zA-Z]{24,}|pk_test_[0-9a-zA-Z]{24,})\b/g,
    description: "Stripe test mode key. Low risk but should not be committed to version control.",
    recommendation: "Move to environment variables. Avoid committing test keys to public repositories.",
  },
  {
    id: "private_key_pem",
    name: "Private Key (PEM)",
    severity: "critical",
    pattern: /-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/g,
    description: "PEM-encoded private key detected. Can be used to impersonate your service or decrypt traffic.",
    recommendation: "Never store private keys in code or logs. Use a secrets manager (Vault, AWS Secrets Manager, GCP Secret Manager).",
  },
  {
    id: "jwt_token",
    name: "JWT Token",
    severity: "high",
    pattern: /\beyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\b/g,
    description: "JSON Web Token detected. May contain user identity, roles, and other sensitive claims.",
    recommendation: "Never log or share JWT tokens. Treat them like passwords — they authenticate requests.",
  },
  {
    id: "npm_token",
    name: "npm Access Token",
    severity: "critical",
    pattern: /\bnpm_[A-Za-z0-9]{36}\b/g,
    description: "npm automation or publish token. Can publish packages to the npm registry.",
    recommendation: "Revoke immediately at npmjs.com → Access Tokens.",
  },
  {
    id: "slack_token",
    name: "Slack Bot/User Token",
    severity: "high",
    pattern: /\bxox[baprs]-[0-9]{10,12}-[0-9]{10,12}-[a-zA-Z0-9]{24}\b/g,
    description: "Slack API token. Can read messages, post to channels, and access workspace data.",
    recommendation: "Revoke immediately in the Slack API dashboard → Your apps → OAuth & Permissions.",
  },
  {
    id: "slack_webhook",
    name: "Slack Incoming Webhook",
    severity: "high",
    pattern: /https:\/\/hooks\.slack\.com\/services\/T[A-Z0-9]+\/B[A-Z0-9]+\/[a-zA-Z0-9]+/g,
    description: "Slack incoming webhook URL. Anyone with this URL can post messages to your Slack workspace.",
    recommendation: "Revoke in Slack → App settings → Incoming Webhooks. Generate a new webhook URL.",
  },
  {
    id: "sendgrid_key",
    name: "SendGrid API Key",
    severity: "critical",
    pattern: /\bSG\.[a-zA-Z0-9_-]{22,}\.[a-zA-Z0-9_-]{43,}\b/g,
    description: "SendGrid API key. Can send emails on behalf of your account.",
    recommendation: "Revoke immediately in SendGrid Dashboard → Settings → API Keys.",
  },
  {
    id: "twilio_sid",
    name: "Twilio Account SID",
    severity: "high",
    pattern: /\bAC[a-fA-F0-9]{32}\b/g,
    description: "Twilio Account SID. Combined with an auth token, grants access to your Twilio account.",
    recommendation: "Rotate credentials in the Twilio Console. Never expose SID + auth token together.",
  },
  {
    id: "env_password",
    name: "Plaintext Password (ENV)",
    severity: "high",
    pattern: /^(?:export\s+)?(PASSWORD|PASSWD|DB_PASS|DB_PASSWORD|SECRET_KEY|MASTER_KEY|ADMIN_PASSWORD)\s*=\s*(?!['"]?\s*$)['"]?(.{4,})['"]?\s*$/gim,
    description: "Hardcoded password or secret in an environment variable assignment.",
    recommendation: "Use a secrets manager or inject at runtime. Never hardcode credentials — ensure .env is in .gitignore.",
  },
  {
    id: "env_api_key",
    name: "API Key in ENV",
    severity: "medium",
    pattern: /^(?:export\s+)?[A-Z_]*(API_KEY|SECRET_TOKEN|ACCESS_TOKEN|AUTH_TOKEN)[A-Z_]*\s*=\s*(?!['"]?\s*$)['"]?([a-zA-Z0-9_\-]{16,})['"]?\s*$/gim,
    description: "API key or token value in an environment variable. May be sensitive depending on the service.",
    recommendation: "Ensure this file is in .gitignore. Consider using a secrets manager for production deployments.",
  },
];

function maskValue(value: string): string {
  const eqIdx = value.indexOf("=");
  if (eqIdx !== -1) {
    return `${value.slice(0, eqIdx + 1)}****`;
  }
  if (value.length <= 8) return "****";
  return value.slice(0, 6) + "•".repeat(Math.min(value.length - 8, 18)) + "...";
}

const SEVERITY_CONFIG = {
  critical: {
    label: "Critical",
    badge: "text-red-400 bg-red-400/10 border-red-500/30",
    bar: "border-l-2 border-red-500",
    icon: <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />,
  },
  high: {
    label: "High",
    badge: "text-orange-400 bg-orange-400/10 border-orange-500/30",
    bar: "border-l-2 border-orange-500",
    icon: <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0" />,
  },
  medium: {
    label: "Medium",
    badge: "text-yellow-400 bg-yellow-400/10 border-yellow-500/30",
    bar: "border-l-2 border-yellow-500",
    icon: <Info className="w-4 h-4 text-yellow-400 shrink-0" />,
  },
};

const SAMPLE = `# .env — example with intentionally exposed secrets
DATABASE_URL=postgres://admin:hunter2@prod-db.internal:5432/app
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
STRIPE_SECRET_KEY=sk_live_ABCDEFGHIJKLMNOPQRSTUVwx
GITHUB_TOKEN=ghp_1234567890abcdefghij1234567890abcd12
SENDGRID_API_KEY=SG.ngeVJksRSZCqJKqFGGFmA.TwL2iGABf9DHoTf09kqeF_rhAgVwlFe4RBPHQc9Qo
JWT_SECRET=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA0Z3VS5JJcds3xHn/ygWep4PAtEsHAFqNMHFmCMUXMh1Jd...
-----END RSA PRIVATE KEY-----`;

export default function SecretScanner() {
  const [input, setInput] = useState("");
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const debouncedInput = useDebounce(input, 300);

  const findings = useMemo<Finding[]>(() => {
    if (!debouncedInput.trim()) return [];

    const lines = debouncedInput.split("\n");
    const results: Finding[] = [];

    PATTERNS.forEach((pat) => {
      const regex = new RegExp(pat.pattern.source, pat.pattern.flags);
      lines.forEach((line, lineIdx) => {
        let match: RegExpExecArray | null;
        while ((match = regex.exec(line)) !== null) {
          results.push({
            id: `${pat.id}-${lineIdx}-${match.index}`,
            line: lineIdx + 1,
            lineContent: line.trim(),
            maskedValue: maskValue(match[0]),
            pattern: pat,
          });
        }
      });
    });

    const order = { critical: 0, high: 1, medium: 2 };
    return results.sort((a, b) =>
      order[a.pattern.severity] !== order[b.pattern.severity]
        ? order[a.pattern.severity] - order[b.pattern.severity]
        : a.line - b.line
    );
  }, [debouncedInput]);

  const counts = useMemo(() => ({
    critical: findings.filter(f => f.pattern.severity === "critical").length,
    high: findings.filter(f => f.pattern.severity === "high").length,
    medium: findings.filter(f => f.pattern.severity === "medium").length,
  }), [findings]);

  const isClean = input.trim().length > 0 && findings.length === 0;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-6xl mx-auto">

      {/* Header */}
      <div className="mb-5 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center">
            <ShieldAlert className="w-6 h-6 mr-3 text-red-400" />
            Secret Scanner
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Paste code, logs, configs, or .env files and instantly detect exposed credentials before they cause damage.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full shrink-0 self-start">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          <span className="font-medium">100% local — nothing sent to any server</span>
        </div>
      </div>

      {/* Detects pill list */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {["AWS Keys", "GitHub Tokens", "Stripe Keys", "Private Keys", "JWTs", "npm Tokens", "Slack Tokens", "SendGrid", "Twilio", "ENV Passwords"].map(label => (
          <span key={label} className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-800/80 border border-zinc-700/50 text-zinc-400 font-medium">
            {label}
          </span>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5 flex-1 min-h-0 overflow-hidden">

        {/* ── Input ── */}
        <div className="flex flex-col rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
          <div className="flex items-center justify-between px-4 h-11 border-b border-zinc-800 bg-zinc-900/80 shrink-0">
            <span className="text-sm font-medium text-zinc-300 flex items-center space-x-2">
              <ClipboardPaste className="w-4 h-4 text-zinc-500" />
              <span>Paste content to scan</span>
            </span>
            <div className="flex items-center space-x-1">
              <CopyButton text={input} className="text-zinc-500 hover:text-white hover:bg-zinc-800" />
              <button
                onClick={() => { setInput(""); setExpandedIdx(null); }}
                className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-red-500/10 rounded transition-colors"
                aria-label="Clear input"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <textarea
            value={input}
            onChange={(e) => { setInput(e.target.value); setExpandedIdx(null); }}
            placeholder="Paste any text here — .env file, source code, CI config, log output, docker-compose.yml..."
            className="flex-1 w-full p-4 bg-transparent text-zinc-300 font-mono text-xs leading-relaxed resize-none focus:outline-none custom-scrollbar"
            spellCheck={false}
          />
        </div>

        {/* ── Results ── */}
        <div className="flex flex-col rounded-xl border border-zinc-800 bg-[#0d0d0f] overflow-hidden">
          <div className="flex items-center justify-between px-4 h-11 border-b border-zinc-800 bg-zinc-900/80 shrink-0">
            <span className="text-sm font-semibold text-white">
              {findings.length === 0 ? "Scan Results" : `${findings.length} finding${findings.length !== 1 ? "s" : ""} detected`}
            </span>
            {findings.length > 0 && (
              <div className="flex items-center space-x-2 text-xs font-semibold">
                {counts.critical > 0 && <span className="text-red-400">{counts.critical} critical</span>}
                {counts.high > 0 && <span className="text-orange-400">{counts.high} high</span>}
                {counts.medium > 0 && <span className="text-yellow-400">{counts.medium} medium</span>}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {!input.trim() ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-600 p-8 text-center">
                <Search className="w-10 h-10 mb-3 opacity-20" />
                <p className="text-sm">Paste any content on the left to begin scanning</p>
              </div>
            ) : isClean ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in-95">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-emerald-400 mb-1">No secrets detected</h3>
                <p className="text-sm text-zinc-500 max-w-xs">
                  No known secret patterns found. Always double-check before sharing publicly.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/40">
                {findings.map((finding, i) => {
                  const cfg = SEVERITY_CONFIG[finding.pattern.severity];
                  const isOpen = expandedIdx === i;
                  return (
                    <div key={finding.id} className={cfg.bar}>
                      <button
                        className="w-full flex items-start px-4 py-3 hover:bg-white/[0.025] transition-colors text-left"
                        onClick={() => setExpandedIdx(isOpen ? null : i)}
                        aria-expanded={isOpen}
                      >
                        <div className="mt-0.5 mr-3">{cfg.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-sm font-semibold text-zinc-200 truncate pr-2">{finding.pattern.name}</span>
                            <div className="flex items-center space-x-2 shrink-0">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded border font-bold uppercase ${cfg.badge}`}>
                                {cfg.label}
                              </span>
                              <span className="text-xs text-zinc-600 font-mono">L{finding.line}</span>
                            </div>
                          </div>
                          <p className="text-xs font-mono text-zinc-500 truncate">{finding.maskedValue}</p>
                        </div>
                        <span className="ml-3 text-zinc-700 text-[10px] shrink-0 mt-1">{isOpen ? "▲" : "▼"}</span>
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-4 space-y-3 bg-zinc-950/60 animate-in fade-in slide-in-from-top-1 duration-150">
                          {/* Line preview */}
                          <div className="font-mono text-xs bg-zinc-900 rounded-lg p-3 border border-zinc-800 break-all">
                            <span className="text-zinc-600 select-none mr-2">Line {finding.line}:</span>
                            <span className="text-zinc-400">{finding.lineContent}</span>
                          </div>
                          {/* What is this */}
                          <div className="text-xs text-zinc-400 leading-relaxed">
                            <span className="text-zinc-500 font-semibold block mb-1">What is this?</span>
                            {finding.pattern.description}
                          </div>
                          {/* Recommendation */}
                          <div className="text-xs leading-relaxed p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                            <span className="text-amber-400 font-semibold block mb-1">How to fix</span>
                            <span className="text-amber-200/70">{finding.pattern.recommendation}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
