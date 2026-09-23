import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {supabase} from "../../supabaseClient";
import AmbalaLeadFunnel from "../../components/AmbalaLeadFunnel";
import {buyPath,getMarketLocation,marketLocations,sellPath} from "../../lib/market-locations";

export const revalidate=300;

type Params={location:string};
type Car={id:string;brand:string;model:string;variant:string|null;year:number|null;km:number|null;fuel:string|null;owner_count:number|null;asking_price:number|null;city:string|null;registration_prefix:string|null;vehicle_photos?:{url:string;sort_order:number|null}[]};

export function generateStaticParams(){
  return marketLocations.filter(x=>!x.legacyBuyPath).map(x=>({location:x.slug}));
}

export async function generateMetadata({params}:{params:Promise<Params>}):Promise<Metadata>{
  const {location}=await params;
  const loc=getMarketLocation(location);
  if(!loc)return {};
  const title=`Used Cars in ${loc.name} | Buy & Sell Second Hand Cars`;
  const description=`Looking for used cars in ${loc.name}, ${loc.state}? Browse current ROHILLA DRIVE inventory where available or submit your exact model, budget and timing. Sellers can also send a car-for-sale enquiry.`;
  const canonical=buyPath(loc);
  return {title,description,alternates:{canonical},openGraph:{title:`Used Cars in ${loc.name} | ROHILLA DRIVE`,description,url:canonical,type:"website"},twitter:{card:"summary_large_image",title,description}};
}

function matchCity(city:string|null,aliases:string[]){
  const value=(city||"").toLowerCase().replace(/\s+/g," ").trim();
  return aliases.some(a=>value.includes(a.toLowerCase()));
}

