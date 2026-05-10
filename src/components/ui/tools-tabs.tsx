"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import {
  Braces, Settings2, Hash, Clock, KeyRound,
  FileJson, Code2, FileCode2, ListTree, GitBranch, Network,
  Globe, ShieldAlert, GitCompare, FileText, Container,
  ArrowLeftRight, ShieldCheck, Activity, Package, GitMerge,
  Cloud, HardDrive, FileCode, Search, Eye,
} from "lucide-react";
import { getFavorites, toggleFavorite } from "@/lib/favorites";

type Tool = { name: string; description: string; path: string; icon: React.ReactNode; color: string; bg: string };

const devTools: Tool[] = [
  { name: "JSON Formatter",      description: "Format, validate, and minify JSON data",               path: "/json-formatter",   icon: <Braces className="w-5 h-5" />,        color: "text-blue-400",   bg: "bg-blue-400/10" },
  { name: "JWT Decoder",         description: "Inspect JSON Web Tokens and check expiry",             path: "/jwt",              icon: <KeyRound className="w-5 h-5" />,      color: "text-purple-400", bg: "bg-purple-400/10" },
  { name: "Base64 Encoder",      description: "Encode and decode Base64 strings safely",              path: "/base64",           icon: <Hash className="w-5 h-5" />,          color: "text-emerald-400",bg: "bg-emerald-400/10" },
  { name: "Diff Checker",        description: "Compare two texts line, word, or char-level",          path: "/diff-checker",     icon: <GitCompare className="w-5 h-5" />,    color: "text-amber-400",  bg: "bg-amber-400/10" },
  { name: "Markdown Preview",    description: "Write and preview Markdown with GFM support",          path: "/markdown-preview", icon: <FileText className="w-5 h-5" />,      color: "text-lime-400",   bg: "bg-lime-400/10" },
  { name: "Hash Generator",      description: "MD5, SHA-1, SHA-256, SHA-384, SHA-512 hashes",         path: "/hash-generator",   icon: <Hash className="w-5 h-5" />,          color: "text-violet-400", bg: "bg-violet-400/10" },
  { name: "JSON ↔ YAML",         description: "Convert between JSON and YAML with auto-detect",       path: "/json-yaml",        icon: <ArrowLeftRight className="w-5 h-5" />,color: "text-amber-400",  bg: "bg-amber-400/10" },
  { name: "URL Encoder",         description: "Safely encode and decode URL parameters",              path: "/url-encoder",      icon: <Network className="w-5 h-5" />,       color: "text-indigo-400", bg: "bg-indigo-400/10" },
  { name: "UUID Generator",      description: "Generate and validate RFC-4122 UUIDs",                 path: "/uuid",             icon: <FileCode2 className="w-5 h-5" />,     color: "text-cyan-400",   bg: "bg-cyan-400/10" },
  { name: "Timestamp Converter", description: "Convert Unix timestamps to readable dates",            path: "/timestamp",        icon: <Clock className="w-5 h-5" />,         color: "text-rose-400",   bg: "bg-rose-400/10" },
  { name: "HTML Viewer",         description: "Live HTML preview with device-width simulation",       path: "/html-viewer",      icon: <Eye className="w-5 h-5" />,           color: "text-orange-400", bg: "bg-orange-400/10" },
];

const cicdTools: Tool[] = [
  { name: "GitHub Actions", description: "Generate GitHub Actions workflow YAML visually",    path: "/github-actions-generator", icon: <GitMerge className="w-5 h-5" />,  color: "text-indigo-400", bg: "bg-indigo-400/10" },
  { name: "GitLab CI",      description: "Generate GitLab CI/CD pipeline YAML visually",     path: "/gitlab-ci-generator",      icon: <GitBranch className="w-5 h-5" />, color: "text-orange-400", bg: "bg-orange-400/10" },
];

