import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terraform tfvars Generator",
  description:
    "Generate Terraform variable files (.tfvars) from a form. Define variable names, types, values, and sensitivity — all client-side.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
