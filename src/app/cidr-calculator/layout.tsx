import { toolMeta } from "@/lib/seo";

export const metadata = toolMeta({
  title: "CIDR / Subnet Calculator",
  description: "Calculate subnet mask, network address, broadcast address, and host range from CIDR notation. Essential for VPC and network planning.",
  path: "/cidr-calculator",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
