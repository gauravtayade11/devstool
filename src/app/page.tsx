import type { Metadata } from "next";
import Link from "next/link";
import {
  Braces,
  TerminalSquare,
  Settings2,
  Hash,
  Clock,
  KeyRound,
  FileJson,
  Code2,
  FileCode2,
  ListTree,
  GitBranch,
  Network,
  Globe,
  ShieldAlert,
  GitCompare,
  FileText,
  Container,
} from "lucide-react";

export const metadata: Metadata = {
  title: "DevsTool — Developer & DevOps Toolkit",
  description: "15 fast, privacy-first utilities for developers and DevOps engineers. JSON formatter, JWT decoder, Secret Scanner, Dockerfile linter, and more — all client-side.",
};

const devTools = [
  { name: "JSON Formatter", description: "Format, validate, and minify JSON data", path: "/json-formatter", icon: <Braces className="w-5 h-5" />, color: "text-blue-400", bg: "bg-blue-400/10" },
  { name: "JWT Decoder", description: "Inspect JSON Web Tokens and check expiry", path: "/jwt", icon: <KeyRound className="w-5 h-5" />, color: "text-purple-400", bg: "bg-purple-400/10" },
  { name: "Base64 Encoder", description: "Encode and decode Base64 strings safely", path: "/base64", icon: <Hash className="w-5 h-5" />, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  { name: "Diff Checker", description: "Compare two texts line, word, or char-level", path: "/diff-checker", icon: <GitCompare className="w-5 h-5" />, color: "text-amber-400", bg: "bg-amber-400/10" },
  { name: "Markdown Preview", description: "Write and preview Markdown with GFM support", path: "/markdown-preview", icon: <FileText className="w-5 h-5" />, color: "text-lime-400", bg: "bg-lime-400/10" },
  { name: "URL Encoder", description: "Safely encode and decode URL parameters", path: "/url-encoder", icon: <Network className="w-5 h-5" />, color: "text-indigo-400", bg: "bg-indigo-400/10" },
  { name: "UUID Generator", description: "Generate and validate RFC-4122 UUIDs", path: "/uuid", icon: <FileCode2 className="w-5 h-5" />, color: "text-cyan-400", bg: "bg-cyan-400/10" },
  { name: "Timestamp Converter", description: "Convert Unix timestamps to readable dates", path: "/timestamp", icon: <Clock className="w-5 h-5" />, color: "text-rose-400", bg: "bg-rose-400/10" },
];

const devopsTools = [
  { name: "K8s Generator", description: "Generate Deployment, Service, Ingress, ConfigMap and HPA YAML", path: "/k8s-generator", icon: <Container className="w-5 h-5" />, color: "text-cyan-400", bg: "bg-cyan-400/10" },
  { name: "CIDR Calculator", description: "Subnet mask, host range, broadcast address from CIDR notation", path: "/cidr-calculator", icon: <Network className="w-5 h-5" />, color: "text-indigo-400", bg: "bg-indigo-400/10" },
  { name: "Secret Scanner", description: "Detect exposed credentials, API keys and tokens before they leak", path: "/secret-scanner", icon: <ShieldAlert className="w-5 h-5" />, color: "text-red-400", bg: "bg-red-400/10" },
  { name: "Dockerfile Linter", description: "Lint Dockerfiles for best practices", path: "/dockerfile-linter", icon: <FileCode2 className="w-5 h-5" />, color: "text-sky-400", bg: "bg-sky-400/10" },
  { name: "YAML Validator", description: "Lint and format Kubernetes and CI configs", path: "/yaml-validator", icon: <ListTree className="w-5 h-5" />, color: "text-orange-400", bg: "bg-orange-400/10" },
  { name: "ENV Parser", description: "Parse and validate .env files, export to JSON", path: "/env-parser", icon: <Settings2 className="w-5 h-5" />, color: "text-teal-400", bg: "bg-teal-400/10" },
  { name: "Log Formatter", description: "Format JSON logs and filter by severity", path: "/log-formatter", icon: <FileJson className="w-5 h-5" />, color: "text-yellow-400", bg: "bg-yellow-400/10" },
  { name: "Cron Builder", description: "Build and understand cron expressions", path: "/cron-builder", icon: <Clock className="w-5 h-5" />, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  { name: "Git Command Builder", description: "Build complex git commands with a UI", path: "/git-builder", icon: <GitBranch className="w-5 h-5" />, color: "text-pink-400", bg: "bg-pink-400/10" },
  { name: "HTTP Headers", description: "Inspect response headers and security posture", path: "/http-headers", icon: <Globe className="w-5 h-5" />, color: "text-blue-400", bg: "bg-blue-400/10" },
  { name: "Port Reference", description: "Look up well-known port numbers", path: "/port-reference", icon: <Network className="w-5 h-5" />, color: "text-violet-400", bg: "bg-violet-400/10" },
];

function ToolCard({ tool }: { tool: typeof devTools[0] }) {
  return (
    <Link
      href={tool.path}
      className="group relative p-5 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 hover:bg-zinc-800/50 transition-all duration-200 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <div className="flex items-start space-x-4 relative z-10">
        <div className={`p-2.5 rounded-lg ${tool.bg} ${tool.color} ring-1 ring-inset ring-white/5 shrink-0 group-hover:scale-110 transition-transform duration-200`}>
          {tool.icon}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-zinc-100 mb-1 group-hover:text-white transition-colors">{tool.name}</h3>
          <p className="text-xs text-zinc-500 leading-relaxed">{tool.description}</p>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto py-8">
      {/* Hero */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center justify-center p-3 mb-6 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/30">
          <Settings2 className="w-10 h-10 text-indigo-400" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
          DevsTool
        </h1>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          {devTools.length + devopsTools.length} fast, privacy-first utilities for developers and DevOps engineers — all client-side, no data leaves your browser.
        </p>
      </div>

      {/* Developer Tools */}
      <section className="mb-10">
        <div className="flex items-center space-x-2 mb-4">
          <Code2 className="w-4 h-4 text-blue-400" />
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-widest">Developer Tools</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {devTools.map((tool) => <ToolCard key={tool.path} tool={tool} />)}
        </div>
      </section>

      {/* DevOps Tools */}
      <section>
        <div className="flex items-center space-x-2 mb-4">
          <TerminalSquare className="w-4 h-4 text-orange-400" />
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-widest">DevOps Tools</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {devopsTools.map((tool) => <ToolCard key={tool.path} tool={tool} />)}
        </div>
      </section>
    </div>
  );
}
