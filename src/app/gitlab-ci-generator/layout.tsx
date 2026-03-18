import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GitLab CI Generator",
  description:
    "Generate GitLab CI/CD pipeline YAML visually. Configure stages, jobs, scripts, artifacts, and rules — download ready to commit.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
