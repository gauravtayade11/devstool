import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Git Command Builder",
  description: "Build complex Git commands with a visual UI. Covers branching, remote, undo, and stashing — no more checking the man pages.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