const infraTools: Tool[] = [
  { name: "K8s Generator",        description: "Generate Deployment, Service, Ingress, HPA YAML",  path: "/k8s-generator",              icon: <Container className="w-5 h-5" />, color: "text-cyan-400",   bg: "bg-cyan-400/10" },
  { name: "Helm Chart Generator", description: "Generate Chart.yaml, values.yaml, and templates",  path: "/helm-chart-generator",       icon: <Package className="w-5 h-5" />,   color: "text-teal-400",   bg: "bg-teal-400/10" },
  { name: "Terraform tfvars",     description: "Generate .tfvars files from a variable form",       path: "/terraform-tfvars-generator", icon: <FileCode className="w-5 h-5" />,  color: "text-purple-400", bg: "bg-purple-400/10" },
  { name: "Dockerfile Linter",    description: "Lint Dockerfiles against 12 best-practice rules",  path: "/dockerfile-linter",          icon: <FileCode2 className="w-5 h-5" />, color: "text-sky-400",    bg: "bg-sky-400/10" },
  { name: "YAML Validator",       description: "Lint and format Kubernetes and CI configs",         path: "/yaml-validator",             icon: <ListTree className="w-5 h-5" />,  color: "text-orange-400", bg: "bg-orange-400/10" },
];

const cloudTools: Tool[] = [
  { name: "AWS ARN Parser",    description: "Parse and validate AWS ARN strings into components", path: "/aws-arn-parser",           icon: <Cloud className="w-5 h-5" />,       color: "text-orange-400", bg: "bg-orange-400/10" },
  { name: "Cloud Storage URL", description: "Parse S3, GCS, and Azure Blob Storage URLs",         path: "/cloud-storage-url-parser", icon: <HardDrive className="w-5 h-5" />,   color: "text-blue-400",   bg: "bg-blue-400/10" },
  { name: "CIDR Calculator",   description: "Subnet mask, host range, broadcast from CIDR",       path: "/cidr-calculator",          icon: <Network className="w-5 h-5" />,     color: "text-indigo-400", bg: "bg-indigo-400/10" },
  { name: "SSL Decoder",       description: "Inspect SSL/TLS certs — SANs, expiry, fingerprints", path: "/ssl-decoder",              icon: <ShieldCheck className="w-5 h-5" />, color: "text-emerald-400",bg: "bg-emerald-400/10" },
  { name: "HTTP Headers",      description: "Inspect response headers and security posture",       path: "/http-headers",             icon: <Globe className="w-5 h-5" />,       color: "text-blue-400",   bg: "bg-blue-400/10" },
  { name: "Port Reference",    description: "Look up well-known TCP/UDP port numbers",             path: "/port-reference",           icon: <Network className="w-5 h-5" />,     color: "text-violet-400", bg: "bg-violet-400/10" },
];

const observabilityTools: Tool[] = [
  { name: "PromQL Builder",     description: "Build Prometheus queries visually with aggregations", path: "/promql-builder",   icon: <Activity className="w-5 h-5" />,    color: "text-yellow-400", bg: "bg-yellow-400/10" },
  { name: "Regex Log Parser",   description: "Test regex against log lines, extract named groups",  path: "/regex-log-parser", icon: <Search className="w-5 h-5" />,      color: "text-teal-400",   bg: "bg-teal-400/10" },
  { name: "Log Formatter",      description: "Format JSON logs and filter by severity level",       path: "/log-formatter",    icon: <FileJson className="w-5 h-5" />,    color: "text-yellow-400", bg: "bg-yellow-400/10" },
  { name: "Secret Scanner",     description: "Detect AWS, GCP, GitHub, Azure credentials in text", path: "/secret-scanner",   icon: <ShieldAlert className="w-5 h-5" />, color: "text-red-400",    bg: "bg-red-400/10" },
  { name: "ENV Parser",         description: "Parse and validate .env files, export to JSON",       path: "/env-parser",       icon: <Settings2 className="w-5 h-5" />,   color: "text-teal-400",   bg: "bg-teal-400/10" },
  { name: "Cron Builder",       description: "Build and understand cron expressions",               path: "/cron-builder",     icon: <Clock className="w-5 h-5" />,       color: "text-emerald-400",bg: "bg-emerald-400/10" },
  { name: "Git Command Builder",description: "Build complex git commands with a visual UI",         path: "/git-builder",      icon: <GitBranch className="w-5 h-5" />,   color: "text-pink-400",   bg: "bg-pink-400/10" },
];

const ALL_TOOLS = [...devTools, ...cicdTools, ...infraTools, ...cloudTools, ...observabilityTools];

