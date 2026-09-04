import type { MetadataRoute } from "next";

const site = "https://rohilladrivedeployfinal.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site, changeFrequency: "daily", priority: 1 },
    { url: `${site}/verify`, changeFrequency: "weekly", priority: 0.8 },
  ];
}
