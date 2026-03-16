  "use client";

import { useState } from "react";
import { ArrowRightLeft, Trash2, AlertCircle } from "lucide-react";
import { CopyButton } from "@/components/ui/copy-button";

export default function Base64Converter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [error, setError] = useState<string | null>(null);
  const handleConversion = (text: string, currentMode: "encode" | "decode") => {
    setInput(text);
    setError(null);

    if (!text.trim()) {
      setOutput("");
      return;
    }

    try {
      if (currentMode === "encode") {
        // Use TextEncoder to properly handle UTF-8 characters (like emojis)
        const bytes = new TextEncoder().encode(text);
        const binString = String.fromCodePoint(...bytes);
        setOutput(btoa(binString));
      } else {
        const binString = atob(text);
        // Use TextDecoder to properly reconstruct UTF-8 characters
        const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0) ?? 0);
        setOutput(new TextDecoder().decode(bytes));
      }
    } catch (err) {
      setError(currentMode === "decode" ? "Invalid Base64 string." : "Error encoding text.");
      setOutput("");
    }
  };

  const toggleMode = () => {
    const newMode = mode === "encode" ? "decode" : "encode";
    setMode(newMode);
    
    // Swap input and output when toggling if there is valid output
    if (output && !error) {
       handleConversion(output, newMode);
    } else {
       handleConversion(input, newMode);
    }
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setError(null);
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto py-4">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Base64 Encoder / Decoder</h1>
          <p className="text-zinc-400 text-sm mt-1">Safely encode and decode UTF-8 strings to Base64 format.</p>
        </div>

        <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-lg w-full md:w-auto">
          <button
            onClick={() => { setMode("encode"); handleConversion(input, "encode"); }}
            className={`flex-1 md:flex-none px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              mode === "encode" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Encode
          </button>
          <button
            onClick={() => { setMode("decode"); handleConversion(input, "decode"); }}
            className={`flex-1 md:flex-none px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              mode === "decode" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Decode
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-[500px]">
        {/* Input Area */}
        <div className="flex flex-col rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-inner">
          <div className="bg-zinc-900 h-11 border-b border-zinc-800 flex items-center justify-between px-4">
            <span className="text-sm font-medium text-zinc-300">
              {mode === "encode" ? "Text Input" : "Base64 Input"}
            </span>
            <button 
              onClick={handleClear}
              className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 rounded transition-colors"
              title="Clear Input"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => handleConversion(e.target.value, mode)}
            placeholder={mode === "encode" ? "Enter text to encode..." : "Enter Base64 string to decode..."}
            className="flex-1 w-full p-4 bg-transparent text-zinc-100 font-mono text-sm resize-none focus:outline-none focus:ring-0 custom-scrollbar placeholder:text-zinc-700"
            spellCheck={false}
          />
        </div>

        {/* Output Area */}
        <div className="flex flex-col rounded-xl overflow-hidden border border-zinc-800 bg-[#121214] shadow-inner relative">
          <div className="bg-zinc-900 h-11 border-b border-zinc-800 flex items-center justify-between px-4">
             <span className="text-sm font-medium text-emerald-400">
              {mode === "encode" ? "Base64 Output" : "Text Output"}
            </span>
            <div className="flex items-center space-x-2">
              <button 
                onClick={toggleMode}
                className="flex items-center space-x-2 px-2 py-1 text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800 rounded transition-colors"
                title="Swap Input & Output"
              >
                <ArrowRightLeft className="w-3 h-3" />
                <span>Swap</span>
              </button>
              <CopyButton
                text={output}
                disabled={!output}
                className="text-zinc-500 hover:text-white hover:bg-zinc-800"
              />
            </div>
          </div>
          
          {error ? (
             <div className="flex-1 p-6 flex items-center justify-center flex-col text-red-400/80 bg-red-950/10">
               <AlertCircle className="w-8 h-8 mb-3 opacity-50" />
               <p className="font-medium">{error}</p>
             </div>
          ) : (
            <textarea
              value={output}
              readOnly
              placeholder="Result will appear here..."
              className="flex-1 w-full p-4 bg-transparent text-emerald-300 font-mono text-sm resize-none focus:outline-none focus:ring-0 custom-scrollbar placeholder:text-zinc-800 selection:bg-emerald-900/40"
              spellCheck={false}
            />
          )}
        </div>
      </div>
    </div>
  );
}
