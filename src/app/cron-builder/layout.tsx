import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cron Expression Builder",
  description: "Build, parse, and understand cron expressions. See plain-English explanations, next 5 run times in your timezone, and common pattern presets.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
