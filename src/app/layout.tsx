import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppLayout } from "@/components/layout/app-layout";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const BASE_URL = "https://devstool.vercel.app";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#09090b",
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "DevsTool — Developer & DevOps Toolkit",
    template: "%s — DevsTool",
  },
  description:
    "31+ fast, privacy-first developer and DevOps utilities. JSON formatter, JWT decoder, K8s generator, Dockerfile linter, Diff Checker, and more — all client-side.",
  keywords: [
    "developer tools", "devops tools", "json formatter", "jwt decoder",
    "kubernetes generator", "dockerfile linter", "secret scanner",
    "yaml validator", "base64 encoder", "diff checker", "cidr calculator",
    "terraform tfvars", "helm chart generator", "github actions generator",
    "promql builder", "regex tester", "ssl decoder", "cron builder",
  ],
  icons: { icon: "/icon.svg" },
  openGraph: {
    siteName: "DevsTool",
    type: "website",
    url: BASE_URL,
    title: "DevsTool — Developer & DevOps Toolkit",
    description: "31+ fast, privacy-first developer and DevOps utilities — all client-side. No data leaves your browser.",
    images: [{ url: "/og", width: 1200, height: 630, alt: "DevsTool — Developer & DevOps Toolkit" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DevsTool — Developer & DevOps Toolkit",
    description: "31+ fast, privacy-first developer and DevOps utilities — all client-side. No data leaves your browser.",
    images: ["/og"],
  },
  alternates: { canonical: BASE_URL },
  verification: { google: "s-IeRmOdJyjY-pptUXzdk5jCYcsB09-F7jgW91fkRvo" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "DevsTool",
  url: BASE_URL,
  description: "31+ fast, privacy-first developer and DevOps utilities — all client-side.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${BASE_URL}/?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-zinc-950`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AppLayout>{children}</AppLayout>
        <Analytics />
      </body>
    </html>
  );
}
