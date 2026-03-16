import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JWT Decoder",
  description: "Decode and inspect JSON Web Tokens client-side. View header, payload, expiry countdown, and issued-at time — nothing sent to any server.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
