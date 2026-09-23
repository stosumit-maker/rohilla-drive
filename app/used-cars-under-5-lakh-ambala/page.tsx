import type {Metadata} from "next";
import {supabase} from "../supabaseClient";
import AmbalaLeadFunnel from "../components/AmbalaLeadFunnel";

export const revalidate=300;

export const metadata:Metadata={
  title:"Used Cars Under 5 Lakh in Ambala | Second Hand Cars",
  description:"Browse current used and second hand cars under ₹5 lakh in Ambala from ROHILLA DRIVE by Rohilla Multibrand Cars. View live published stock or send your budget requirement.",
  alternates:{canonical:"/used-cars-under-5-lakh-ambala"},
  openGraph:{title:"Used Cars Under ₹5 Lakh in Ambala | ROHILLA DRIVE",description:"Current pre-owned cars under ₹5 lakh in Ambala plus direct requirement enquiry.",url:"/used-cars-under-5-lakh-ambala",type:"website"},
  twitter:{card:"summary_large_image",title:"Used Cars Under ₹5 Lakh in Ambala | ROHILLA DRIVE",description:"Browse live budget used cars in Ambala or send your exact requirement."}
};

type Car={id:string;brand:string;model:string;variant:string|null;year:number|null;km:number|null;fuel:string|null;owner_count:number|null;asking_price:number|null;city:string|null;registration_prefix:string|null;vehicle_photos?:{url:string;sort_order:number|null}[]};
const site="https://www.rohilladrive.com";

