import { toolMeta } from "@/lib/seo";

export const metadata = toolMeta({
  title: "Helm Chart Generator",
  description: "Generate Helm chart files visually — Chart.yaml, values.yaml, and a deployment template. Download and commit instantly.",
  path: "/helm-chart-generator",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
