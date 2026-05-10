import type { Metadata } from "next";
import { TerminalSquare } from "lucide-react";
import { ToolsTabs } from "@/components/ui/tools-tabs";

export const metadata: Metadata = {
  title: "DevsTool — Developer & DevOps Toolkit",
  description: "30+ fast, privacy-first developer and DevOps utilities — all client-side. JSON formatter, K8s generator, GitHub Actions, Terraform, PromQL builder, and more.",
};

const TOTAL_TOOLS = 31;

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto py-8">
      {/* Hero */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center p-3 mb-6 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/30">
          <TerminalSquare className="w-10 h-10 text-indigo-400" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">DevsTool</h1>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          {TOTAL_TOOLS}+ fast, privacy-first utilities for developers and DevOps engineers — all client-side, no data leaves your browser.
        </p>
      </div>

      <ToolsTabs totalCount={TOTAL_TOOLS} />
    </div>
  );
}