export default async function RegionalUsedCars({params}:{params:Promise<Params>}){
  const {location}=await params;
  const loc=getMarketLocation(location);
  if(!loc||loc.legacyBuyPath)notFound();

  const db=supabase();
  const {data}=await db.from("vehicles").select("id,brand,model,variant,year,km,fuel,owner_count,asking_price,city,registration_prefix,vehicle_photos(url,sort_order)").eq("status","published").order("created_at",{ascending:false}).limit(150);
  const all=(data||[]) as Car[];
  const cars=loc.hub?all:all.filter(car=>matchCity(car.city,loc.aliases));
  const related=marketLocations.filter(x=>x.region===loc.region&&x.slug!==loc.slug&&!x.hub).slice(0,8);
  const site="https://www.rohilladrive.com";
  const canonical=buyPath(loc);
  const faqs=[
    [`How do I find used cars in ${loc.name}?`,`Check the current published inventory on ROHILLA DRIVE. If the exact car is not listed in ${loc.name}, submit the model, budget and timing so the requirement can be followed up directly.`],
    [`Can I sell my car in ${loc.name}?`,`Yes. Individual sellers can send a quick sell-car request or use the detailed seller submission with private vehicle photos.`],
    ["Do you guarantee that every listed car is physically in this location?","No. Each vehicle page shows its recorded city where available. Regional pages may also accept buyer requirements for nearby inventory; confirm vehicle location before travelling."],
    ["Is there a fee to send a buying or selling enquiry?","No payment is required to submit the enquiry form on this page."],
    ["How will I be contacted?","Your requirement is saved with the contact details you provide, and you can continue the same enquiry on WhatsApp or call 7015260003."]
  ];
  const schema={"@context":"https://schema.org","@type":"CollectionPage","@id":`${site}${canonical}#page`,name:`Used Cars in ${loc.name}`,url:`${site}${canonical}`,description:`Used-car discovery and buyer/seller enquiry page for ${loc.name}, ${loc.state}.`,isPartOf:{"@id":`${site}/#website`},mainEntity:{"@type":"ItemList",numberOfItems:cars.length,itemListElement:cars.map((car,index)=>({"@type":"ListItem",position:index+1,url:`${site}/cars/${car.id}`,name:`${car.year||""} ${car.brand} ${car.model} ${car.variant||""}`.trim()}))}};
  const faqSchema={"@context":"https://schema.org","@type":"FAQPage",mainEntity:faqs.map(([q,a])=>({"@type":"Question",name:q,acceptedAnswer:{"@type":"Answer",text:a}}))};

  return <main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(faqSchema)}}/>
    <section className="hero" style={{paddingTop:52,paddingBottom:52}}><div className="heroText">
      <span>ROHILLA DRIVE • {loc.region.toUpperCase()}</span>
      <h1>Used Cars in {loc.name}</h1>
      <p className="heroSub">Buy used cars • Sell your car • Direct requirement follow-up</p>
      <p>{loc.marketNote} Coverage is focused around the {loc.corridor}; exact vehicle location and availability must be confirmed before travel or transaction.</p>
      <div className="row" style={{marginTop:18}}><a className="call" href="#ambala-enquiry">Tell Us the Car You Need</a><a className="call" href={sellPath(loc)}>Sell a Car in {loc.name}</a><a className="secondary" href="/inventory">All Live Inventory</a></div>
    </div></section>

    <AmbalaLeadFunnel source={`regional_${loc.slug}`} defaultMode="buy" defaultCity={loc.name} locationName={loc.name}/>

    <section className="section"><div className="head"><div><h2>{loc.hub?"Current ROHILLA DRIVE Network Inventory":`Current Published Cars Matching ${loc.name}`}</h2><p>{cars.length?`${cars.length} published vehicle${cars.length===1?"":"s"} currently shown for this page.`:`No vehicle is currently published with ${loc.name} as its recorded city. Submit your requirement instead of waiting for a matching listing.`}</p></div><a className="textLink" href="/inventory">Full Inventory →</a></div>
      {cars.length?<div className="grid">{cars.slice(0,24).map(car=>{const photos=[...(car.vehicle_photos||[])].sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));const first=photos[0]?.url;return <article className="card" key={car.id}><a className="photo real vehiclePhotoLink" href={`/cars/${car.id}`} aria-label={`Open ${car.brand} ${car.model} details`}>{first?<img src={first} alt={`${car.year||""} ${car.brand} ${car.model} used car`}/>:<span>Vehicle photo unavailable</span>}</a><div className="body"><label>{car.city||"ROHILLA DRIVE"}</label><h2 style={{fontSize:22}}>{car.brand} {car.model}</h2>{car.variant&&<p>{car.variant}</p>}<small>{car.year||"Year on request"}{car.km!=null?` • ${Number(car.km).toLocaleString("en-IN")} km`:""}{car.fuel?` • ${car.fuel}`:""}</small>{car.asking_price!=null&&<strong>₹{Number(car.asking_price).toLocaleString("en-IN")}</strong>}<a className="call" href={`/cars/${car.id}`} style={{display:"block",textAlign:"center"}}>View Details</a><div className="row vehicleCardActions"><a className="call" href={`/cars/${car.id}?enquire=1`}>Enquire / WhatsApp</a><a className="secondary bookVehicleButton" href={`/cars/${car.id}?book=1`}>Book Now</a></div></div></article>})}</div>:<div className="notice"><b>Need a specific model?</b> Use the requirement form above. It works even when the exact car is not currently listed.</div>}
    </section>

    <section className="section compactSection"><div className="head"><div><h2>Vehicle Search Around {loc.name}</h2><p>Nearby markets include {loc.nearby.join(", ")}. ROHILLA DRIVE does not claim a physical branch in every city shown; these pages are for genuine buyer/seller requirement coverage.</p></div></div><div className="grid">
      <article className="card"><div className="body"><h3>Exact model search</h3><p>Send the brand/model, target budget and purchase timing. Your enquiry is saved for direct follow-up.</p></div></article>
      <article className="card"><div className="body"><h3>Sell your current car</h3><p>Start with a callback request or submit full vehicle details and private photos through the seller workflow.</p><a href={sellPath(loc)}>Sell car in {loc.name} →</a></div></article>
      <article className="card"><div className="body"><h3>Check before you travel</h3><p>Confirm actual vehicle city, availability, price, documents and inspection details before travelling or paying anything.</p></div></article>
    </div></section>

    {related.length>0&&<section className="section"><div className="head"><div><h2>More {loc.region} Markets</h2></div></div><div className="joinActions">{related.map(x=><a key={x.slug} href={buyPath(x)}>Used cars in {x.name}</a>)}</div></section>}

    <section className="section dark"><div className="about"><h2>ROHILLA DRIVE — {loc.name} Vehicle Enquiries</h2><p>Rohilla Multibrand Cars is based in Ambala City. ROHILLA DRIVE uses its online platform to capture genuine vehicle buying and selling requirements across Haryana, Chandigarh, nearby Punjab markets and selected Rajasthan markets as the network expands.</p><div className="row"><a className="call" href="tel:+917015260003">Call 7015260003</a><a className="call" href="/coverage">All Coverage Areas</a></div></div></section>

    <section className="section"><div className="head"><div><h2>Used Cars in {loc.name} — FAQs</h2></div></div><div className="grid">{faqs.map(([q,a])=><article className="card" key={q}><div className="body"><h3>{q}</h3><p>{a}</p></div></article>)}</div></section>
  </main>;
}
