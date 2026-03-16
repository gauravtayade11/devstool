import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HTTP Header Analyzer",
  description: "Inspect HTTP response headers for any URL. Identify missing security headers, analyze CORS configuration, and assess your site's security posture.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
