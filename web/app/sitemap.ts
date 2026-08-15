import type { MetadataRoute } from "next";
import { CHAPTERS } from "@/lib/chapters";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/code`, changeFrequency: "weekly", priority: 0.8 },
    ...CHAPTERS.map((c) => ({
      url: `${SITE_URL}/code/${c.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
