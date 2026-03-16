import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Base64 Encoder / Decoder",
  description: "Encode and decode Base64 strings instantly in your browser. Supports URL-safe Base64 and file encoding — 100% client-side.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
