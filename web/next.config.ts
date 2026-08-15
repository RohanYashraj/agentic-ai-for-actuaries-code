import type { NextConfig } from "next";

// Report-Only first, then flip the header name to the enforcing
// Content-Security-Policy once the site's flows run clean. There is no
// report-uri collector, so verification is manual: exercise a Pyodide
// demo and an agent run on the deployed site with the console open
// (dev shows unsafe-eval reports from HMR — dev-only noise; if the
// PRODUCTION Pyodide demo reports unsafe-eval too, add 'unsafe-eval'
// to script-src before enforcing). jsDelivr is required by the Pyodide
// worker (importScripts + package fetches); wasm-unsafe-eval by the
// Pyodide wasm runtime. Note the honest scope: script-src keeps
// 'unsafe-inline' (Next's inline bootstrap; going nonce-based needs
// middleware), so even enforced this policy is an egress/framing
// control — foreign script, connect, base, and form targets — not an
// inline-XSS shield. The page renders no raw HTML anywhere, which is
// the actual XSS defense.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://cdn.jsdelivr.net",
  "worker-src 'self'",
  "connect-src 'self' https://cdn.jsdelivr.net",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy-Report-Only", value: csp },
];

const nextConfig: NextConfig = {
  async rewrites() {
    // In dev, the FastAPI backend runs separately on :8000. In production
    // the /api/py/* rewrite lives in vercel.json (Python function).
    if (process.env.NODE_ENV === "development") {
      return [
        {
          source: "/api/py/:path*",
          destination: "http://127.0.0.1:8000/api/py/:path*",
        },
      ];
    }
    return [];
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
