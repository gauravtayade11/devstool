import { toolMeta } from "@/lib/seo";

export const metadata = toolMeta({
  title: "Dockerfile Linter",
  description: "Lint Dockerfiles for best practices, security risks, and anti-patterns. Catches missing WORKDIR, root USER, latest tags, and more.",
  path: "/dockerfile-linter",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
