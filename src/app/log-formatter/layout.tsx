import { toolMeta } from "@/lib/seo";

export const metadata = toolMeta({
  title: "Log Formatter",
  description: "Format and filter JSON and plain-text logs online. Filter by severity, search log lines, expand JSON payloads, and download results.",
  path: "/log-formatter",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
