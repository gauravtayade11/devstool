import { toolMeta } from "@/lib/seo";

export const metadata = toolMeta({
  title: "JSON Formatter",
  description: "Format, validate, and minify JSON online. Syntax highlighting, error detection with line numbers, file upload and download — all client-side.",
  path: "/json-formatter",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
