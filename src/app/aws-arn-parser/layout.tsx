import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "AWS ARN Parser",
  description: "Parse and validate AWS ARN strings into their components. Identify service, region, account ID, and resource — all client-side.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
