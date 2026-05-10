import { toolMeta } from "@/lib/seo";

export const metadata = toolMeta({
  title: "JSON to YAML Converter",
  description: "Convert JSON to YAML and YAML to JSON instantly. Auto-detects input format, supports complex nested structures — all client-side.",
  path: "/json-yaml",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
