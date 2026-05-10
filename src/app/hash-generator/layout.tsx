import { toolMeta } from "@/lib/seo";

export const metadata = toolMeta({
  title: "Hash Generator",
  description: "Generate MD5, SHA-1, SHA-256, SHA-384, and SHA-512 hashes instantly in your browser. Supports text and file hashing — no data sent to any server.",
  path: "/hash-generator",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
