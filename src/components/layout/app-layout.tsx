"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, Menu, Globe, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { CommandPalette } from "@/components/ui/command-palette";

interface LayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const pathname = usePathname();
  const isProxyPage = pathname === "/http-headers";

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-50 overflow-hidden font-sans">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Command Palette */}
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />

      {/* Sidebar Navigation */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="h-16 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 z-10 shrink-0">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={() => setPaletteOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors text-sm"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Search tools...</span>
              <kbd className="hidden md:inline-flex items-center gap-0.5 text-[10px] font-mono text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700">
                ⌘K
              </kbd>
            </button>
          </div>

          <div className="flex items-center space-x-3">
            {isProxyPage ? (
              <div
                className="flex items-center space-x-2 text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full"
                title="The URL you enter is fetched server-side via a secure proxy to bypass CORS."
              >
                <Globe className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline font-medium">URL fetched via server proxy</span>
                <span className="sm:hidden font-medium">Server Proxy</span>
              </div>
            ) : (
              <div
                className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full"
                title="All processing happens locally in your browser. No data is sent to any server."
              >
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline font-medium">Your data never leaves this browser</span>
                <span className="sm:hidden font-medium">100% Local</span>
              </div>
            )}
          </div>
        </header>

        {/* Dynamic Tool Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-zinc-950 custom-scrollbar relative">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
          <div className="relative z-10 w-full max-w-7xl mx-auto p-6 md:p-8 h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
