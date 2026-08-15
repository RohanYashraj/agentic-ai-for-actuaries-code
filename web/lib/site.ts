/** Canonical site origin, shared by metadata, sitemap, robots, JSON-LD
 * and llms.txt. Resolution: explicit override → Vercel production
 * domain → local dev. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const SITE_NAME = "Agentic AI for Actuaries";

export const SITE_DESCRIPTION =
  "Companion site for the book Agentic AI for Actuaries: run the actuarial tools in your browser, watch the agents work, and open every chapter in Colab.";

export const AUTHORS: { name: string; honorificPrefix?: string }[] = [
  { name: "Satya Sai Mudigonda" },
  { name: "Rohan Yashraj Gupta", honorificPrefix: "Dr" },
];
