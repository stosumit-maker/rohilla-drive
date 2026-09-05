import type { Metadata } from "next";
import { supabase } from "../../supabaseClient";

const site = "https://www.rohilladrive.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const db = supabase();
    const { data: car } = await db
      .from("vehicles")
      .select("id,brand,model,variant,year,km,fuel,asking_price,city,public_notes,vehicle_photos(url,sort_order)")
      .eq("id", id)
      .eq("status", "published")
      .single();

    if (!car) return { title: "Vehicle" };

    const title = `${car.year || ""} ${car.brand} ${car.model} ${car.variant || ""}`.replace(/\s+/g, " ").trim();
    const price = car.asking_price ? `₹${Number(car.asking_price).toLocaleString("en-IN")}` : "Price on request";
    const description = `${title} for sale${car.city ? ` in ${car.city}` : ""}. ${Number(car.km || 0).toLocaleString("en-IN")} km • ${car.fuel || ""} • ${price}. Enquire with ROHILLA DRIVE.`;
    const photos = [...((car as any).vehicle_photos || [])].sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
    const image = photos[0]?.url;
    const canonical = `${site}/cars/${id}`;

    return {
      title,
      description,
      alternates: { canonical },
      openGraph: {
        type: "website",
        url: canonical,
        title,
        description,
        images: image ? [{ url: image, alt: title }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: image ? [image] : undefined,
      },
    };
  } catch {
    return { title: "Vehicle" };
  }
}

export default function VehicleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
