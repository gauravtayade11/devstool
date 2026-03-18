import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PromQL Builder",
  description:
    "Build Prometheus queries visually. Select metrics, add label filters, apply aggregations and functions — copy the PromQL expression instantly.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
