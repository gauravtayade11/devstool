import { toolMeta } from "@/lib/seo";

export const metadata = toolMeta({
  title: "GitHub Actions Generator",
  description: "Generate GitHub Actions workflow YAML visually. Configure triggers, jobs, steps, and environment variables — download ready to commit.",
  path: "/github-actions-generator",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
