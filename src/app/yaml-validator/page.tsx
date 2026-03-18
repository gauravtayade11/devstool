"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { loader } from "@monaco-editor/react";
loader.config({ paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/vs" } });

const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="flex-1 w-full bg-[#1e1e1e] animate-pulse" />,
});
import * as yaml from "js-yaml";
import { AlertCircle, AlertTriangle, FileDown, FileUp, Sparkles, Trash2, ShieldCheck, ListTree } from "lucide-react";
import { CopyButton } from "@/components/ui/copy-button";
import { ShareButton } from "@/components/ui/share-button";
import { getSharedState } from "@/lib/share";

export default function YamlValidator() {
  const [inputData, setInputData] = useState<string>("");

  useEffect(() => {
    const s = getSharedState<{ input: string }>();
    if (s?.input) setInputData(s.input);
  }, []);
  const [errorLine, setErrorLine] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const validateYaml = (content: string) => {
    setInputData(content);
    if (!content.trim()) {
      setIsValid(true);
      setErrorLine(null);
      setErrorMessage(null);
      return;
    }

    try {
      // LoadAll supports multi-document YAML files (separated by ---)
      yaml.loadAll(content); 
      setIsValid(true);
      setErrorLine(null);
      setErrorMessage(null);
    } catch (e: any) {
      setIsValid(false);
      setErrorMessage(e.message || "Invalid YAML syntax");
      
      if (e.mark && e.mark.line !== undefined) {
         // js-yaml mark lines are 0-indexed, display as 1-indexed
         setErrorLine(e.mark.line + 1);
      } else {
         setErrorLine(null);
      }
    }
  };

  const hasComments = inputData.includes("#");

  const handleFormat = () => {
    try {
      const parsed = yaml.loadAll(inputData);
      // If multiple docs, dump all. If one, dump it.
      const formatted = parsed.map(doc => yaml.dump(doc, {
        indent: 2,
        lineWidth: -1, // Don't arbitrarily wrap lines
        noRefs: true,
      })).join('\n---\n');
      
      setInputData(formatted);
      validateYaml(formatted);
    } catch (e) {
       // Ignore format if invalid
    }
  };

  const handleClear = () => {
    setInputData("");
    setIsValid(true);
    setErrorLine(null);
    setErrorMessage(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      validateYaml(content);
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
  };

  const handleDownload = () => {
    const blob = new Blob([inputData], { type: "application/x-yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "config.yaml";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <ListTree className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">YAML Validator</h1>
              <p className="text-xs text-zinc-500">Linter and formatter for Kubernetes, Docker Compose, and CI/CD configs.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-zinc-900 border border-zinc-800 p-1.5 rounded-lg">
          <div className="flex flex-col items-start">
            <button
              onClick={handleFormat}
              disabled={!isValid || !inputData.trim()}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span>Format</span>
              {hasComments && <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 ml-1" />}
            </button>
            {hasComments && (
              <span className="text-[10px] text-yellow-500/70 px-3 mt-0.5">removes comments</span>
            )}
          </div>
          
          <div className="w-px h-6 bg-zinc-800"></div>
          
           <button 
            onClick={handleClear}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium text-zinc-300 hover:text-rose-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span className="sr-only md:not-sr-only">Clear</span>
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6 flex-1 min-h-0">
        
        {/* Editor Area */}
        <div className="flex-1 border border-zinc-800 rounded-xl overflow-hidden bg-[#1e1e1e] flex flex-col relative group shadow-2xl shadow-black/50">
          {/* Editor Toolbar */}
          <div className="h-10 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between px-3 shrink-0">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-zinc-500 font-mono flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${inputData.trim() ? (isValid ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]') : 'bg-zinc-600'}`}></div>
                config.yaml
              </span>
            </div>

            <div className="flex items-center space-x-1">
               <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept=".yml,.yaml,.txt"
                  className="hidden" 
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded transition-colors"
                  title="Upload YAML File"
                  aria-label="Upload YAML file"
                >
                  <FileUp className="w-4 h-4" />
                </button>

                <div className="w-px h-4 bg-zinc-800 mx-1"></div>

                <button
                  onClick={handleDownload}
                  disabled={!inputData.trim()}
                  className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded transition-colors disabled:opacity-50"
                  title="Download YAML"
                  aria-label="Download YAML"
                >
                  <FileDown className="w-4 h-4" />
                </button>
                <CopyButton
                  text={inputData}
                  disabled={!inputData.trim()}
                  className="text-zinc-500 hover:text-white hover:bg-zinc-800"
                />
                <ShareButton getState={() => ({ input: inputData })} disabled={!inputData.trim()} />
            </div>
          </div>

          <Editor
            height="100%"
            defaultLanguage="yaml"
            theme="vs-dark"
            value={inputData}
            onChange={(value) => validateYaml(value || "")}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              lineNumbers: "on",
              glyphMargin: false,
              lineDecorationsWidth: 4,
              lineNumbersMinChars: 3,
              scrollbar: {
                verticalScrollbarSize: 8,
                horizontalScrollbarSize: 8,
              },
              padding: { top: 16, bottom: 16 },
              smoothScrolling: true,
              cursorBlinking: "smooth",
            }}
          />
        </div>

        {/* Status / Output Panel */}
        <div className="flex flex-col space-y-4 overflow-y-auto custom-scrollbar">
            
            {!inputData.trim() ? (
               <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/50 flex flex-col items-center justify-center text-center h-full min-h-[200px] text-zinc-500">
                  <ListTree className="w-8 h-8 mb-3 opacity-20" />
                  <p className="text-sm">Paste or type YAML to begin validation.</p>
               </div>
            ) : isValid ? (
                <div className="p-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-3">
                     <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="font-semibold text-emerald-400 mb-1">Valid YAML</h3>
                  <p className="text-xs text-emerald-500/80">The document is well-formed.</p>
               </div>
            ) : (
                <div className="p-5 rounded-xl border border-red-500/30 bg-red-500/10 flex flex-col animate-in fade-in slide-in-from-right-4">
                  <div className="flex items-start text-red-400 mb-4">
                     <AlertCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
                     <h3 className="font-semibold text-lg tracking-tight">Syntax Error</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {errorLine && (
                       <div className="bg-red-950/50 border border-red-900/50 rounded-lg p-3">
                          <span className="text-xs font-semibold text-red-500/80 uppercase tracking-wider mb-1 block">Location</span>
                          <span className="font-mono text-sm text-red-200">Line {errorLine}</span>
                       </div>
                    )}
                    
                    <div className="bg-red-950/50 border border-red-900/50 rounded-lg p-3">
                        <span className="text-xs font-semibold text-red-500/80 uppercase tracking-wider mb-1 block">Details</span>
                        <span className="font-mono text-xs text-red-300 break-words leading-relaxed">
                          {errorMessage?.replace(/at line \d+, column \d+:/, "")}
                        </span>
                    </div>
                  </div>
               </div>
            )}
            
            {/* Info Box */}
            <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/30">
                <h4 className="text-sm font-semibold text-zinc-300 mb-2">Tips</h4>
                <ul className="text-xs text-zinc-500 space-y-2 list-disc pl-4 marker:text-zinc-700">
                   <li>Multi-document files (separated by <code>---</code>) are supported.</li>
                   <li>Format button uses standard 2-space indentation.</li>
                   <li>Comments will be preserved during validation, but might be removed during formatting.</li>
                </ul>
            </div>
        </div>

      </div>
    </div>
  );
}
