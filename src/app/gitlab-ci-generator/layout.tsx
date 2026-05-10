import { toolMeta } from "@/lib/seo";

export const metadata = toolMeta({
  title: "GitLab CI Generator",
  description: "Generate GitLab CI/CD pipeline YAML visually. Configure stages, jobs, scripts, artifacts, and rules — download ready to commit.",
  path: "/gitlab-ci-generator",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
