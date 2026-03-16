"use client";

import React, { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { loader } from "@monaco-editor/react";
loader.config({ paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/vs" } });

const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="flex-1 w-full bg-[#1e1e1e] animate-pulse" />,
});
import { Copy, Trash2, Check, AlertTriangle, ShieldCheck, Info, Eraser } from "lucide-react";

interface LintRule {
  id: string;
  pattern?: RegExp;
  level: "error" | "warning" | "info";
  message: string;
  check?: (line: string, index: number, allLines: string[]) => boolean;
}

interface LintResult {
  line: number;
  level: "error" | "warning" | "info";
  message: string;
  ruleId: string;
}

const DEFAULT_DOCKERFILE = `# Syntax highlighting and linting
FROM ubuntu:latest
# Warning: Using 'latest' tag is not recommended for production

RUN apt-get update
# Warning: combine apt-get update with apt-get install

ADD ./app.tar.gz /app/
# Info: Consider using COPY instead of ADD if auto-extraction is not needed

EXPOSE 8080

CMD ["node", "app.js"]`;

const LINT_RULES: LintRule[] = [
  {
    id: "latest_tag",
    pattern: /^FROM\s+[^:]+(:latest)?(\s+AS\s+.*)?$/i,
    level: "warning",
    message: "Using the 'latest' tag can lead to unpredictable builds. Pin to a specific version."
  },
  {
    id: "apt_update_alone",
    pattern: /^RUN\s+apt-get\s+update\s*(&&\s*apt-get\s+install.*)?$/i,
    level: "warning",
    message: "Combine 'apt-get update' with 'apt-get install' to avoid caching issues.",
    check: (line) => line.trim().match(/^RUN\s+apt-get\s+update$/i) !== null
  },
  {
    id: "sudo_usage",
    pattern: /^RUN\s+sudo\s+/i,
    level: "error",
    message: "Avoid using 'sudo' in Dockerfiles. You should already be root, or use the USER directive."
  },
  {
    id: "add_vs_copy",
    pattern: /^ADD\s+/i,
    level: "info",
    message: "Use COPY instead of ADD unless you need to automatically extract a local tar archive."
  },
  {
    id: "missing_cmd",
    level: "warning",
    message: "No CMD or ENTRYPOINT found. Docker containers should have a default executable.",
    check: (line, idx, allLines) => {
      // Run this check only at the end
      if (idx !== allLines.length - 1) return false;
      const hasCmdOrEntry = allLines.some(l => l.match(/^(CMD|ENTRYPOINT)\s+/i));
      return !hasCmdOrEntry;
    }
  },
  {
    id: "multiple_cmd",
    level: "error",
    message: "Multiple CMD instructions found. Only the last one will take effect.",
    check: (line, idx, allLines) => {
      if (!line.match(/^CMD\s+/i)) return false;
      const cmdLines = allLines.filter(l => l.match(/^CMD\s+/i));
      return cmdLines.length > 1 && cmdLines.indexOf(line) !== cmdLines.length - 1;
    }
  },
  {
    id: "no_workdir",
    level: "warning",
    message: "No WORKDIR set. Use WORKDIR to define a working directory instead of relying on the root filesystem.",
    check: (line, idx, allLines) => {
      if (idx !== allLines.length - 1) return false;
      return !allLines.some(l => l.trim().match(/^WORKDIR\s+/i));
    }
  },
  {
    id: "apt_no_recommends",
    level: "info",
    message: "Consider adding --no-install-recommends to apt-get install to reduce image size.",
    check: (line) => /^RUN\s+.*apt-get\s+install/i.test(line) && !line.includes("--no-install-recommends")
  },
  {
    id: "no_user",
    level: "warning",
    message: "No USER directive found. Running as root is a security risk. Add a non-root USER.",
    check: (line, idx, allLines) => {
      if (idx !== allLines.length - 1) return false;
      return !allLines.some(l => l.trim().match(/^USER\s+/i));
    }
  },
  {
    id: "npm_install_dev",
    level: "info",
    message: "Consider using 'npm ci --omit=dev' or 'npm install --production' to skip devDependencies in production images.",
    check: (line) => /^RUN\s+npm\s+install(?!\s+--production|\s+--omit)/i.test(line.trim())
  },
  {
    id: "secret_env",
    level: "warning",
    message: "ENV variable name suggests a secret (key, password, token, secret). Avoid baking secrets into images — use runtime environment variables or secrets managers.",
    check: (line) => /^ENV\s+\w*(KEY|PASSWORD|TOKEN|SECRET|PASS|CREDENTIAL)\w*\s*=/i.test(line.trim())
  }
];

export default function DockerfileLinter() {
  const [content, setContent] = useState("");
  const [lintResults, setLintResults] = useState<LintResult[]>([]);
  const [isCopied, setIsCopied] = useState(false);

  const lintDockerfile = (text: string) => {
    const lines = text.split('\n');
    const results: LintResult[] = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('#')) return;

      LINT_RULES.forEach(rule => {
        if (rule.pattern && rule.pattern.test(trimmedLine)) {
             // Specific edge cases inside pattern match
             if (rule.id === 'latest_tag' && trimmedLine.includes(':') && !trimmedLine.match(/:latest(\s|$)/i)) {
                 return; // Safe, has a specific tag
             }
             if (rule.id === 'latest_tag' && !trimmedLine.includes(':')) {
                 // No tag specified defaults to latest in docker
                 results.push({ line: index + 1, level: rule.level, message: rule.message, ruleId: rule.id });
                 return;
             }
             if (rule.id === 'latest_tag') { // Explicit 'latest'
                  results.push({ line: index + 1, level: rule.level, message: rule.message, ruleId: rule.id });
             } else {
                  results.push({ line: index + 1, level: rule.level, message: rule.message, ruleId: rule.id });
             }
        }
        
        if (rule.check && rule.check(trimmedLine, index, lines)) {
          results.push({ line: index + 1, level: rule.level, message: rule.message, ruleId: rule.id });
        }
      });
    });

    // Check for missing CMD/ENTRYPOINT by passing last line
    const eofRule = LINT_RULES.find(r => r.id === 'missing_cmd');
    if (eofRule && eofRule.check && lines.length > 0) {
        if (eofRule.check(lines[lines.length - 1], lines.length - 1, lines)) {
             results.push({ line: lines.length, level: eofRule.level, message: eofRule.message, ruleId: eofRule.id });
        }
    }

    setLintResults(results);
  };

  useEffect(() => {
    lintDockerfile(content);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  const clearContent = () => setContent("");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const getLevelIcon = (level: string) => {
      switch(level) {
          case 'error': return <AlertTriangle className="w-5 h-5 text-red-500" />;
          case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
          case 'info': return <Info className="w-5 h-5 text-blue-500" />;
      }
  };
  
  const getLevelColor = (level: string) => {
      switch(level) {
          case 'error': return 'border-red-500/30 bg-red-500/10 text-red-200';
          case 'warning': return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-200';
          case 'info': return 'border-blue-500/30 bg-blue-500/10 text-blue-200';
      }
  };

  const errors = lintResults.filter(r => r.level === 'error');
  const warnings = lintResults.filter(r => r.level === 'warning');
  const infos = lintResults.filter(r => r.level === 'info');

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center">
             <Eraser className="w-6 h-6 mr-3 text-sky-400" />
            Dockerfile Linter
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Catch anti-patterns, security risks, and optimization missed-opportunities in Dockerfiles.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6 flex-1 min-h-[500px] overflow-hidden">
        
        {/* Editor Panel */}
        <div className="flex flex-col rounded-xl overflow-hidden border border-zinc-800 bg-[#1e1e1e] shadow-2xl h-full relative group">
           <div className="bg-zinc-900 border-b border-zinc-800 h-12 px-4 flex justify-between items-center z-10 shrink-0">
               <span className="text-sm font-medium text-zinc-300 font-mono">Dockerfile</span>
               <div className="flex space-x-2">
                   <button 
                       onClick={clearContent}
                       className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 rounded transition-colors"
                       title="Clear Editor"
                   >
                       <Trash2 className="w-4 h-4" />
                   </button>
                   <button 
                       onClick={handleCopy}
                       className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded transition-colors"
                       title="Copy Content"
                   >
                       {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                   </button>
               </div>
           </div>

           <Editor
            height="100%"
            defaultLanguage="dockerfile"
            theme="vs-dark"
            value={content}
            onChange={(val) => setContent(val || "")}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              lineNumbers: "on",
              glyphMargin: false,
              lineDecorationsWidth: 4,
              lineNumbersMinChars: 3,
              scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
              padding: { top: 16, bottom: 16 },
              smoothScrolling: true,
              cursorBlinking: "smooth",
            }}
          />
        </div>

        {/* Results Panel */}
        <div className="flex flex-col rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-inner h-full flex-1 min-h-0">
            <div className="bg-zinc-900 border-b border-zinc-800 p-4 shrink-0 flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Linter Results</span>
                <div className="flex items-center space-x-3 text-xs font-semibold">
                    <span className="flex items-center text-red-400"><span className="w-2 h-2 rounded-full bg-red-500 mr-1.5"></span>{errors.length}</span>
                    <span className="flex items-center text-yellow-400"><span className="w-2 h-2 rounded-full bg-yellow-500 mr-1.5"></span>{warnings.length}</span>
                    <span className="flex items-center text-blue-400"><span className="w-2 h-2 rounded-full bg-blue-500 mr-1.5"></span>{infos.length}</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                {lintResults.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center text-emerald-500 animate-in fade-in zoom-in-95">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20">
                            <ShieldCheck className="w-8 h-8 text-emerald-500" />
                        </div>
                        <h3 className="text-lg font-bold mb-1">Looking Good!</h3>
                        <p className="text-sm text-emerald-500/70">No immediate issues or anti-patterns detected in the Dockerfile.</p>
                    </div>
                ) : (
                    <div className="p-4 space-y-3">
                        {lintResults.map((result, i) => (
                            <div key={`${result.ruleId}-${i}`} className={`p-4 rounded-lg border flex items-start ${getLevelColor(result.level)}`}>
                                <div className="mt-0.5 mr-3 shrink-0">
                                    {getLevelIcon(result.level)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="font-semibold text-sm capitalize">{result.level}</h4>
                                        <span className="text-xs font-mono opacity-60">Line {result.line}</span>
                                    </div>
                                    <p className="text-sm opacity-90 leading-relaxed">{result.message}</p>
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
