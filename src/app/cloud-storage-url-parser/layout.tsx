import { toolMeta } from "@/lib/seo";

export const metadata = toolMeta({
  title: "Cloud Storage URL Parser",
  description: "Parse AWS S3, Google Cloud Storage, and Azure Blob Storage URLs into bucket, key, region, and more — all client-side.",
  path: "/cloud-storage-url-parser",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
