import type {Metadata} from "next";
import HomeClient from "./HomeClient";
import {supabase} from "./supabaseClient";

export const revalidate=300;

export const metadata:Metadata={
 title:"Used Cars in Ambala | Rohilla Multibrand Cars",
 description:"Browse current used and second hand cars in Ambala from ROHILLA DRIVE by Rohilla Multibrand Cars. View live inventory, prices and photos, sell your car or send a direct requirement.",
 alternates:{canonical:"/"},
 openGraph:{
  title:"Used Cars in Ambala | Rohilla Multibrand Cars & ROHILLA DRIVE",
  description:"Current used cars, direct enquiries and car selling assistance in Ambala City.",
  url:"/",
  type:"website"
 }
};

export default async function Page(){
 const db=supabase();
 const {data,count}=await db.from("vehicles")
  .select("id,brand,model,variant,year,km,fuel,owner_count,asking_price,city,public_notes,vehicle_photos(url,sort_order)",{count:"exact"})
  .eq("status","published")
  .order("created_at",{ascending:false})
  .limit(8);
 return <HomeClient initialCars={(data||[]) as any[]} totalCars={count??(data||[]).length}/>;
}
