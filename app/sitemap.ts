import type { MetadataRoute } from "next";
import { supabase } from "./supabaseClient";

const site = "https://www.rohilladrive.com";
const locales=["en","hi","pa","kn","ta","te","ml","mr","gu","bn","or","ur"];
const refreshed = new Date("2026-09-06T13:35:00Z");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: site, lastModified: refreshed, changeFrequency: "daily", priority: 1 },
    { url: `${site}/about`, lastModified: refreshed, changeFrequency: "monthly", priority: 0.95 },
    ...locales.map(locale=>({url:`${site}/${locale}`,lastModified:refreshed,changeFrequency:"weekly" as const,priority:0.9})),
    { url: `${site}/inventory`, lastModified: refreshed, changeFrequency: "daily", priority: 0.98 },
    { url: `${site}/assistant`, lastModified: refreshed, changeFrequency: "weekly", priority: 0.95 },
    { url: `${site}/language-assist`, lastModified: refreshed, changeFrequency: "weekly", priority: 0.95 },
    { url: `${site}/new-vehicles`, lastModified: refreshed, changeFrequency: "weekly", priority: 0.95 },
    { url: `${site}/sell`, lastModified: refreshed, changeFrequency: "weekly", priority: 0.95 },
    { url: `${site}/business-hub`, lastModified: refreshed, changeFrequency: "weekly", priority: 0.9 },
    { url: `${site}/join/oem`, lastModified: refreshed, changeFrequency: "monthly", priority: 0.8 },
    { url: `${site}/join/preowned`, lastModified: refreshed, changeFrequency: "monthly", priority: 0.8 },
    { url: `${site}/join/partner`, lastModified: refreshed, changeFrequency: "monthly", priority: 0.8 },
    { url: `${site}/verify`, lastModified: refreshed, changeFrequency: "weekly", priority: 0.85 },
  ];

  try {
    const db = supabase();
    const { data } = await db.from("vehicles").select("id,updated_at").eq("status", "published").order("updated_at", { ascending: false });
    const vehiclePages: MetadataRoute.Sitemap = (data || []).map((car: any) => ({
      url: `${site}/cars/${car.id}`,
      lastModified: car.updated_at ? new Date(car.updated_at) : refreshed,
      changeFrequency: "daily",
      priority: 0.9,
    }));
    return [...staticPages, ...vehiclePages];
  } catch {
    return staticPages;
  }
}
