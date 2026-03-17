import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppLayout } from "@/components/layout/app-layout";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL("https://devstool.vercel.app"),
  title: {
    default: "DevsTool — Developer & DevOps Toolkit",
    template: "%s — DevsTool",
  },
  description: "15 fast, privacy-first developer and DevOps utilities. JSON formatter, JWT decoder, Secret Scanner, Dockerfile linter, and more — all client-side.",
  keywords: ["developer tools", "devops tools", "json formatter", "jwt decoder", "secret scanner", "dockerfile linter", "yaml validator"],
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.png",
  },
  openGraph: {
    siteName: "DevsTool",
    type: "website",
    url: "https://devstool.vercel.app",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "DevsTool" }],
  },
  alternates: {
    canonical: "https://devstool.vercel.app",
  },
  verification: {
    google: "s-IeRmOdJyjY-pptUXzdk5jCYcsB09-F7jgW91fkRvo",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-zinc-950`}>
        <AppLayout>{children}</AppLayout>
        <Analytics />
      </body>
    </html>
  );
}
