import type { MetadataRoute } from "next";
import { ROUTES } from "@/lib/routes";
import { SITE_URL } from "@/lib/site";

/** Generated from the route registry so a new page cannot be shipped
 * without being crawlable. llms.txt is listed alongside the HTML pages
 * because answer engines fetch it directly. */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    ...ROUTES.map((route) => ({
      url: route.path === "/" ? SITE_URL : `${SITE_URL}${route.path}`,
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    {
      url: `${SITE_URL}/llms.txt`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    },
  ];
}
