import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {supabase} from "../../supabaseClient";
import CarDetailClient from "./CarDetailClient";

type Params={id:string};
const site="https://www.rohilladrive.com";

async function getCar(id:string){
 const db=supabase();
 const {data}=await db.from("vehicles")
  .select("id,brand,model,variant,year,km,fuel,transmission,owner_count,asking_price,city,public_notes,registration_prefix,status,created_at,vehicle_photos(url,sort_order),vehicle_media(id,url,media_kind,media_category,sort_order)")
  .eq("id",id)
  .eq("status","published")
  .single();
 return data||null;
}

function carName(c:any){
 return [c.year,c.brand,c.model,c.variant].filter(Boolean).join(" ");
}

export const revalidate=300;

export async function generateMetadata({params}:{params:Promise<Params>}):Promise<Metadata>{
 const {id}=await params;
 const c=await getCar(id);
 if(!c)return {title:"Vehicle Not Available | ROHILLA DRIVE",robots:{index:false,follow:true}};
 const name=carName(c);
 const price=c.asking_price!=null?`₹${Number(c.asking_price).toLocaleString("en-IN")}`:"Price on request";
 const place=c.city||"Ambala";
 const description=`${name} used car in ${place}. ${c.km!=null?Number(c.km).toLocaleString("en-IN")+" km, ":""}${c.fuel||""}${c.transmission?", "+c.transmission:""}. Asking price ${price}. View photos and enquire with ROHILLA DRIVE by Rohilla Multibrand Cars.`;
 const images=[...(c.vehicle_photos||[])].sort((a:any,b:any)=>(a.sort_order||0)-(b.sort_order||0)).map((x:any)=>x.url).filter(Boolean);
 return {
  title:`${name} Used Car in ${place} | ${price}`,
  description,
  alternates:{canonical:`/cars/${id}`},
  robots:{index:true,follow:true},
  openGraph:{title:`${name} Used Car | ROHILLA DRIVE`,description,url:`/cars/${id}`,type:"website",images},
  twitter:{card:images.length?"summary_large_image":"summary",title:`${name} Used Car | ROHILLA DRIVE`,description,images}
 };
}

export default async function CarPage({params}:{params:Promise<Params>}){
 const {id}=await params;
 const c=await getCar(id);
 if(!c)notFound();
 const name=carName(c);
 const photos=[...(c.vehicle_photos||[])].sort((a:any,b:any)=>(a.sort_order||0)-(b.sort_order||0)).map((x:any)=>x.url).filter(Boolean);
 const additional=[
  c.year&&{"@type":"PropertyValue",name:"Model Year",value:String(c.year)},
  c.km!=null&&{"@type":"PropertyValue",name:"Kilometres",value:`${Number(c.km).toLocaleString("en-IN")} km`},
  c.fuel&&{"@type":"PropertyValue",name:"Fuel",value:c.fuel},
  c.transmission&&{"@type":"PropertyValue",name:"Transmission",value:c.transmission},
  c.owner_count&&{"@type":"PropertyValue",name:"Owner Count",value:String(c.owner_count)},
  c.city&&{"@type":"PropertyValue",name:"Location",value:c.city},
  c.registration_prefix&&{"@type":"PropertyValue",name:"Registration Prefix",value:c.registration_prefix}
 ].filter(Boolean);
 const productSchema:any={
  "@context":"https://schema.org",
  "@type":["Product","Car"],
  "@id":`${site}/cars/${c.id}#vehicle`,
  name,
  url:`${site}/cars/${c.id}`,
  image:photos,
  description:c.public_notes||`${name} used vehicle listed by ROHILLA DRIVE by Rohilla Multibrand Cars.`,
  sku:c.id,
  brand:{"@type":"Brand",name:c.brand},
  category:"Used car",
  itemCondition:"https://schema.org/UsedCondition",
  vehicleModelDate:c.year?String(c.year):undefined,
  mileageFromOdometer:c.km!=null?{"@type":"QuantitativeValue",value:Number(c.km),unitCode:"KMT"}:undefined,
  fuelType:c.fuel||undefined,
  vehicleTransmission:c.transmission||undefined,
  additionalProperty:additional,
  offers:c.asking_price!=null?{
   "@type":"Offer",
   url:`${site}/cars/${c.id}`,
   priceCurrency:"INR",
   price:Number(c.asking_price),
   availability:"https://schema.org/InStock",
   itemCondition:"https://schema.org/UsedCondition",
   seller:{"@id":`${site}/#organization`}
  }:undefined
 };
 const breadcrumb={"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:[
  {"@type":"ListItem",position:1,name:"ROHILLA DRIVE",item:site},
  {"@type":"ListItem",position:2,name:"Used Cars in Ambala",item:`${site}/used-cars-ambala`},
  {"@type":"ListItem",position:3,name,item:`${site}/cars/${c.id}`}
 ]};
 return <>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(productSchema)}}/>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(breadcrumb)}}/>
  <CarDetailClient initialCar={c}/>
 </>;
}
