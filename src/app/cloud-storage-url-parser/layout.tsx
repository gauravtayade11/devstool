import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Cloud Storage URL Parser",
  description: "Parse AWS S3, Google Cloud Storage, and Azure Blob Storage URLs into their components — bucket, key, region, and more.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
