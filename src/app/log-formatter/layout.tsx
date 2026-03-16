import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log Formatter",
  description: "Format and filter JSON and plain-text logs online. Filter by severity level, search log lines, expand JSON payloads, and download results.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
