import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppLayout } from "@/components/layout/app-layout";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "DevsTool — Developer & DevOps Toolkit",
    template: "%s — DevsTool",
  },
  description: "15 fast, privacy-first developer and DevOps utilities. JSON formatter, JWT decoder, Secret Scanner, Dockerfile linter, and more — all client-side.",
  keywords: ["developer tools", "devops tools", "json formatter", "jwt decoder", "secret scanner", "dockerfile linter", "yaml validator"],
  openGraph: {
    siteName: "DevsTool",
    type: "website",
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
      </body>
    </html>
  );
}
