import { toolMeta } from "@/lib/seo";

export const metadata = toolMeta({
  title: "Base64 Encoder / Decoder",
  description: "Encode and decode Base64 strings and files instantly in your browser. Supports URL-safe Base64 — 100% client-side.",
  path: "/base64",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
