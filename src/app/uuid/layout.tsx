import { toolMeta } from "@/lib/seo";

export const metadata = toolMeta({
  title: "UUID Generator",
  description: "Generate RFC-4122 v4 UUIDs in bulk. Copy individually or all at once, toggle uppercase, remove hyphens — fully client-side.",
  path: "/uuid",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
