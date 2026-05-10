import { toolMeta } from "@/lib/seo";

export const metadata = toolMeta({
  title: "Cron Expression Builder",
  description: "Build, parse, and understand cron expressions. Plain-English explanations, next 5 run times in your timezone, and common presets.",
  path: "/cron-builder",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
