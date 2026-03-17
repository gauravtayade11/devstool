# DevsTool

**17 fast, privacy-first developer & DevOps utilities — all client-side.**

> No sign-up. No data collection. No data ever leaves your browser.

🔗 **Live:** [devstool.vercel.app](https://devstool.vercel.app)

---

## Tools

### Developer Tools
| Tool | Description |
|------|-------------|
| [JSON Formatter](https://devstool.vercel.app/json-formatter) | Format, validate, and minify JSON with Monaco Editor |
| [Base64 Encoder](https://devstool.vercel.app/base64) | Encode/decode Base64 with full UTF-8 support |
| [URL Encoder](https://devstool.vercel.app/url-encoder) | Encode/decode URL parameters |
| [JWT Decoder](https://devstool.vercel.app/jwt) | Decode JWT tokens with live expiry countdown |
| [Timestamp Converter](https://devstool.vercel.app/timestamp) | Convert Unix timestamps to human-readable dates |
| [UUID Generator](https://devstool.vercel.app/uuid) | Generate bulk RFC-4122 UUIDs |
| [Diff Checker](https://devstool.vercel.app/diff-checker) | Compare two texts with line/word/char-level diff |
| [Markdown Preview](https://devstool.vercel.app/markdown-preview) | Live Markdown preview with GitHub Flavored Markdown |

### DevOps Tools
| Tool | Description |
|------|-------------|
| [YAML Validator](https://devstool.vercel.app/yaml-validator) | Lint and format Kubernetes & CI configs |
| [ENV Parser](https://devstool.vercel.app/env-parser) | Parse and validate `.env` files, export to JSON |
| [Log Formatter](https://devstool.vercel.app/log-formatter) | Format JSON logs with level filtering |
| [Dockerfile Linter](https://devstool.vercel.app/dockerfile-linter) | Lint Dockerfiles against 12 best-practice rules |
| [Git Command Builder](https://devstool.vercel.app/git-builder) | Build complex git commands with a visual UI |
| [Cron Builder](https://devstool.vercel.app/cron-builder) | Build and understand cron expressions |
| [Port Reference](https://devstool.vercel.app/port-reference) | Look up well-known TCP/UDP port numbers |
| [HTTP Headers](https://devstool.vercel.app/http-headers) | Inspect response headers and security posture |
| [Secret Scanner](https://devstool.vercel.app/secret-scanner) | Detect exposed credentials, API keys, and tokens |

---

## Features

- **⌘K Command Palette** — jump to any tool instantly
- **Shareable links** — encode tool state in URL, share with teammates
- **100% client-side** — no backend receives your data (except HTTP Headers proxy)
- **Secret Scanner** — 20+ patterns: AWS, GitHub, GCP, Azure, Stripe, Discord, GitLab, and more
- **Monaco Editor** — VS Code-grade editing for JSON, YAML, Dockerfile
- **Privacy badge** — every tool clearly shows whether data is local or proxied
- **SEO optimized** — per-page metadata, sitemap, Open Graph image

---

## Tech Stack

- [Next.js 16](https://nextjs.org) — App Router, static generation
- [TypeScript](https://www.typescriptlang.org) — strict mode
- [Tailwind CSS v4](https://tailwindcss.com)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) — via `@monaco-editor/react`
- [Vercel](https://vercel.com) — hosting + analytics

---

## Run Locally

```bash
git clone https://github.com/gauravtayade11/devstool.git
cd devstool
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy

Optimized for Vercel. No environment variables required.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/gauravtayade11/devstool)

---

## Why DevsTool?

Most online dev tools are free because your data is the product. When you paste a JWT, `.env` file, or API key into a random online tool, you don't know if it's being logged.

DevsTool runs everything in your browser. There's nothing to compromise.

---

## License

MIT
