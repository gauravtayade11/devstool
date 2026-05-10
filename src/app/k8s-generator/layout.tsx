import { toolMeta } from "@/lib/seo";

export const metadata = toolMeta({
  title: "Kubernetes Manifest Generator",
  description: "Generate Kubernetes Deployment, Service, ConfigMap, and Ingress YAML manifests from a visual form. No boilerplate needed.",
  path: "/k8s-generator",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
