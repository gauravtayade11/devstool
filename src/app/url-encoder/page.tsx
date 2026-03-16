"use client";

import { useState } from "react";
import { ArrowRightLeft, Copy, Trash2, Check, ExternalLink } from "lucide-react";

export default function UrlEncoder() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [isCopied, setIsCopied] = useState(false);

  const handleConversion = (text: string, currentMode: "encode" | "decode") => {
    setInput(text);
    if (!text.trim()) {
      setOutput("");
      return;
    }

    try {
      if (currentMode === "encode") {
        // encodeURIComponent handles a wider range of chars safely for query params
        setOutput(encodeURIComponent(text));
      } else {
        setOutput(decodeURIComponent(text));
      }
    } catch (err) {
      setOutput("Error: Invalid URL Component. Ensure the input string is correctly formatted.");
    }
  };

  const toggleMode = () => {
    const newMode = mode === "encode" ? "decode" : "encode";
    setMode(newMode);
    
    // Swap 
    if (output && !output.startsWith("Error:")) {
      handleConversion(output, newMode);
    } else {
      handleConversion(input, newMode);
    }
  };

  const handleCopy = async () => {
    if (!output || output.startsWith("Error:")) return;
    try {
      await navigator.clipboard.writeText(output);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
  };

  const getSafeUrl = (): string | null => {
    if (!output || output.startsWith("Error:") || mode === "encode") return null;
    try {
      const parsed = new URL(output);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") return parsed.href;
    } catch {
      try {
        const parsed = new URL("https://" + output);
        if (parsed.protocol === "https:") return parsed.href;
      } catch {}
    }
    return null;
  };

  const handleDemo = () => {
    const demoUrl = "https://api.example.com/search?q=hello world &sort=date desc!";
    handleConversion(demoUrl, "encode");
    setMode("encode");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">URL Encoder / Decoder</h1>
          <p className="text-zinc-400 text-sm mt-1">Safely encode or decode URL query parameters and paths.</p>
        </div>

        <div className="flex items-center space-x-3">
           <button 
             onClick={handleDemo}
             className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors hidden md:block px-2"
           >
             Load Demo URL
           </button>
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
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-rows-2 gap-4">
        {/* Input Area */}
        <div className="flex flex-col rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-inner">
          <div className="bg-zinc-900 h-10 border-b border-zinc-800 flex items-center justify-between px-4">
            <span className="text-sm font-medium text-zinc-300">
              {mode === "encode" ? "Raw URL / Text" : "Encoded URL String"}
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
            placeholder={mode === "encode" ? "e.g., https://example.com/search?q=hello world" : "e.g., https%3A%2F%2Fexample.com"}
            className="flex-1 w-full p-4 bg-transparent text-zinc-100 font-mono text-sm resize-none focus:outline-none focus:ring-0 custom-scrollbar placeholder:text-zinc-700"
            spellCheck={false}
          />
        </div>

        {/* Output Area */}
        <div className="flex flex-col rounded-xl overflow-hidden border border-zinc-800 bg-[#121214] shadow-inner relative">
          <div className="bg-zinc-900 h-10 border-b border-zinc-800 flex items-center justify-between px-4">
             <span className="text-sm font-medium text-indigo-400">
              {mode === "encode" ? "Encoded Output" : "Decoded Output"}
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
              
              <div className="w-px h-4 bg-zinc-800 mx-1"></div>
              
               <a
                href={getSafeUrl() ?? "#"}
                target="_blank"
                rel="noreferrer noopener"
                className={`p-1.5 rounded transition-colors ${!getSafeUrl() ? "text-zinc-600 cursor-not-allowed pointer-events-none" : "text-zinc-500 hover:text-indigo-400 hover:bg-zinc-800"}`}
                title="Open URL in new tab"
                onClick={(e) => {
                   if (!getSafeUrl()) e.preventDefault();
                }}
              >
                <ExternalLink className="w-4 h-4" />
              </a>

              <button 
                onClick={handleCopy}
                disabled={!output || output.startsWith("Error:")}
                className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Copy to Clipboard"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
           <textarea
              value={output}
              readOnly
              placeholder="Result will appear here..."
              className={`flex-1 w-full p-4 bg-transparent font-mono text-sm resize-none focus:outline-none focus:ring-0 custom-scrollbar ${output.startsWith("Error") ? "text-rose-400" : "text-indigo-300"} selection:bg-indigo-900/40`}
              spellCheck={false}
            />
        </div>
      </div>
    </div>
  );
}
