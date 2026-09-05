import type { MetadataRoute } from "next";
import { supabase } from "./supabaseClient";

const site = "https://www.rohilladrive.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: site, changeFrequency: "daily", priority: 1 },
    { url: `${site}/verify`, changeFrequency: "weekly", priority: 0.85 },
  ];

  try {
    const db = supabase();
    const { data } = await db
      .from("vehicles")
      .select("id,updated_at")
      .eq("status", "published")
      .order("updated_at", { ascending: false });

    const vehiclePages: MetadataRoute.Sitemap = (data || []).map((car: any) => ({
      url: `${site}/cars/${car.id}`,
      lastModified: car.updated_at ? new Date(car.updated_at) : new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    }));

    return [...staticPages, ...vehiclePages];
  } catch {
    return staticPages;
  }
}
