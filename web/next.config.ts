import type { NextConfig } from "next";

// Report-Only first: watch the console/report noise across a deploy
// (Pyodide worker, CodeMirror, Next inline bootstrap), then flip to an
// enforcing Content-Security-Policy header. jsDelivr is required by the
// Pyodide worker (importScripts + package fetches); wasm-unsafe-eval by
// the Pyodide wasm runtime.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://cdn.jsdelivr.net",
  "worker-src 'self'",
  "connect-src 'self' https://cdn.jsdelivr.net",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
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
