import { toolMeta } from "@/lib/seo";

export const metadata = toolMeta({
  title: "YAML Validator",
  description: "Validate and format YAML online. Supports multi-document files, Kubernetes configs, Docker Compose, and CI/CD pipelines.",
  path: "/yaml-validator",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
