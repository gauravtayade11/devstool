import { toolMeta } from "@/lib/seo";

export const metadata = toolMeta({
  title: "AWS ARN Parser",
  description: "Parse and validate AWS ARN strings into their components. Identify service, region, account ID, and resource type — all client-side.",
  path: "/aws-arn-parser",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
