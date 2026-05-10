import { toolMeta } from "@/lib/seo";

export const metadata = toolMeta({
  title: "Port Reference",
  description: "Look up well-known TCP/UDP port numbers. Search by port or service name, filter by protocol — instant reference for developers and ops.",
  path: "/port-reference",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
