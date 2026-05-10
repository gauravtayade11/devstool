import { toolMeta } from "@/lib/seo";

export const metadata = toolMeta({
  title: "Timestamp Converter",
  description: "Convert Unix timestamps to human-readable dates. Supports seconds and milliseconds, shows local time, UTC, ISO 8601, and relative time.",
  path: "/timestamp",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
