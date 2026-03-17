import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Markdown Preview",
  description: "Write and preview Markdown with GitHub Flavored Markdown support. Live split-view, tables, task lists, code blocks — all client-side.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
