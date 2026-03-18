"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { loader } from "@monaco-editor/react";
loader.config({ paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/vs" } });

const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="flex-1 w-full bg-[#1e1e1e] animate-pulse" />,
});
import { Braces, FileDown, FileUp, Sparkles, Trash2, WrapText } from "lucide-react";
import { CopyButton } from "@/components/ui/copy-button";
import { ShareButton } from "@/components/ui/share-button";
import { ErrorAlert } from "@/components/ui/error-alert";
import { getSharedState } from "@/lib/share";

export default function JsonFormatter() {
  const [inputData, setInputData] = useState("");
  const [errorLine, setErrorLine] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const s = getSharedState<{ input: string }>();
    if (s?.input) setInputData(s.input);
  }, []);

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(inputData);
      const formatted = JSON.stringify(parsed, null, 2);
      setInputData(formatted);
      setErrorLine(null);
      setErrorMessage(null);
    } catch (error: any) {
      handleJsonError(error);
    }
  };

  const handleMinify = () => {
    try {
      const parsed = JSON.parse(inputData);
      const minified = JSON.stringify(parsed);
      setInputData(minified);
      setErrorLine(null);
      setErrorMessage(null);
    } catch (error: any) {
      handleJsonError(error);
    }
  };

  const handleJsonError = (error: Error) => {
      // Chrome/V8: "at position N"
      const posMatch = error.message.match(/at position (\d+)/);
      if (posMatch) {
        const position = parseInt(posMatch[1], 10);
        const line = inputData.substring(0, position).split('\n').length;
        setErrorLine(line);
      } else {
        // Firefox: "at line N column M"
        const lineMatch = error.message.match(/at line (\d+)/);
        if (lineMatch) setErrorLine(parseInt(lineMatch[1], 10));
      }
      setErrorMessage(error.message);
  };

  const handleClear = () => {
    setInputData("");
    setErrorLine(null);
    setErrorMessage(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setInputData(content);
      // Auto-validate on load
      try {
        JSON.parse(content);
        setErrorLine(null);
        setErrorMessage(null);
      } catch (error: any) {
        handleJsonError(error);
      }
      
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
  };

  const handleDownload = () => {
    const blob = new Blob([inputData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted-data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Braces className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">JSON Formatter</h1>
              <p className="text-xs text-zinc-500">Format, validate, and minify JSON data</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-zinc-900 border border-zinc-800 p-1.5 rounded-lg">
          <button 
            onClick={handleFormat}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Format</span>
          </button>
          
          <div className="w-px h-6 bg-zinc-800"></div>
          
          <button 
            onClick={handleMinify}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <WrapText className="w-4 h-4 text-emerald-400" />
            <span>Minify</span>
          </button>

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

      {errorMessage && (
        <ErrorAlert
          message="Invalid JSON Error"
          detail={`${errorMessage}${errorLine ? `\nApproximate location: Line ${errorLine}` : ""}`}
          className="mb-4"
        />
      )}

      <div className="flex-1 border border-zinc-800 rounded-xl overflow-hidden bg-[#1e1e1e] flex flex-col relative group shadow-2xl shadow-black/50">
        {/* Editor Toolbar */}
        <div className="h-10 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between px-3">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
            </div>
            <span className="text-xs text-zinc-500 ml-4 font-mono">editor.json</span>
          </div>

          <div className="flex items-center space-x-1">
             <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept=".json,.txt"
                className="hidden" 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded md:transition-colors tooltip-trigger"
                title="Upload JSON File"
              >
                <FileUp className="w-4 h-4" />
              </button>

              <div className="w-px h-4 bg-zinc-800 mx-1"></div>

              <button 
                onClick={handleDownload}
                className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded md:transition-colors tooltip-trigger"
                title="Download JSON"
              >
                <FileDown className="w-4 h-4" />
              </button>
              <CopyButton
                text={inputData}
                className="text-zinc-500 hover:text-white hover:bg-zinc-800"
              />
              <ShareButton getState={() => ({ input: inputData })} disabled={!inputData} />
          </div>
        </div>

        <Editor
          height="100%"
          defaultLanguage="json"
          theme="vs-dark"
          value={inputData}
          onChange={(value) => {
            setInputData(value || "");
            // Clear error state while typing to avoid flashing error msgs
            setErrorLine(null);
            setErrorMessage(null);
          }}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            formatOnPaste: true,
            lineNumbers: "on",
            glyphMargin: false,
            lineDecorationsWidth: 4,
            lineNumbersMinChars: 3,
            scrollbar: {
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
            },
            padding: { top: 16, bottom: 16 },
            renderLineHighlight: "line",
            smoothScrolling: true,
            cursorBlinking: "smooth",
          }}
        />
      </div>
    </div>
  );
}
