"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Braces, TerminalSquare, Settings2, Hash, Clock, KeyRound,
  FileJson, Code2, FileCode2, ListTree, GitBranch, Network,
  Globe, X, ShieldAlert, GitCompare, FileText, Container,
  ArrowLeftRight, ShieldCheck, Activity, Package, GitMerge,
  Cloud, HardDrive, FileCode, Search, ChevronDown, ChevronRight, Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

const toolCategories = [
  {
    title: "Developer Tools",
    icon: <Code2 className="w-4 h-4 text-blue-400" />,
    items: [
      { name: "JSON Formatter",     path: "/json-formatter",   icon: <Braces className="w-4 h-4 mr-3" /> },
      { name: "JWT Decoder",        path: "/jwt",              icon: <KeyRound className="w-4 h-4 mr-3" /> },
      { name: "Base64 Encoder",     path: "/base64",           icon: <Hash className="w-4 h-4 mr-3" /> },
      { name: "Diff Checker",       path: "/diff-checker",     icon: <GitCompare className="w-4 h-4 mr-3" /> },
      { name: "Markdown Preview",   path: "/markdown-preview", icon: <FileText className="w-4 h-4 mr-3" /> },
      { name: "Hash Generator",     path: "/hash-generator",   icon: <Hash className="w-4 h-4 mr-3" /> },
      { name: "JSON ↔ YAML",        path: "/json-yaml",        icon: <ArrowLeftRight className="w-4 h-4 mr-3" /> },
      { name: "URL Encoder",        path: "/url-encoder",      icon: <Network className="w-4 h-4 mr-3" /> },
      { name: "UUID Generator",     path: "/uuid",             icon: <FileCode2 className="w-4 h-4 mr-3" /> },
      { name: "Timestamp Converter",path: "/timestamp",        icon: <Clock className="w-4 h-4 mr-3" /> },
      { name: "HTML Viewer",         path: "/html-viewer",      icon: <Eye className="w-4 h-4 mr-3" /> },
    ],
  },
  {
    title: "CI / CD",
    icon: <GitMerge className="w-4 h-4 text-indigo-400" />,
    items: [
      { name: "GitHub Actions",  path: "/github-actions-generator", icon: <GitMerge className="w-4 h-4 mr-3" /> },
      { name: "GitLab CI",       path: "/gitlab-ci-generator",      icon: <GitBranch className="w-4 h-4 mr-3" /> },
    ],
  },
  {
    title: "Infrastructure",
    icon: <Container className="w-4 h-4 text-cyan-400" />,
    items: [
      { name: "K8s Generator",        path: "/k8s-generator",               icon: <Container className="w-4 h-4 mr-3" /> },
      { name: "Helm Chart Generator", path: "/helm-chart-generator",        icon: <Package className="w-4 h-4 mr-3" /> },
      { name: "Terraform tfvars",     path: "/terraform-tfvars-generator",  icon: <FileCode className="w-4 h-4 mr-3" /> },
      { name: "Dockerfile Linter",    path: "/dockerfile-linter",           icon: <FileCode2 className="w-4 h-4 mr-3" /> },
      { name: "YAML Validator",       path: "/yaml-validator",              icon: <ListTree className="w-4 h-4 mr-3" /> },
    ],
  },
  {
    title: "Cloud & Network",
    icon: <Cloud className="w-4 h-4 text-orange-400" />,
    items: [
      { name: "AWS ARN Parser",          path: "/aws-arn-parser",           icon: <Cloud className="w-4 h-4 mr-3" /> },
      { name: "Cloud Storage URL",       path: "/cloud-storage-url-parser", icon: <HardDrive className="w-4 h-4 mr-3" /> },
      { name: "CIDR Calculator",         path: "/cidr-calculator",          icon: <Network className="w-4 h-4 mr-3" /> },
      { name: "SSL Decoder",             path: "/ssl-decoder",              icon: <ShieldCheck className="w-4 h-4 mr-3" /> },
      { name: "HTTP Headers",            path: "/http-headers",             icon: <Globe className="w-4 h-4 mr-3" /> },
      { name: "Port Reference",          path: "/port-reference",           icon: <Network className="w-4 h-4 mr-3" /> },
    ],
  },
  {
    title: "Observability & Security",
    icon: <Activity className="w-4 h-4 text-yellow-400" />,
    items: [
      { name: "PromQL Builder",    path: "/promql-builder",    icon: <Activity className="w-4 h-4 mr-3" /> },
      { name: "Regex Log Parser",  path: "/regex-log-parser",  icon: <Search className="w-4 h-4 mr-3" /> },
      { name: "Log Formatter",     path: "/log-formatter",     icon: <FileJson className="w-4 h-4 mr-3" /> },
      { name: "Secret Scanner",    path: "/secret-scanner",    icon: <ShieldAlert className="w-4 h-4 mr-3" /> },
      { name: "ENV Parser",        path: "/env-parser",        icon: <Settings2 className="w-4 h-4 mr-3" /> },
      { name: "Cron Builder",      path: "/cron-builder",      icon: <Clock className="w-4 h-4 mr-3" /> },
      { name: "Git Command Builder", path: "/git-builder",     icon: <GitBranch className="w-4 h-4 mr-3" /> },
    ],
  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem("sidebar:collapsed");
      if (saved) setCollapsed(JSON.parse(saved));
    } catch {}
  }, []);

  const toggleCategory = (title: string) => {
    setCollapsed((prev) => {
      const next = { ...prev, [title]: !prev[title] };
      try { localStorage.setItem("sidebar:collapsed", JSON.stringify(next)); } catch {}
      return next;
    });
  };

  return (
    <div className={cn(
      "fixed lg:static inset-y-0 left-0 z-30 w-64 h-screen bg-zinc-950 border-r border-zinc-800 flex flex-col text-zinc-300 transition-transform duration-200 ease-in-out",
      open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
    )}>
      <div className="p-6 border-b border-zinc-800/50 flex items-center justify-between shrink-0">
        <h1 className="text-xl font-bold text-white flex items-center">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-3 shadow-lg shadow-indigo-500/20">
            <TerminalSquare className="w-5 h-5 text-white" />
          </div>
          DevsTool
        </h1>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          aria-label="Close navigation menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 no-scrollbar">
        {toolCategories.map((category) => {
          const isCollapsed = collapsed[category.title] ?? false;
          const hasActive = category.items.some((i) => pathname === i.path);
          return (
            <div key={category.title}>
              <button
                onClick={() => toggleCategory(category.title)}
                className={cn(
                  "w-full flex items-center justify-between px-2 py-2 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors",
                  hasActive ? "text-zinc-200" : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                <span className="flex items-center gap-2">
                  {category.icon}
                  {category.title}
                </span>
                {isCollapsed
                  ? <ChevronRight className="w-3 h-3" />
                  : <ChevronDown className="w-3 h-3" />
                }
              </button>

              {!isCollapsed && (
                <div className="mt-1 mb-2 space-y-0.5">
                  {category.items.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        onClick={onClose}
                        className={cn(
                          "flex items-center w-full px-3 py-2 text-sm rounded-md transition-all duration-200 group",
                          isActive
                            ? "bg-zinc-800/80 text-white font-medium shadow-sm"
                            : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                        )}
                      >
                        <span className={cn(
                          "transition-colors",
                          isActive ? "text-indigo-400" : "text-zinc-500 group-hover:text-zinc-400"
                        )}>
                          {item.icon}
                        </span>
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
