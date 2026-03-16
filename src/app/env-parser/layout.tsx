import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ENV Parser",
  description: "Parse and validate .env files online. Export to JSON, hide sensitive values for screen sharing, and detect syntax errors — 100% client-side.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
