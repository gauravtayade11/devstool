import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GitHub Actions Generator",
  description:
    "Generate GitHub Actions workflow YAML visually. Configure triggers, jobs, steps, and environment variables — download ready to commit.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
