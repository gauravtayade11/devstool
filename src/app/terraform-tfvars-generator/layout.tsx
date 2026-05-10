import { toolMeta } from "@/lib/seo";

export const metadata = toolMeta({
  title: "Terraform tfvars Generator",
  description: "Generate Terraform variable files (.tfvars) from a form. Define variable names, types, values, and sensitivity — all client-side.",
  path: "/terraform-tfvars-generator",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
