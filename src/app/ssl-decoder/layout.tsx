import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SSL Certificate Decoder",
  description: "Decode and inspect SSL/TLS certificates. View subject, issuer, SANs, expiry, key info, and SHA-256 fingerprint — all client-side.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
