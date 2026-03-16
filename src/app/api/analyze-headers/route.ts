import { NextRequest, NextResponse } from "next/server";

// Simple in-memory rate limiter: 20 requests per IP per minute
const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

// Block requests to private/internal IP ranges to prevent SSRF attacks
function isPrivateUrl(url: URL): boolean {
  const host = url.hostname;

  // Block localhost and loopback
  if (host === "localhost" || host === "127.0.0.1" || host === "::1") return true;

  // Block link-local
  if (host.startsWith("169.254.")) return true;

  // Block private IPv4 ranges
  const privateRanges = [/^10\./, /^172\.(1[6-9]|2\d|3[01])\./, /^192\.168\./];
  if (privateRanges.some((r) => r.test(host))) return true;

  // Block metadata endpoints (AWS, GCP, Azure)
  if (["169.254.169.254", "metadata.google.internal"].includes(host)) return true;

  return false;
}

export async function GET(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again in a minute." },
      { status: 429 }
    );
  }

  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  // Validate URL format and protocol
  let parsed: URL;
  try {
    parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return NextResponse.json({ error: "Only http and https URLs are supported" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  // Block SSRF — private/internal network targets
  if (isPrivateUrl(parsed)) {
    return NextResponse.json({ error: "Requests to private or internal addresses are not allowed" }, { status: 403 });
  }

  try {
    const response = await fetch(parsed.href, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
    });

    const headers: Record<string, string> = {};
    response.headers.forEach((value, name) => {
      headers[name] = value;
    });

    return NextResponse.json({ headers, status: response.status, url: parsed.href });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch URL";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
