import type { NextConfig } from "next";

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
};

export default nextConfig;
