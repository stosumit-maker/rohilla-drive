import type { MetadataRoute } from "next";

const site = "https://www.rohilladrive.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/dealer", "/partner", "/reset-password"],
    },
    sitemap: `${site}/sitemap.xml`,
    host: site,
  };
}
