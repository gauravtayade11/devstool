import { toolMeta } from "@/lib/seo";

export const metadata = toolMeta({
  title: "Git Command Builder",
  description: "Build complex Git commands with a visual UI. Covers branching, remote, undo, and stashing — no more checking the man pages.",
  path: "/git-builder",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
