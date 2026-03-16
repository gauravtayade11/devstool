"use client";

import { useState, useEffect } from "react";
import cronstrue from "cronstrue";
import { CronExpressionParser } from "cron-parser";
import { Clock, RefreshCw, Info, FileCode2 } from "lucide-react";
import { CopyButton } from "@/components/ui/copy-button";

export default function CronBuilder() {
  const [expression, setExpression] = useState("");
  const [explanation, setExplanation] = useState("");
  const [error, setError] = useState<string | null>(null);
  // Parse expression
  useEffect(() => {
    try {
      if (!expression.trim()) {
        setExplanation("Please enter a cron expression.");
        setError(null);
        return;
      }
      
      const parsed = cronstrue.toString(expression, { throwExceptionOnParseError: true });
      setExplanation(parsed);
      setError(null);
    } catch (err: any) {
      setExplanation("");
      setError(err.message || "Invalid cron expression");
    }
  }, [expression]);

  const getNextDates = (): string[] => {
    try {
      const interval = CronExpressionParser.parse(expression);
      const dates: string[] = [];
      for (let i = 0; i < 5; i++) {
        dates.push(interval.next().toDate().toLocaleString());
      }
      return dates;
    } catch {
      return [];
    }
  };

  const nextDates = error ? [] : getNextDates();

  const commonPatterns = [
      { label: "Every Minute", value: "* * * * *" },
      { label: "Every Hour", value: "0 * * * *" },
      { label: "Every Day at Midnight", value: "0 0 * * *" },
      { label: "Every Sunday", value: "0 0 * * 0" },
      { label: "Every Weekday (Mon-Fri)", value: "0 0 * * 1-5" },
      { label: "First Day of Month", value: "0 0 1 * *" },
  ];

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto py-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center">
          <Clock className="w-6 h-6 mr-3 text-emerald-400" />
          Cron Expression Builder
        </h1>
        <p className="text-zinc-400 text-sm mt-1">Easily build, parse, and understand complex cron job schedules.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* Input & Explanation Area */}
        <div className="space-y-6">
            <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-950 shadow-inner">
                 <label className="block text-sm font-medium text-zinc-300 mb-3">Cron Expression</label>
                 <div className="relative">
                    <input
                        type="text"
                        value={expression}
                        onChange={(e) => setExpression(e.target.value)}
                        placeholder="* * * * *"
                        className={`w-full bg-zinc-900 border ${error ? 'border-red-500/50 focus:ring-red-500/50' : 'border-zinc-700 focus:border-emerald-500/50 focus:ring-emerald-500/50'} rounded-xl px-4 py-3 text-white font-mono text-lg tracking-widest placeholder:text-zinc-600 focus:outline-none focus:ring-1 transition-all`}
                        spellCheck={false}
                    />
                    <CopyButton
                        text={expression}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white hover:bg-zinc-800"
                    />
                 </div>
                 
                 <div className="mt-8 flex flex-col items-center justify-center p-6 rounded-xl border border-zinc-800 bg-zinc-900/50 min-h-[120px] text-center">
                    {error ? (
                        <div className="animate-in fade-in slide-in-from-bottom-2">
                            <span className="inline-block p-2 rounded-full bg-red-500/20 mb-2">
                                <Info className="w-5 h-5 text-red-400" />
                            </span>
                            <p className="text-red-400 font-medium">{error}</p>
                        </div>
                    ) : (
                        <div className="animate-in fade-in zoom-in-95">
                            <span className="inline-block p-2 rounded-full bg-emerald-500/10 mb-2 border border-emerald-500/20">
                                <RefreshCw className="w-5 h-5 text-emerald-500" />
                            </span>
                            <p className="text-xl font-medium text-emerald-400 max-w-sm mx-auto leading-relaxed">
                                {explanation}
                            </p>
                        </div>
                    )}
                 </div>
            </div>

            {/* Next Run Times */}
            {nextDates.length > 0 && (
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-emerald-400" />
                  Next 5 Run Times
                  <span className="ml-2 text-xs font-normal text-zinc-500">
                    ({Intl.DateTimeFormat().resolvedOptions().timeZone})
                  </span>
                </h3>
                <ol className="space-y-1.5">
                  {nextDates.map((date, i) => (
                    <li key={i} className="flex items-center space-x-3 text-sm font-mono">
                      <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-500 text-xs flex items-center justify-center shrink-0">{i + 1}</span>
                      <span className="text-zinc-300">{date}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Quick Presets */}
            <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/30">
                <h3 className="text-sm font-semibold text-white mb-4">Common Patterns</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {commonPatterns.map(pattern => (
                        <button
                            key={pattern.value}
                            onClick={() => setExpression(pattern.value)}
                            className="text-left p-3 rounded-lg border border-zinc-800/80 bg-zinc-900 hover:bg-zinc-800 hover:border-zinc-700 transition-all group"
                        >
                            <div className="text-xs font-semibold text-zinc-400 group-hover:text-zinc-300 mb-1.5">{pattern.label}</div>
                            <div className="font-mono text-zinc-500 text-xs tracking-wider">{pattern.value}</div>
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* Reference Guide */}
        <div className="space-y-6">
             <div className="p-6 rounded-xl border border-zinc-800 bg-[#121214] h-full shadow-lg">
                <div className="flex items-center space-x-2 text-sm font-semibold text-emerald-400 mb-6 pb-4 border-b border-zinc-800/80">
                   <FileCode2 className="w-4 h-4" />
                   <span>Format Reference</span>
                </div>

                <div className="space-y-6 font-mono text-sm">
                    {/* Structure Graphic */}
                    <div className="flex justify-between items-center text-center pb-2">
                       <div className="flex-1">
                          <div className="text-zinc-500 text-xs mb-1 tracking-widest uppercase">Min</div>
                          <div className="text-zinc-200 bg-zinc-900 py-2 rounded border border-zinc-800 font-bold">*</div>
                       </div>
                       <div className="w-2 opacity-30 text-zinc-500">-</div>
                       <div className="flex-1">
                          <div className="text-zinc-500 text-xs mb-1 tracking-widest uppercase">Hour</div>
                          <div className="text-zinc-200 bg-zinc-900 py-2 rounded border border-zinc-800 font-bold">*</div>
                       </div>
                       <div className="w-2 opacity-30 text-zinc-500">-</div>
                       <div className="flex-1">
                          <div className="text-zinc-500 text-xs mb-1 tracking-widest uppercase tooltip" title="Day of Month">Day</div>
                          <div className="text-zinc-200 bg-zinc-900 py-2 rounded border border-zinc-800 font-bold">*</div>
                       </div>
                       <div className="w-2 opacity-30 text-zinc-500">-</div>
                       <div className="flex-1">
                          <div className="text-zinc-500 text-xs mb-1 tracking-widest uppercase">Month</div>
                          <div className="text-zinc-200 bg-zinc-900 py-2 rounded border border-zinc-800 font-bold">*</div>
                       </div>
                       <div className="w-2 opacity-30 text-zinc-500">-</div>
                       <div className="flex-1">
                          <div className="text-zinc-500 text-xs mb-1 tracking-widest uppercase tooltip" title="Day of Week">Week</div>
                          <div className="text-zinc-200 bg-zinc-900 py-2 rounded border border-zinc-800 font-bold">*</div>
                       </div>
                    </div>

                    <div className="space-y-4 text-xs font-sans">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-widest">
                                    <th className="pb-3 font-semibold">Field</th>
                                    <th className="pb-3 font-semibold">Allowed Values</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50 text-zinc-400">
                                <tr>
                                    <td className="py-3 font-mono text-zinc-300">Minute</td>
                                    <td className="py-3 font-mono">0-59</td>
                                </tr>
                                <tr>
                                    <td className="py-3 font-mono text-zinc-300">Hour</td>
                                    <td className="py-3 font-mono">0-23</td>
                                </tr>
                                <tr>
                                    <td className="py-3 font-mono text-zinc-300">Day (Month)</td>
                                    <td className="py-3 font-mono">1-31</td>
                                </tr>
                                <tr>
                                    <td className="py-3 font-mono text-zinc-300">Month</td>
                                    <td className="py-3 font-mono">1-12 <span className="text-zinc-600 font-sans ml-1">(or JAN-DEC)</span></td>
                                </tr>
                                <tr>
                                    <td className="py-3 font-mono text-zinc-300">Day (Week)</td>
                                    <td className="py-3 font-mono">0-6  <span className="text-zinc-600 font-sans ml-1">(or SUN-SAT, 0=Sun)</span></td>
                                </tr>
                            </tbody>
                        </table>

                        <div className="pt-4 border-t border-zinc-800/80">
                             <h4 className="font-semibold text-zinc-300 mb-3 text-sm">Special Characters</h4>
                             <ul className="space-y-3 font-mono text-zinc-400">
                                 <li className="flex items-start">
                                     <span className="text-emerald-400 font-bold w-6 shrink-0">*</span>
                                     <span className="font-sans">Any value / Always</span>
                                 </li>
                                 <li className="flex items-start">
                                     <span className="text-emerald-400 font-bold w-6 shrink-0">,</span>
                                     <span className="font-sans">Value list separator <span className="text-zinc-500 ml-1 font-mono">(1,3,5)</span></span>
                                 </li>
                                 <li className="flex items-start">
                                     <span className="text-emerald-400 font-bold w-6 shrink-0">-</span>
                                     <span className="font-sans">Range of values <span className="text-zinc-500 ml-1 font-mono">(1-5)</span></span>
                                 </li>
                                 <li className="flex items-start">
                                     <span className="text-emerald-400 font-bold w-6 shrink-0">/</span>
                                     <span className="font-sans">Step values <span className="text-zinc-500 ml-1 font-mono">(*/5 = every 5)</span></span>
                                 </li>
                             </ul>
                        </div>
                    </div>
                </div>
             </div>
        </div>
      </div>
    </div>
  );
}
