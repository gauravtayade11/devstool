import { toolMeta } from "@/lib/seo";

export const metadata = toolMeta({
  title: "SSL Certificate Decoder",
  description: "Decode and inspect SSL/TLS certificates. View subject, issuer, SANs, expiry, key info, and SHA-256 fingerprint — all client-side.",
  path: "/ssl-decoder",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
