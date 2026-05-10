import { toolMeta } from "@/lib/seo";

export const metadata = toolMeta({
  title: "PromQL Builder",
  description: "Build Prometheus queries visually. Select metrics, add label filters, apply aggregations and functions — copy the PromQL expression instantly.",
  path: "/promql-builder",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
