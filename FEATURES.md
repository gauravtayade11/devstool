# DevsTool — Feature Tracker

> 15 tools currently working. This document tracks planned improvements and new features.

---

## Current Tools — Status

| # | Tool | Route | Status |
|---|------|-------|--------|
| 1 | JSON Formatter | `/json-formatter` | ✅ Working |
| 2 | Base64 Encoder/Decoder | `/base64` | ✅ Working |
| 3 | URL Encoder/Decoder | `/url-encoder` | ✅ Working |
| 4 | JWT Decoder | `/jwt` | ✅ Working |
| 5 | Timestamp Converter | `/timestamp` | ✅ Working |
| 6 | UUID Generator | `/uuid` | ✅ Working |
| 7 | YAML Validator | `/yaml-validator` | ✅ Working |
| 8 | ENV Parser | `/env-parser` | ✅ Working |
| 9 | Log Formatter | `/log-formatter` | ✅ Working |
| 10 | Dockerfile Linter | `/dockerfile-linter` | ✅ Working |
| 11 | Git Command Builder | `/git-builder` | ✅ Working |
| 12 | Cron Builder | `/cron-builder` | ✅ Working |
| 13 | Port Reference | `/port-reference` | ✅ Working |
| 14 | HTTP Header Analyzer | `/http-headers` | ✅ Working (server-side proxy) |
| 15 | Secret Scanner | `/secret-scanner` | ✅ Working |

---

## Improvements — By Tool

### 🔧 JSON Formatter
| # | Feature | Use Case | Priority | Status |
|---|---------|----------|----------|--------|
| J1 | Show before/after size on Minify | Developer wants to know how much space was saved after minifying an API payload | Medium | 🔲 Todo |
| J2 | Persist indent size preference (2 vs 4 spaces) | Developer always uses 4-space indent and doesn't want to reconfigure each session | Low | 🔲 Todo |
| J3 | Undo last action (Format / Minify / Clear) | Developer accidentally clicks Minify on a large formatted file and wants to restore it | Medium | 🔲 Todo |
| J4 | Add page-level SEO metadata | Tool shows generic site title in browser tab instead of "JSON Formatter — DevToolkit" | Low | 🔲 Todo |

---

### 🔐 Base64 Encoder/Decoder
| # | Feature | Use Case | Priority | Status |
|---|---------|----------|----------|--------|
| B1 | Show input/output size comparison | Developer encoding a large image to Base64 wants to see the size overhead | Low | 🔲 Todo |
| B2 | File encode/decode support | Developer wants to encode a small binary file (image, cert) to Base64 without writing a script | High | 🔲 Todo |
| B3 | URL-safe Base64 mode toggle | Backend developer working with JWT or OAuth tokens needs Base64url format (uses `-_` instead of `+/`) | Medium | 🔲 Todo |

---

### 🔗 URL Encoder/Decoder
| # | Feature | Use Case | Priority | Status |
|---|---------|----------|----------|--------|
| U1 | Full URL parser breakdown | Developer debugging a complex URL wants to see each query param split into key/value rows | High | 🔲 Todo |
| U2 | Encode only query params, leave domain intact | Developer wants to encode only the query string part of a full URL without encoding slashes | Medium | 🔲 Todo |
| U3 | Add page-level SEO metadata | Low | 🔲 Todo |

---

### 🔑 JWT Decoder
| # | Feature | Use Case | Priority | Status |
|---|---------|----------|----------|--------|
| W1 | Token expiry countdown | Developer debugging auth issues wants to quickly see if a token is expired or how long it has left | High | 🔲 Todo |
| W2 | Signature verification with public key input | Security engineer wants to verify a JWT signature without setting up a local environment | High | 🔲 Todo |
| W3 | Diff two JWT tokens | Developer wants to compare tokens before and after a login to spot payload changes | Medium | 🔲 Todo |
| W4 | Prominent security warning banner | New developer pasting a production token needs a clear warning that client-side tools are not safe for sensitive tokens | Medium | 🔲 Todo |

