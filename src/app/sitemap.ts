import type { MetadataRoute } from "next";

const BASE_URL = "https://devstool.vercel.app";

const tools = [
  "json-formatter",
  "base64",
  "url-encoder",
  "jwt",
  "timestamp",
  "uuid",
  "diff-checker",
  "markdown-preview",
  "yaml-validator",
  "env-parser",
  "log-formatter",
  "dockerfile-linter",
  "git-builder",
  "cron-builder",
  "port-reference",
  "http-headers",
  "secret-scanner",
  "cidr-calculator",
  "k8s-generator",
  "hash-generator",
  "json-yaml",
  "ssl-decoder",
  "github-actions-generator",
  "gitlab-ci-generator",
  "terraform-tfvars-generator",
  "helm-chart-generator",
  "aws-arn-parser",
  "cloud-storage-url-parser",
  "promql-builder",
  "regex-log-parser",
  "html-viewer",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...tools.map((tool) => ({
      url: `${BASE_URL}/${tool}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
