import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Regex Log Parser",
  description:
    "Test regular expressions against log lines and extract named capture groups. Live matching with field extraction — all client-side.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
