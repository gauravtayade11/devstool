import { toolMeta } from "@/lib/seo";

export const metadata = toolMeta({
  title: "JWT Decoder",
  description: "Decode and inspect JSON Web Tokens client-side. View header, payload, expiry countdown, and issued-at time — nothing sent to any server.",
  path: "/jwt",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