const STATIC_TABS = [
  { id: "all",           label: "All",            icon: <Search className="w-3.5 h-3.5" />,    tools: ALL_TOOLS },
  { id: "dev",           label: "Developer",      icon: <Code2 className="w-3.5 h-3.5" />,     tools: devTools },
  { id: "cicd",          label: "CI / CD",        icon: <GitMerge className="w-3.5 h-3.5" />,  tools: cicdTools },
  { id: "infra",         label: "Infrastructure", icon: <Container className="w-3.5 h-3.5" />, tools: infraTools },
  { id: "cloud",         label: "Cloud & Network",icon: <Cloud className="w-3.5 h-3.5" />,     tools: cloudTools },
  { id: "observability", label: "Observability",  icon: <Activity className="w-3.5 h-3.5" />,  tools: observabilityTools },
];

function ToolCard({
  tool,
  favorited,
  onToggleFavorite,
}: {
  tool: Tool;
  favorited: boolean;
  onToggleFavorite: (path: string) => void;
}) {
  return (
    <Link
      href={tool.path}
      className="group relative p-5 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 hover:bg-zinc-800/50 transition-all duration-200 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Star button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggleFavorite(tool.path);
        }}
        aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
        className={`absolute top-3 right-3 z-20 p-1 rounded-md transition-all duration-150
          ${favorited
            ? "text-amber-400 opacity-100"
            : "text-zinc-600 opacity-0 group-hover:opacity-100 hover:text-amber-400"
          }`}
      >
        <Star className={`w-3.5 h-3.5 ${favorited ? "fill-amber-400" : ""}`} />
      </button>

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

function EmptyFavorites() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <div className="p-4 rounded-2xl bg-amber-400/10 border border-amber-400/20 mb-4">
        <Star className="w-8 h-8 text-amber-400" />
      </div>
      <p className="text-zinc-300 font-medium mb-1">No favorites yet</p>
      <p className="text-sm text-zinc-500">Hover any tool card and click the <Star className="w-3 h-3 inline-block text-zinc-400 mx-0.5" /> star to pin it here.</p>
    </div>
  );
}

export function ToolsTabs({ totalCount }: { totalCount: number }) {
  const [active, setActive] = useState("all");
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  const handleToggleFavorite = useCallback((path: string) => {
    setFavorites(toggleFavorite(path));
  }, []);

  const favoritedTools = ALL_TOOLS.filter((t) => favorites.includes(t.path));

  const tabs = [
    ...STATIC_TABS,
    {
      id: "favorites",
      label: "Favorites",
      icon: <Star className={`w-3.5 h-3.5 ${favoritedTools.length > 0 ? "fill-amber-400 text-amber-400" : ""}`} />,
      tools: favoritedTools,
    },
  ];

  const tab = tabs.find((t) => t.id === active)!;

  return (
    <div>
      {/* Tab bar */}
      <div className="flex items-center gap-1 flex-wrap mb-6 p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
              active === t.id
                ? t.id === "favorites"
                  ? "bg-amber-500/15 text-amber-300 shadow-sm border border-amber-500/20"
                  : "bg-zinc-700 text-white shadow-sm"
                : t.id === "favorites" && favoritedTools.length > 0
                  ? "text-amber-400/70 hover:text-amber-300 hover:bg-amber-500/10"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60"
            }`}
          >
            {t.icon}
            {t.label}
            {t.id !== "favorites" && (
              <span className={`text-[10px] tabular-nums ${active === t.id ? "text-zinc-400" : "text-zinc-600"}`}>
                {t.tools.length}
              </span>
            )}
            {t.id === "favorites" && favoritedTools.length > 0 && (
              <span className={`text-[10px] tabular-nums ${active === t.id ? "text-amber-400" : "text-amber-500/60"}`}>
                {favoritedTools.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-xs text-zinc-600 mb-4">
        {tab.id === "all"
          ? `${totalCount} tools`
          : tab.id === "favorites"
            ? `${favoritedTools.length} pinned tool${favoritedTools.length !== 1 ? "s" : ""}`
            : `${tab.tools.length} of ${totalCount} tools`}
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tab.id === "favorites" && favoritedTools.length === 0
          ? <EmptyFavorites />
          : tab.tools.map((tool) => (
              <ToolCard
                key={tool.path}
                tool={tool}
                favorited={favorites.includes(tool.path)}
                onToggleFavorite={handleToggleFavorite}
              />
            ))
        }
      </div>
    </div>
  );
}
