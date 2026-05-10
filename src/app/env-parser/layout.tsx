import { toolMeta } from "@/lib/seo";

export const metadata = toolMeta({
  title: "ENV Parser",
  description: "Parse and validate .env files online. Export to JSON, hide sensitive values for screen sharing, detect syntax errors — 100% client-side.",
  path: "/env-parser",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
