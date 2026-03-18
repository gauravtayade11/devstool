import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Helm Chart Generator",
  description:
    "Generate Helm chart files visually — Chart.yaml, values.yaml, and a deployment template. No boilerplate needed.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
