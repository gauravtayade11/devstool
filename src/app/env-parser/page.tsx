"use client";

import React, { useState, useRef } from "react";
import { AlertCircle, FileUp, KeyRound, ShieldCheck, Settings2, Trash2, Download, Eye, EyeOff, Lock } from "lucide-react";
import { CopyButton } from "@/components/ui/copy-button";

interface EnvVariable {
  key: string;
  value: string;
  comment?: string;
  isError: boolean;
  errorMessage?: string;
  lineIndex: number;
}

export default function EnvParser() {
  const [inputData, setInputData] = useState<string>("PORT=8080\nNODE_ENV=production\n# Database Config\nDB_HOST=localhost\nDB_USER=admin\nDB_PASS=<your-password>\n\nINVALID LINE WITHOUT EQUALS\nAPI_KEY=<your-api-key>");
  const [parsedVars, setParsedVars] = useState<EnvVariable[]>([]);
  const [errorCount, setErrorCount] = useState<number>(0);
  const [valuesVisible, setValuesVisible] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse ENV file on input change
  React.useEffect(() => {
    parseEnvContent(inputData);
  }, [inputData]);

  const parseEnvContent = (text: string) => {
    if (!text.trim()) {
      setParsedVars([]);
      setErrorCount(0);
      return;
    }

    const lines = text.split('\n');
    const result: EnvVariable[] = [];
    let currentErrorCount = 0;

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Skip empty lines or pure comments, but we could capture comments if we wanted to
      if (!trimmedLine || trimmedLine.startsWith('#')) return;

      // Basic structure: KEY=VALUE
      const match = trimmedLine.match(/^([^=]+)=(.*)$/);
      
      if (!match) {
        currentErrorCount++;
        result.push({
          key: "Unknown",
          value: trimmedLine,
          isError: true,
          errorMessage: "Invalid format. Expected KEY=VALUE.",
          lineIndex: index + 1
        });
        return;
      }

      let key = match[1].trim();
      let value = match[2].trim();
      let comment = undefined;

      // Check for inline comments in the value (simplified)
      const commentIndex = value.indexOf(' #');
      if (commentIndex !== -1) {
        comment = value.substring(commentIndex + 1).trim();
        value = value.substring(0, commentIndex).trim();
      }

      // Check for quote wrapping and properly unwrap
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
         value = value.substring(1, value.length - 1);
      }

      // Validate Key
      const keyError = /^[A-Za-z_][A-Za-z0-9_]*$/.test(key) ? null : "Invalid key format. Use uppercase letters, numbers, and underscores.";
      
      if (keyError) {
         currentErrorCount++;
      }

      result.push({
        key,
        value,
        comment,
        isError: !!keyError,
        errorMessage: keyError || undefined,
        lineIndex: index + 1
      });
    });

    setParsedVars(result);
    setErrorCount(currentErrorCount);
  };

  const handleClear = () => {
    setInputData("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setInputData(content);
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
  };

  const handleDownloadJson = () => {
    const jsonResult = parsedVars
        .filter(v => !v.isError)
        .reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);

    const blob = new Blob([JSON.stringify(jsonResult, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "env-config.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getJsonOutput = () => {
    return JSON.stringify(
      parsedVars.filter(v => !v.isError).reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {} as Record<string, string>),
      null, 2
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-6xl mx-auto">
      <div className="mb-4 flex items-start space-x-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
        <Lock className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
        <p>
          <span className="font-semibold">All parsing happens in your browser.</span> No data is sent to any server. Avoid pasting real credentials — use the hide toggle <EyeOff className="w-3 h-3 inline mx-0.5" /> when sharing your screen.
        </p>
      </div>

      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center">
            <Settings2 className="w-6 h-6 mr-3 text-cyan-400" />
            ENV File Parser
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Parse, validate, and convert .env files to JSON securely in your browser.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 flex-1 min-h-0">
        
        {/* Editor Area */}
        <div className="flex flex-col rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-inner">
          <div className="bg-zinc-900 h-12 border-b border-zinc-800 flex items-center justify-between px-4 shrink-0">
             <span className="text-sm font-medium text-zinc-300">.env Content</span>
             <div className="flex items-center space-x-1">
                 <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept=".env,.txt"
                  className="hidden" 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded transition-colors"
                  title="Upload .env File"
                >
                  <FileUp className="w-4 h-4" />
                </button>
                 <div className="w-px h-4 bg-zinc-800 mx-1"></div>
                 <button 
                  onClick={handleClear}
                  className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-red-500/10 rounded transition-colors"
                  title="Clear Input"
                 >
                  <Trash2 className="w-4 h-4" />
                </button>
             </div>
          </div>
          <textarea
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
            placeholder="Paste your .env file contents here..."
            className="flex-1 w-full p-4 bg-transparent text-zinc-300 font-mono text-sm leading-relaxed tracking-wide resize-none focus:outline-none focus:ring-0 custom-scrollbar"
            spellCheck={false}
          />
        </div>

        {/* Parsed Output Panel */}
        <div className="flex flex-col rounded-xl overflow-hidden border border-zinc-800 bg-[#121214] shadow-inner relative">
          <div className="bg-zinc-900 h-12 border-b border-zinc-800 flex items-center justify-between px-4 shrink-0">
             <div className="flex items-center">
                 <span className="text-sm font-medium text-cyan-400 flex items-center">
                    <KeyRound className="w-4 h-4 mr-2" />
                    Parsed Variables
                </span>
                {parsedVars.length > 0 && (
                    <span className="ml-3 px-2 py-0.5 rounded-full bg-zinc-800 text-xs font-medium text-zinc-400">
                        {parsedVars.filter(v => !v.isError).length} Valid
                    </span>
                )}
             </div>
             
             <div className="flex items-center space-x-1">
                <button
                  onClick={() => setValuesVisible(v => !v)}
                  className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded transition-colors flex items-center text-xs"
                  title={valuesVisible ? "Hide values (screen sharing)" : "Show values"}
                >
                  {valuesVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <div className="w-px h-4 bg-zinc-800 mx-1"></div>
                <button
                  onClick={handleDownloadJson}
                  disabled={parsedVars.length === 0}
                  className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded transition-colors disabled:opacity-50 flex items-center text-xs"
                  title="Download as JSON"
                >
                  <Download className="w-4 h-4 mr-1.5" />
                  JSON
                </button>
                <div className="w-px h-4 bg-zinc-800 mx-1"></div>
                <CopyButton
                  text={getJsonOutput()}
                  disabled={parsedVars.length === 0}
                  className="text-zinc-500 hover:text-white hover:bg-zinc-800"
                />
             </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar bg-zinc-900/10">
              
              {/* Status Header */}
              {parsedVars.length > 0 && (
                 <div className={`p-4 border-b ${errorCount > 0 ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20'} flex items-center shrink-0`}>
                     {errorCount > 0 ? (
                        <>
                           <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                           <div>
                               <p className="text-sm font-medium text-red-400">Found {errorCount} issues in your ENV file</p>
                               <p className="text-xs text-red-500/70 mt-0.5">Please fix them before generating JSON exports.</p>
                           </div>
                        </>
                     ) : (
                         <>
                           <ShieldCheck className="w-5 h-5 text-emerald-500 mr-3" />
                           <div>
                               <p className="text-sm font-medium text-emerald-400">ENV file is valid</p>
                               <p className="text-xs text-emerald-500/70 mt-0.5">Ready to be consumed.</p>
                           </div>
                        </>
                     )}
                 </div>
              )}

              <div className="p-4 space-y-3">
                 {!inputData.trim() ? (
                     <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-zinc-500">
                        <KeyRound className="w-8 h-8 mb-3 opacity-20" />
                        <p className="text-sm">Parsed variables will appear here</p>
                     </div>
                 ) : (
                     parsedVars.map((item, idx) => (
                         <div 
                            key={idx} 
                            className={`p-3 rounded-lg border ${item.isError ? 'bg-red-950/20 border-red-900/50' : 'bg-zinc-900/50 border-zinc-800'} relative`}
                        >
                            <div className="flex items-start justify-between">
                                <span className={`font-mono text-sm font-semibold ${item.isError ? 'text-red-400' : 'text-cyan-400'}`}>
                                    {item.key}
                                </span>
                                <span className="text-xs text-zinc-600 font-mono">Line {item.lineIndex}</span>
                            </div>
                            
                            {!item.isError && (
                                <div className="mt-2 pl-3 border-l-2 border-zinc-800 font-mono text-sm text-zinc-300 break-all">
                                    {valuesVisible
                                        ? (item.value || <span className="text-zinc-600 italic">empty</span>)
                                        : <span className="text-zinc-600 tracking-widest select-none">{"•".repeat(Math.min(item.value.length || 8, 20))}</span>
                                    }
                                </div>
                            )}

                            {item.comment && (
                                <div className="mt-2 flex items-start text-xs text-zinc-500">
                                    <span className="mr-1 text-zinc-600">#</span>
                                    {item.comment}
                                </div>
                            )}

                            {item.isError && (
                                <div className="mt-2 text-xs font-medium text-red-400 flex items-start">
                                    <AlertCircle className="w-3.5 h-3.5 mr-1.5 shrink-0 mt-0.5" />
                                    {item.errorMessage}
                                </div>
                            )}
                         </div>
                     ))
                 )}
              </div>
          </div>
        </div>

      </div>
    </div>
  );
}
