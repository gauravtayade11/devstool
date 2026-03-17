import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Diff Checker",
  description: "Compare two texts side by side. Highlight line, word, or character-level differences — all client-side, nothing sent to a server.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
