"use client";

import React, { useState, useEffect } from "react";
import { Copy, Check, Clock, CalendarDays, RefreshCw } from "lucide-react";
import { useDebounce } from "@/lib/hooks/use-debounce";

export default function TimestampConverter() {
  const [inputStr, setInputStr] = useState("");
  const [format, setFormat] = useState<"seconds" | "milliseconds">("seconds");
  const [currentEpoch, setCurrentEpoch] = useState<number>(0);
  const debouncedInput = useDebounce(inputStr, 200);

  const [result, setResult] = useState<{
    local: string;
    utc: string;
    iso: string;
    relative: string;
    isValid: boolean;
  } | null>(null);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Update current epoch every second
  useEffect(() => {
    const updateTime = () => setCurrentEpoch(Math.floor(Date.now() / 1000));
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Parse on debounced input or format change
  useEffect(() => {
    if (!debouncedInput.trim()) { setResult(null); return; }

    const num = Number(debouncedInput);
    if (isNaN(num)) {
      setResult({ local: "", utc: "", iso: "", relative: "", isValid: false });
      return;
    }

    const date = new Date(format === "seconds" ? num * 1000 : num);
    if (isNaN(date.getTime())) {
      setResult({ local: "", utc: "", iso: "", relative: "", isValid: false });
      return;
    }

    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
    const diffInSeconds = Math.floor((date.getTime() - Date.now()) / 1000);
    let relative = "";
    if (Math.abs(diffInSeconds) < 60) relative = rtf.format(diffInSeconds, "second");
    else if (Math.abs(diffInSeconds) < 3600) relative = rtf.format(Math.floor(diffInSeconds / 60), "minute");
    else if (Math.abs(diffInSeconds) < 86400) relative = rtf.format(Math.floor(diffInSeconds / 3600), "hour");
    else if (Math.abs(diffInSeconds) < 2592000) relative = rtf.format(Math.floor(diffInSeconds / 86400), "day");
    else relative = rtf.format(Math.floor(diffInSeconds / 2592000), "month");

    setResult({ local: date.toLocaleString(), utc: date.toUTCString(), iso: date.toISOString(), relative, isValid: true });
  }, [debouncedInput, format]);

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const insertCurrentTime = () => {
    setInputStr(format === "seconds" ? currentEpoch.toString() : Date.now().toString());
  };

  return (
    <div className="flex flex-col h-full py-4">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
            <Clock className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Timestamp Converter</h1>
            <p className="text-xs text-zinc-500">Convert Unix timestamps (epoch) to human-readable dates and formats.</p>
          </div>
        </div>
      </div>

      {/* Current Epoch Bar */}
      <div className="mb-8 p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 text-zinc-300">
          <Clock className="w-5 h-5 text-indigo-400" />
          <span className="font-medium">Current Unix Epoch:</span>
          <span className="font-mono text-lg text-white ml-2">{currentEpoch}</span>
        </div>
        <div className="flex space-x-2">
            <button 
                onClick={() => handleCopy(currentEpoch.toString(), 'current')}
                className="flex items-center space-x-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm transition-colors"
                title="Copy current epoch"
            >
                {copiedKey === 'current' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>Copy</span>
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Area */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-zinc-300">
            Enter Timestamp
          </label>
          <div className="relative">
            <input
              type="text"
              value={inputStr}
              onChange={(e) => setInputStr(e.target.value)}
              placeholder="e.g. 1715839200"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white font-mono placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
            />
            <button
              onClick={insertCurrentTime}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-indigo-400 hover:bg-zinc-900 rounded-md transition-colors"
              title="Use current time"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center space-x-4 bg-zinc-900/50 p-1.5 rounded-lg border border-zinc-800/50 w-max">
            <button
               onClick={() => setFormat("seconds")}
               className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${format === "seconds" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-300"}`}
            >
              Seconds (s)
            </button>
            <button
               onClick={() => setFormat("milliseconds")}
               className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${format === "milliseconds" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-300"}`}
            >
              Milliseconds (ms)
            </button>
          </div>
        </div>

        {/* Results Area */}
        <div className="space-y-4">
           {result && !result.isValid && inputStr.trim() !== "" && (
               <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm">
                 Invalid timestamp format. Please enter a valid number.
               </div>
           )}

           {result && result.isValid && (
             <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                
                {/* Result Row Template */}
                {[
                  { label: "Local Time", value: result.local, id: "local" },
                  { label: "Relative", value: result.relative, id: "relative" },
                  { label: "UTC Time", value: result.utc, id: "utc" },
                  { label: "ISO 8601", value: result.iso, id: "iso" },
                ].map((item) => (
                    <div key={item.id} className="group flex items-center justify-between p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 transition-colors">
                        <div className="overflow-hidden mr-4">
                            <div className="text-xs font-semibold text-zinc-500 mb-1 tracking-wider uppercase">{item.label}</div>
                            <div className="text-sm font-medium text-zinc-200 truncate">{item.value}</div>
                        </div>
                        <button 
                            onClick={() => handleCopy(item.value, item.id)}
                            className="p-2 bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 rounded-lg shrink-0 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                            title="Copy"
                        >
                           {copiedKey === item.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                ))}

             </div>
           )}

            {!result && inputStr.trim() === "" && (
               <div className="h-full min-h-[200px] flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-xl text-zinc-500">
                   <CalendarDays className="w-8 h-8 mb-3 opacity-50" />
                   <p className="text-sm">Enter a timestamp to see conversions</p>
               </div>
           )}
        </div>
      </div>
    </div>
  );
}