---

### 🕐 Timestamp Converter
| # | Feature | Use Case | Priority | Status |
|---|---------|----------|----------|--------|
| T1 | Convert between timezones | Developer debugging a distributed system wants to convert a UTC timestamp to their local timezone and a customer's timezone simultaneously | High | 🔲 Todo |
| T2 | Date picker input | Non-technical user wants to convert a specific date to a Unix timestamp without knowing the epoch format | Medium | 🔲 Todo |
| T3 | Persist seconds/milliseconds preference | Developer always works with millisecond timestamps and doesn't want to switch the toggle each time | Low | 🔲 Todo |

---

### 🔢 UUID Generator
| # | Feature | Use Case | Priority | Status |
|---|---------|----------|----------|--------|
| I1 | UUID v1 / v3 / v5 support (currently v4 only) | Developer needs a name-based deterministic UUID (v5) for consistent IDs across systems | High | 🔲 Todo |
| I2 | Persist uppercase / no-hyphens preference | Developer always generates lowercase UUIDs with hyphens and wants that as default | Low | 🔲 Todo |
| I3 | Validate a UUID (check format + version) | Developer receives a UUID from an external API and wants to verify it is well-formed | Medium | 🔲 Todo |
| I4 | Replace custom Settings icon with Lucide icon | Consistency — custom SVG icon is used instead of the Lucide `Settings` import | Low | 🔲 Todo |

---

### 📋 YAML Validator
| # | Feature | Use Case | Priority | Status |
|---|---------|----------|----------|--------|
| Y1 | Convert YAML ↔ JSON | DevOps engineer receives a Kubernetes config in YAML and needs to convert it to JSON for an API call | High | 🔲 Todo |
| Y2 | Disable Format button on invalid input | User clicks Format on broken YAML and gets a confusing result — button should be disabled until valid | Medium | 🔲 Todo |
| Y3 | Schema validation (paste a JSON Schema) | Platform engineer wants to validate a Helm values.yaml against a defined schema | High | 🔲 Todo |

---

### ⚙️ ENV Parser
| # | Feature | Use Case | Priority | Status |
|---|---------|----------|----------|--------|
| E1 | Blur/reveal toggle for sensitive values | Developer sharing their screen wants to show the ENV structure without exposing secrets | High | 🔲 Todo |
| E2 | Export as Docker `--env-file` format | Developer setting up a Docker run command wants to convert a `.env` file to `--env KEY=VALUE` flags | Medium | 🔲 Todo |
| E3 | Diff two ENV files | Developer wants to compare staging vs production ENV files to find missing or mismatched keys | High | 🔲 Todo |
| E4 | Remove real secrets from sample data | Sample currently includes a plaintext password — replace with placeholder values | Medium | 🔲 Todo |

---

### 📜 Log Formatter
| # | Feature | Use Case | Priority | Status |
|---|---------|----------|----------|--------|
| L1 | Debounce search/filter input | User typing in the search box causes heavy re-parsing on every keystroke, making the UI sluggish on large log files | High | 🔲 Todo |
| L2 | Download filtered logs | DevOps engineer filtered logs down to errors only and wants to save them as a file for a bug report | Medium | 🔲 Todo |
| L3 | Highlight search term in log lines | Developer searching for a request ID wants the matching text highlighted in the log line, not just the row | Medium | 🔲 Todo |
| L4 | Support more log formats (nginx, Apache, syslog) | SRE needs to paste nginx access logs and get them parsed + colored automatically | High | 🔲 Todo |

---

### 🐳 Dockerfile Linter
| # | Feature | Use Case | Priority | Status |
|---|---------|----------|----------|--------|
| D1 | Highlight error line in editor | Developer gets "line 12" in the lint error but has to manually count — editor should jump to and highlight that line | High | 🔲 Todo |
| D2 | Best-practice suggestions (not just errors) | Developer wants to know if their Dockerfile follows production best practices (non-root user, COPY vs ADD, etc.) | High | 🔲 Todo |
| D3 | Multi-stage build template | Developer building a Go or Node app wants a pre-filled multi-stage Dockerfile template to start from | Medium | 🔲 Todo |

