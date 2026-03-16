import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "URL Encoder / Decoder",
  description: "Encode and decode URL components and query strings online. Safely encode special characters for use in URLs — all client-side.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
