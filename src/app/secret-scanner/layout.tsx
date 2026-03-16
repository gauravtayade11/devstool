import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Secret Scanner",
  description: "Scan code, logs, .env files, and configs for accidentally exposed credentials. Detects AWS keys, GitHub tokens, Stripe keys, JWTs, and more — 100% client-side.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
