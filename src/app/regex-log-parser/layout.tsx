import { toolMeta } from "@/lib/seo";

export const metadata = toolMeta({
  title: "Regex Log Parser",
  description: "Test regular expressions against log lines and extract named capture groups. Live matching with field extraction — all client-side.",
  path: "/regex-log-parser",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
