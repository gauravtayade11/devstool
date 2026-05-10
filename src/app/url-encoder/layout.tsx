import { toolMeta } from "@/lib/seo";

export const metadata = toolMeta({
  title: "URL Encoder / Decoder",
  description: "Encode and decode URL components and query strings online. Safely encode special characters for use in URLs — all client-side.",
  path: "/url-encoder",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
