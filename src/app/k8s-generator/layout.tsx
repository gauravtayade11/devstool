import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kubernetes Manifest Generator",
  description: "Generate Kubernetes Deployment, Service, ConfigMap, and Ingress YAML manifests from a visual form. No boilerplate needed.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