---

### 🌿 Git Command Builder
| # | Feature | Use Case | Priority | Status |
|---|---------|----------|----------|--------|
| G1 | Command history within session | Developer builds a complex git command, navigates away, comes back and wants to restore it | Low | 🔲 Todo |
| G2 | Explain what each flag does inline | Junior developer using the tool wants to understand what `--rebase` does without opening docs | High | 🔲 Todo |
| G3 | Add more commands (cherry-pick, stash, bisect) | Developer wants to build a `git stash pop --index` command using the UI | Medium | 🔲 Todo |

---

### ⏱ Cron Builder
| # | Feature | Use Case | Priority | Status |
|---|---------|----------|----------|--------|
| C1 | Next N run times preview | DevOps engineer setting up a cron job wants to verify it will run at the right times before deploying | High | 🔲 Todo |
| C2 | Validate custom cron string input | Developer pastes an existing cron expression and wants to understand what it means and when it next runs | High | 🔲 Todo |
| C3 | Timezone selector for run times | Developer in UTC+5:30 wants to see next runs in their local timezone | Medium | 🔲 Todo |

---

### 🌐 Port Reference
| # | Feature | Use Case | Priority | Status |
|---|---------|----------|----------|--------|
| P1 | Copy port number on row click | Developer wants to quickly copy port 5432 without a separate copy button | Medium | 🔲 Todo |
| P2 | Show result count during search | Developer searches "postgres" and wants to see "3 results" to know if they need to refine the query | Low | 🔲 Todo |
| P3 | Check if a port is open (local scan) | Developer wants to quickly check if port 8080 is already in use on their machine | High | 🔲 Todo |
| P4 | Custom port notes | Developer wants to annotate port 8080 as "my local API" for their own reference | Low | 🔲 Todo |

---

### 🔍 HTTP Header Analyzer
| # | Feature | Use Case | Priority | Status |
|---|---------|----------|----------|--------|
| H1 | Next.js API proxy route to bypass CORS | Developer analyzing headers for any URL gets blocked by CORS — a server-side proxy would make the tool actually work | Critical | 🔲 Todo |
| H2 | Security score / grade (A–F) | Security engineer wants a quick letter grade summary of a site's header security posture | High | 🔲 Todo |
| H3 | Missing security headers checklist | Developer wants to see which recommended headers (CSP, HSTS, etc.) are absent, not just which ones are present | High | 🔲 Todo |
| H4 | HTTPS-only warning for HTTP URLs | Developer entering an `http://` URL should be warned that the request will be unencrypted | Medium | 🔲 Todo |

---

## Cross-Cutting Improvements

| # | Feature | Use Case | Priority | Status |
|---|---------|----------|----------|--------|
| X1 | `useCopyToClipboard` shared hook | Eliminate duplicate copy logic in all 13 tool pages | High | 🔲 Todo |
| X2 | Keyboard shortcuts (Cmd+Enter to run, Cmd+K to clear) | Power user wants to operate tools without reaching for the mouse | Medium | 🔲 Todo |
| X3 | Per-page browser tab titles and meta descriptions | Developer bookmarks "JWT Decoder" but tab shows "DevToolkit" with no context | Low | 🔲 Todo |
| X4 | Homepage shows all 14 tools (currently shows 6) | New user lands on homepage and doesn't discover half the available tools | High | 🔲 Todo |
| X5 | Fix TypeScript `any` types across codebase | Prevents catching type errors at compile time; blocks strict mode adoption | Medium | 🔲 Todo |
| X6 | Debounce heavy compute inputs | Log formatter, port reference filter cause jank on fast typing | High | 🔲 Todo |
| X7 | Persist user preferences via localStorage | UUID uppercase toggle, JSON indent size, timestamp format reset on every page reload | Low | 🔲 Todo |

