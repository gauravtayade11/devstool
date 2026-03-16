"use client";

import { useState } from "react";
import { ShieldCheck, Menu, Globe } from "lucide-react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isProxyPage = pathname === "/http-headers";

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
            <div className="text-zinc-400 text-sm font-medium hidden md:block">
              Select a tool from the sidebar to begin
            </div>
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
          <div className="relative z-10 w-full max-w-7xl mx-auto p-6 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
