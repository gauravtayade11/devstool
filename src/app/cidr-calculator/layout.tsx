import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CIDR / Subnet Calculator",
  description: "Calculate subnet mask, network address, broadcast address, and host range from any CIDR notation. Essential for VPC planning and network configuration.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