---

---

### 🔐 Secret Scanner
| # | Feature | Use Case | Priority | Status |
|---|---------|----------|----------|--------|
| SC1 | Detect AWS, GitHub, Stripe, Slack, SendGrid, npm, Twilio, JWT, PEM keys, ENV passwords | Developer pastes a .env or config file before sharing and wants to know if any secrets are exposed | Critical | ✅ Done |
| SC2 | Expandable findings with "What is this?" + "How to fix" | Junior developer doesn't know what an AWS Access Key ID is or how to revoke it | High | ✅ Done |
| SC3 | 100% client-side scanning — nothing sent to server | Security-conscious user needs assurance that sensitive content isn't transmitted | Critical | ✅ Done |
| SC4 | Support scanning file upload (drag & drop) | Developer wants to scan a local .env file without copy-pasting | High | 🔲 Todo |
| SC5 | Export findings as PDF/markdown report | Security engineer wants to document findings for a team audit | Medium | 🔲 Todo |
| SC6 | Custom pattern rules (user-defined regex) | Enterprise team has internal secret formats they want to scan for | Low | 🔲 Todo |
| SC7 | Entropy-based detection for unknown high-entropy strings | Catch secrets that don't match known patterns (random 32+ char strings) | High | 🔲 Todo |

---

## Differentiation Roadmap — What Makes Us Unique

| # | Feature | Why it matters | Priority | Status |
|---|---------|----------------|----------|--------|
| R1 | **Secret Scanner** | No other dev toolkit has a built-in credential leak checker | Critical | ✅ Done |
| R2 | **Multi-format Converter** (JSON ↔ YAML ↔ TOML ↔ CSV ↔ ENV) | DevOps engineers bounce between formats daily — no single tool handles all | High | 🔲 Todo |
| R3 | **ENV Diff** — compare two .env files side by side | Staging vs prod drift detection, missing key highlighting | High | 🔲 Todo |
| R4 | **Workflow Mode** — tools grouped by scenario (incident, auth debug, PR review) | Nobody packages tools by when you need them, only by what they are | High | 🔲 Todo |
| R5 | **Tool Chaining** — pipe output of one tool into another | Eliminate copy-pasting between tabs; Base64 → JWT → JSON in one flow | Medium | 🔲 Todo |
| R6 | **Offline PWA** — installable, works without internet | Devs on planes, VPNs, restricted networks | Medium | 🔲 Todo |

---

## New Tools — Backlog

| # | Tool | Use Case | Priority | Status |
|---|------|----------|----------|--------|
| N1 | Multi-format Converter (JSON/YAML/TOML/CSV/ENV) | DevOps engineer receives a K8s config in YAML and needs it as JSON for an API call | High | 🔲 Todo |
| N2 | ENV Diff | Developer compares staging vs production .env to find missing or changed keys | High | 🔲 Todo |
| N3 | Regex Tester | Developer builds and tests a regex pattern against sample input with match highlighting | High | 🔲 Todo |
| N4 | Diff Viewer (text/JSON) | Developer compares two JSON responses from staging vs production | High | 🔲 Todo |
| N5 | Hash Generator (MD5, SHA-1, SHA-256) | Security engineer generates a SHA-256 checksum to verify a file download | Medium | 🔲 Todo |
| N6 | Docker Compose Validator | DevOps engineer validates a docker-compose.yml for port conflicts and dependency issues | High | 🔲 Todo |
| N7 | HTTP Request Builder (Postman lite) | Developer tests a REST endpoint directly in the browser without installing a tool | High | 🔲 Todo |
| N8 | JWT Generator (sign a token) | Backend developer wants to generate a test JWT with custom claims for local development | Medium | 🔲 Todo |
| N9 | Markdown Previewer | Developer writing a README wants a live preview rendered side-by-side | Low | 🔲 Todo |
