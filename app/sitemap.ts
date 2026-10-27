import type { MetadataRoute } from "next";
import { supabase } from "./supabaseClient";
import {buyPath,marketLocations,sellPath} from "./lib/market-locations";

const site = "https://www.rohilladrive.com";
const refreshed = new Date();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: site, lastModified: refreshed, changeFrequency: "daily", priority: 1 },
    { url: `${site}/ambala`, lastModified: refreshed, changeFrequency: "weekly", priority: 1 },
    { url: `${site}/used-cars-ambala`, lastModified: refreshed, changeFrequency: "daily", priority: 1 },
    { url: `${site}/used-car-dealer-baldev-nagar-ambala`, lastModified: refreshed, changeFrequency: "weekly", priority: 0.99 },
    { url: `${site}/used-cars-under-5-lakh-ambala`, lastModified: refreshed, changeFrequency: "daily", priority: 0.99 },
    { url: `${site}/used-cars-under-3-lakh-ambala`, lastModified: refreshed, changeFrequency: "daily", priority: 0.98 },
    { url: `${site}/first-owner-used-cars-ambala`, lastModified: refreshed, changeFrequency: "daily", priority: 0.98 },
    { url: `${site}/find-car-ambala`, lastModified: refreshed, changeFrequency: "daily", priority: 0.99 },
    { url: `${site}/sell-car-ambala`, lastModified: refreshed, changeFrequency: "daily", priority: 0.99 },
    { url: `${site}/coverage`, lastModified: refreshed, changeFrequency: "weekly", priority: 0.98 },
    { url: `${site}/trusted-assist`, lastModified: refreshed, changeFrequency: "weekly", priority: 0.99 },
    { url: `${site}/nri-car-care-india`, lastModified: refreshed, changeFrequency: "weekly", priority: 0.96 },
    { url: `${site}/defence-personnel-vehicle-assistance`, lastModified: refreshed, changeFrequency: "weekly", priority: 0.96 },
    { url: `${site}/senior-citizen-car-assistance`, lastModified: refreshed, changeFrequency: "weekly", priority: 0.96 },
    { url: `${site}/remote-car-assistance`, lastModified: refreshed, changeFrequency: "weekly", priority: 0.96 },
    { url: `${site}/car-services/ambala`, lastModified: refreshed, changeFrequency: "weekly", priority: 0.95 },
    { url: `${site}/new-cars/ambala`, lastModified: refreshed, changeFrequency: "weekly", priority: 0.9 },
    { url: `${site}/about`, lastModified: refreshed, changeFrequency: "monthly", priority: 0.95 },
    { url: `${site}/inventory`, lastModified: refreshed, changeFrequency: "daily", priority: 0.98 },
    { url: `${site}/assistant`, lastModified: refreshed, changeFrequency: "weekly", priority: 0.95 },
    { url: `${site}/sell`, lastModified: refreshed, changeFrequency: "weekly", priority: 0.95 },
    { url: `${site}/business-hub`, lastModified: refreshed, changeFrequency: "weekly", priority: 0.9 },
    { url: `${site}/dealers`, lastModified: refreshed, changeFrequency: "daily", priority: 0.96 },
    { url: `${site}/dealers/rohilla-multibrand-cars`, lastModified: refreshed, changeFrequency: "daily", priority: 0.99 },
    { url: `${site}/service-partners`, lastModified: refreshed, changeFrequency: "daily", priority: 0.95 },
    { url: `${site}/join/oem`, lastModified: refreshed, changeFrequency: "monthly", priority: 0.8 },
    { url: `${site}/join/preowned`, lastModified: refreshed, changeFrequency: "monthly", priority: 0.8 },
    { url: `${site}/join/partner`, lastModified: refreshed, changeFrequency: "monthly", priority: 0.8 },
    { url: `${site}/verify`, lastModified: refreshed, changeFrequency: "weekly", priority: 0.85 },
    { url: `${site}/terms`, lastModified: refreshed, changeFrequency: "monthly", priority: 0.5 },
    { url: `${site}/privacy`, lastModified: refreshed, changeFrequency: "monthly", priority: 0.5 },
    { url: `${site}/disclaimer`, lastModified: refreshed, changeFrequency: "monthly", priority: 0.5 },
  ];

  try {
    const db = supabase();
    const { data, error } = await db.from("vehicles").select("id,created_at,brand,model,city").eq("status", "published").order("created_at", { ascending: false });
    if (error) throw error;
    const vehiclePages: MetadataRoute.Sitemap = (data || []).map((car: any) => ({
      url: `${site}/cars/${car.id}`,
      lastModified: car.created_at ? new Date(car.created_at) : refreshed,
      changeFrequency: "daily",
      priority: 0.9,
    }));
    const slugify=(v:string)=>v.toLowerCase().trim().replace(/&/g,"and").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
    const seen=new Set<string>();
    const modelPages: MetadataRoute.Sitemap = (data || []).filter((car:any)=>String(car.city||"").toLowerCase().includes("ambala")&&car.brand&&car.model).flatMap((car:any)=>{
      const slug=slugify(`${car.brand}-${car.model}`);
      if(seen.has(slug)) return [];
      seen.add(slug);
      return [{url:`${site}/used-cars-ambala/${slug}`,lastModified:car.created_at?new Date(car.created_at):refreshed,changeFrequency:"daily" as const,priority:0.94}];
    });
    // Keep regional pages discoverable without listing every thin city page.
    // Always expose the Haryana hub; add city pages when published inventory
    // actually matches that market. Ambala's legacy URLs above already have
    // dedicated canonical pages and must not appear here as redirecting URLs.
    const haryanaHub = marketLocations.filter((loc) => loc.slug === "haryana");
    const inventoryBackedMarkets = marketLocations.filter((loc) =>
      loc.region === "Haryana" &&
      !loc.hub &&
      !loc.legacyBuyPath &&
      (data || []).some((car: any) => {
        const city = String(car.city || "").toLowerCase();
        return loc.aliases.some((alias) => city.includes(alias.toLowerCase()));
      })
    );
    const regionalPages: MetadataRoute.Sitemap = [...haryanaHub, ...inventoryBackedMarkets].flatMap((loc) => [
      {
        url: `${site}${buyPath(loc)}`,
        lastModified: refreshed,
        changeFrequency: "daily" as const,
        priority: loc.hub ? 0.9 : 0.82,
      },
      {
        url: `${site}${sellPath(loc)}`,
        lastModified: refreshed,
        changeFrequency: "weekly" as const,
        priority: loc.hub ? 0.85 : 0.75,
      },
    ]);
    return [...staticPages, ...regionalPages, ...modelPages, ...vehiclePages];
  } catch {
    return staticPages;
  }
}
