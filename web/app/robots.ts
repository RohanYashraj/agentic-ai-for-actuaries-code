import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Everything on the site is public documentation for the book, so all
// crawlers — search engines and AI answer engines alike — are welcome.
// Being findable by generative engines is the point (see /llms.txt).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
