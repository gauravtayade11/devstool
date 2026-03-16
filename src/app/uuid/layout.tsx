import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UUID Generator",
  description: "Generate RFC-4122 v4 UUIDs in bulk. Copy individually or all at once, toggle uppercase, remove hyphens — fully client-side.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
