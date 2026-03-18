import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON ↔ YAML Converter",
  description: "Convert JSON to YAML and YAML to JSON instantly in your browser. Auto-detects format, supports complex nested structures.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
