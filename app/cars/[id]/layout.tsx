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
      .select("id,brand,model,variant,year,km,fuel,transmission,owner_count,asking_price,city,registration_prefix,public_notes,vehicle_photos(url,sort_order)")
      .eq("id", id)
      .eq("status", "published")
      .single();

    if (!car) return { title: "Vehicle" };

    const title = `${car.year || ""} ${car.brand} ${car.model} ${car.variant || ""}`.replace(/\s+/g, " ").trim();
    const price = car.asking_price ? `₹${Number(car.asking_price).toLocaleString("en-IN")}` : "Price on request";
    const details=[car.fuel,(car as any).transmission,(car as any).owner_count?`${(car as any).owner_count} Owner`:null,car.km!=null?`${Number(car.km).toLocaleString("en-IN")} km`:null,car.city].filter(Boolean).join(" • ");
    const description = `${title} for sale${car.city ? ` in ${car.city}` : ""}. ${price}${details?` • ${details}`:""}. View photos, vehicle details and enquire with ROHILLA DRIVE.`;
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

export default async function VehicleLayout({ children, params }: { children: React.ReactNode; params: Promise<{id:string}> }) {
  const {id}=await params;
  try{
    const db=supabase();
    const {data:car}=await db.from("vehicles").select("id,brand,model,variant,year,km,fuel,transmission,asking_price,city,public_notes,vehicle_photos(url,sort_order)").eq("id",id).eq("status","published").single();
    if(!car)return children;
    const title=`${car.year||""} ${car.brand} ${car.model} ${car.variant||""}`.replace(/\s+/g," ").trim();
    const photos=[...((car as any).vehicle_photos||[])].sort((a:any,b:any)=>(a.sort_order||0)-(b.sort_order||0));
    const schema={
      "@context":"https://schema.org",
      "@type":"Vehicle",
      "@id":`${site}/cars/${id}#vehicle`,
      name:title,
      url:`${site}/cars/${id}`,
      brand:car.brand?{"@type":"Brand",name:car.brand}:undefined,
      model:car.model||undefined,
      vehicleModelDate:car.year?String(car.year):undefined,
      mileageFromOdometer:car.km!=null?{"@type":"QuantitativeValue",value:Number(car.km),unitCode:"KMT"}:undefined,
      fuelType:car.fuel||undefined,
      vehicleTransmission:(car as any).transmission||undefined,
      image:photos.map((x:any)=>x.url).filter(Boolean),
      description:car.public_notes||undefined,
      offers:car.asking_price?{"@type":"Offer",priceCurrency:"INR",price:Number(car.asking_price),availability:"https://schema.org/InStock",url:`${site}/cars/${id}`,seller:{"@id":`${site}/#organization`}}:undefined
    };
    return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/>{children}</>;
  }catch{return children}
}
