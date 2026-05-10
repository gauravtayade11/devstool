import { toolMeta } from "@/lib/seo";

export const metadata = toolMeta({
  title: "Secret Scanner",
  description: "Scan code, configs, and .env files for exposed credentials. Detects AWS keys, GitHub tokens, Stripe keys, JWTs, and more — 100% client-side.",
  path: "/secret-scanner",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
