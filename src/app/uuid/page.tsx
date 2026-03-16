"use client";

import React, { useState, useEffect } from "react";
import { Copy, RefreshCw, Hash, List, Trash2, Download, Check } from "lucide-react";

export default function UuidGenerator() {
  const [uuids, setUuids] = useState<string[]>([]);
  const [count, setCount] = useState<number>(1);
  const [uppercase, setUppercase] = useState(false);
  const [noHyphens, setNoHyphens] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Fallback UUID v4 generator since crypto.randomUUID might not be available in all contexts, 
  // though it is in modern browsers.
  const generateV4 = () => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const generateBulk = () => {
    const newGuids = Array.from({ length: Math.min(Math.max(1, count), 1000) }, () => {
      let id = generateV4();
      if (uppercase) id = id.toUpperCase();
      if (noHyphens) id = id.replace(/-/g, "");
      return id;
    });
    setUuids(newGuids);
  };


  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(uuids.join("\n"));
      // Hack to show global copy state
      setCopiedIndex(-1);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Failed to copy all", err);
    }
  };

  const downloadAll = () => {
    const blob = new Blob([uuids.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `uuids-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto py-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">UUID Generator</h1>
        <p className="text-zinc-400 text-sm mt-1">Generate random version 4 Universally Unique Identifiers (UUIDs).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/50">
            <h2 className="text-sm font-semibold text-zinc-100 mb-4 flex items-center">
              <Settings className="w-4 h-4 mr-2 text-indigo-400" />
              Configuration
            </h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Quantity (1 - 1000)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="1000"
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                />
              </div>

              <div className="space-y-3 pt-2 border-t border-zinc-800">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      className="sr-only"
                      checked={uppercase}
                      onChange={(e) => setUppercase(e.target.checked)}
                    />
                    <div className={`w-5 h-5 rounded border ${uppercase ? 'bg-indigo-500 border-indigo-500' : 'bg-zinc-950 border-zinc-700 group-hover:border-zinc-500'} transition-colors flex items-center justify-center`}>
                      {uppercase && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                  </div>
                  <span className="text-sm text-zinc-300 select-none text-zinc-300">Uppercase</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      className="sr-only"
                      checked={noHyphens}
                      onChange={(e) => setNoHyphens(e.target.checked)}
                    />
                    <div className={`w-5 h-5 rounded border ${noHyphens ? 'bg-indigo-500 border-indigo-500' : 'bg-zinc-950 border-zinc-700 group-hover:border-zinc-500'} transition-colors flex items-center justify-center`}>
                      {noHyphens && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                  </div>
                  <span className="text-sm text-zinc-300 select-none text-zinc-300">Remove Hyphens</span>
                </label>
              </div>

              <button 
                onClick={generateBulk}
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] flex items-center justify-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Generate UUIDs
              </button>
            </div>
          </div>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-2 flex flex-col rounded-xl overflow-hidden border border-zinc-800 bg-[#121214] shadow-inner h-[600px]">
           <div className="bg-zinc-900 h-12 border-b border-zinc-800 flex items-center justify-between px-4 shrink-0">
             <span className="text-sm font-medium text-emerald-400 flex items-center">
               <List className="w-4 h-4 mr-2" />
               Generated Results ({uuids.length})
             </span>
             <div className="flex space-x-2">
                 <button 
                  onClick={downloadAll}
                  disabled={uuids.length === 0}
                  className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded transition-colors disabled:opacity-50"
                  title="Download as TXT"
                >
                  <Download className="w-4 h-4" />
                </button>
                 <button 
                  onClick={copyAll}
                  disabled={uuids.length === 0}
                  className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded transition-colors disabled:opacity-50 flex items-center"
                  title="Copy All"
                >
                  {copiedIndex === -1 ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            <div className="space-y-2">
              {uuids.map((id, index) => (
                <div 
                  key={`${id}-${index}`} 
                  className="group flex items-center justify-between p-3 rounded-lg border border-transparent hover:border-zinc-800 hover:bg-zinc-900/50 transition-colors"
                >
                  <div className="flex items-center space-x-4 overflow-hidden">
                    <span className="text-xs text-zinc-600 font-mono w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      {(index + 1).toString().padStart(2, '0')}
                    </span>
                    <span className="font-mono text-sm text-zinc-300 tracking-wider truncate">
                      {id}
                    </span>
                  </div>
                  
                  <button 
                      onClick={() => handleCopy(id, index)}
                      className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-md shrink-0 transition-opacity opacity-0 group-hover:opacity-100"
                      title="Copy"
                  >
                      {copiedIndex === index ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Quick helper icon for the config header
function Settings(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
