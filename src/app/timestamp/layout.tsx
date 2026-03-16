import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Timestamp Converter",
  description: "Convert Unix timestamps to human-readable dates. Supports seconds and milliseconds, shows local time, UTC, ISO 8601, and relative time.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
