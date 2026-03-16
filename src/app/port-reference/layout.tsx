import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Port Reference",
  description: "Look up well-known TCP/UDP port numbers. Search by port number or service name, filter by protocol — instant reference for developers and ops engineers.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
