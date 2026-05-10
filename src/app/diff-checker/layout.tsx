import { toolMeta } from "@/lib/seo";

export const metadata = toolMeta({
  title: "Diff Checker",
  description: "Compare two texts side by side with live diff. Line numbers, scroll sync, jump to change, ignore whitespace — all client-side.",
  path: "/diff-checker",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
