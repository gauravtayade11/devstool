import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "YAML Validator",
  description: "Validate and format YAML online. Supports multi-document files, Kubernetes configs, Docker Compose, and CI/CD pipelines — with Monaco editor.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