export default async function UsedCarsUnderFiveLakhAmbala(){
  const db=supabase();
  const {data}=await db.from("vehicles")
    .select("id,brand,model,variant,year,km,fuel,owner_count,asking_price,city,registration_prefix,vehicle_photos(url,sort_order)")
    .eq("status","published")
    .ilike("city","%Ambala%")
    .lte("asking_price",500000)
    .order("asking_price",{ascending:true})
    .limit(48);
  const cars=(data||[]) as Car[];
  const listSchema={"@context":"https://schema.org","@type":"CollectionPage","@id":`${site}/used-cars-under-5-lakh-ambala#page`,name:"Used Cars Under 5 Lakh in Ambala",url:`${site}/used-cars-under-5-lakh-ambala`,description:"Current published used cars priced up to ₹5 lakh in Ambala from ROHILLA DRIVE.",mainEntity:{"@type":"ItemList",numberOfItems:cars.length,itemListElement:cars.map((c,i)=>({"@type":"ListItem",position:i+1,url:`${site}/cars/${c.id}`,name:[c.year,c.brand,c.model,c.variant].filter(Boolean).join(" ")}))}};
  const faq=[
    ["Can I find used cars under ₹5 lakh in Ambala here?","Yes. This page automatically shows currently published Ambala inventory with an asking price up to ₹5 lakh. Availability changes as cars are added or sold."],
    ["What if the model I need is not listed?","Send your model, budget and contact details through the requirement form. ROHILLA DRIVE can follow up when a suitable option is available or sourced through the network."],
    ["Are prices final?","The displayed amount is the published asking price. Final transaction terms depend on the specific vehicle, inspection, documents and agreement between the parties."],
    ["Can I sell my current car too?","Yes. Use the Sell Car in Ambala page to submit a quick enquiry or the full Sell / List workflow for detailed vehicle information and private photos."]
  ];
  const faqSchema={"@context":"https://schema.org","@type":"FAQPage","mainEntity":faq.map(([q,a])=>({"@type":"Question",name:q,acceptedAnswer:{"@type":"Answer",text:a}}))};

  return <main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(listSchema)}}/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(faqSchema)}}/>
    <section className="hero" style={{paddingTop:52,paddingBottom:52}}><div className="heroText">
      <span>BUDGET USED CARS • AMBALA CITY</span>
      <h1>Used Cars Under ₹5 Lakh in Ambala</h1>
      <p className="heroSub">Second hand cars • Live published stock • Direct enquiry</p>
      <p>Browse actual ROHILLA DRIVE inventory currently priced up to ₹5 lakh in Ambala. If the exact car you want is not listed, send your budget and model requirement for direct follow-up.</p>
      <div className="row" style={{marginTop:18}}><a className="call" href="#ambala-enquiry">Send My Requirement</a><a className="call" href="/used-cars-ambala">All Used Cars in Ambala</a><a className="secondary" href="tel:+917015260003">Call 7015260003</a></div>
    </div></section>

    <AmbalaLeadFunnel source="used_cars_under_5_lakh_ambala" defaultMode="buy"/>

    <section className="section" style={{paddingTop:30}}><div className="head"><div><h2>Current Cars Up to ₹5 Lakh</h2><p>{cars.length?`${cars.length} published Ambala vehicle${cars.length===1?"":"s"} currently match this budget.`:"No matching Ambala vehicle is published right now. Send your requirement so the team can follow up when a suitable car becomes available."}</p></div><a className="textLink" href="/inventory">Full Inventory →</a></div>
    {cars.length?<div className="grid">{cars.map(c=>{const photos=[...(c.vehicle_photos||[])].sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));const first=photos[0]?.url;return <article className="card" key={c.id}><a className="photo real" href={`/cars/${c.id}`} aria-label={`Open ${c.brand} ${c.model} details`}>{first?<img src={first} alt={`${c.year||""} ${c.brand} ${c.model} used car under 5 lakh in Ambala`}/>:<span>Vehicle photo unavailable</span>}</a><div className="body"><label>UNDER ₹5 LAKH • AMBALA</label><h2 style={{fontSize:22}}>{c.brand} {c.model}</h2>{c.variant&&<p>{c.variant}</p>}<small>{c.year||"Year on request"}{c.km!=null?` • ${Number(c.km).toLocaleString("en-IN")} km`:""}{c.fuel?` • ${c.fuel}`:""}{c.owner_count?` • ${c.owner_count} Owner`:""}</small>{c.asking_price!=null&&<strong>₹{Number(c.asking_price).toLocaleString("en-IN")}</strong>}<a className="call" href={`/cars/${c.id}`} style={{display:"block",textAlign:"center"}}>View Car Details</a><div className="row" style={{marginTop:8,gap:6}}><a className="call" href={`/cars/${c.id}?enquire=1`} style={{flex:1,textAlign:"center",padding:"9px 8px",fontSize:11}}>Enquire / WhatsApp</a><a className="secondary" href={`/cars/${c.id}?book=1`} style={{flex:1,textAlign:"center",padding:"9px 8px",fontSize:11,borderRadius:10,fontWeight:800,textDecoration:"none"}}>Book Now</a></div></div></article>})}</div>:<div className="notice"><b>Budget fixed at ₹5 lakh?</b> <a href="#ambala-enquiry">Send the model and budget you need →</a></div>}
    </section>

    <section className="section compactSection"><div className="head"><div><h2>Buying a Budget Used Car in Ambala</h2></div></div><div className="grid">
      <article className="card"><div className="body"><h3>Compare the actual car</h3><p>Check year, kilometres, fuel, ownership, registration and published photos on each listing instead of relying only on a budget filter.</p></div></article>
      <article className="card"><div className="body"><h3>Verify before payment</h3><p>Confirm vehicle condition, documents, pending dues and transaction terms before completing a purchase.</p><a className="textLink" href="/verify">Vehicle verification →</a></div></article>
      <article className="card"><div className="body"><h3>Need a different model?</h3><p>Send a requirement even when the exact car is not in current stock. Your enquiry is saved for direct follow-up.</p><a className="textLink" href="/find-car-ambala">Find a car for me →</a></div></article>
    </div></section>

    <section className="section"><div className="head"><div><h2>Used Cars Under ₹5 Lakh in Ambala — FAQs</h2></div></div><div className="grid">{faq.map(([q,a])=><article className="card" key={q}><div className="body"><h3>{q}</h3><p>{a}</p></div></article>)}</div></section>
  </main>;
}
