import { toolMeta } from "@/lib/seo";

export const metadata = toolMeta({
  title: "Markdown Preview",
  description: "Write and preview Markdown with GitHub Flavored Markdown support. Live split-view, tables, task lists, code blocks — all client-side.",
  path: "/markdown-preview",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
