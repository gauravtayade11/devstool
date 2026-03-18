import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hash Generator",
  description: "Generate MD5, SHA-1, SHA-256, SHA-384, and SHA-512 hashes instantly in your browser. No data sent to any server.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
