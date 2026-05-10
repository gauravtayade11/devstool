import { toolMeta } from "@/lib/seo";

export const metadata = toolMeta({
  title: "HTML Viewer",
  description: "Live HTML preview with device-width simulation. Paste any HTML snippet and see it render instantly — scripts, styles, and forms all work.",
  path: "/html-viewer",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
