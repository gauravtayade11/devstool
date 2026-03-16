import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dockerfile Linter",
  description: "Lint Dockerfiles for best practices, security risks, and anti-patterns. Catches missing WORKDIR, root USER, latest tags, exposed secrets, and more.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
