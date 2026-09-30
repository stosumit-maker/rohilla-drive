import type {Metadata} from "next";
import {supabase} from "../supabaseClient";
import AmbalaLeadFunnel from "../components/AmbalaLeadFunnel";

export const revalidate=300;

export const metadata:Metadata={
  title:"Used Cars Under 3 Lakh in Ambala | Second Hand Cars",
  description:"Browse current used and second hand cars under ₹3 lakh in Ambala City from Rohilla Multibrand Cars. View live stock, prices and photos or send your budget requirement.",
  alternates:{canonical:"/used-cars-under-3-lakh-ambala"},
  openGraph:{title:"Used Cars Under ₹3 Lakh in Ambala | Rohilla Multibrand Cars",description:"Live budget used cars under ₹3 lakh in Ambala City.",url:"/used-cars-under-3-lakh-ambala",type:"website"}
};

type Car={id:string;brand:string;model:string;variant:string|null;year:number|null;km:number|null;fuel:string|null;owner_count:number|null;asking_price:number|null;city:string|null;registration_prefix:string|null;vehicle_photos?:{url:string;sort_order:number|null}[]};
const site="https://www.rohilladrive.com";

export default async function UsedCarsUnderThreeLakhAmbala(){
  const db=supabase();
  const {data}=await db.from("vehicles")
    .select("id,brand,model,variant,year,km,fuel,owner_count,asking_price,city,registration_prefix,vehicle_photos(url,sort_order)")
    .eq("status","published")
    .ilike("city","%Ambala%")
    .lte("asking_price",300000)
    .order("asking_price",{ascending:true})
    .limit(48);
  const cars=(data||[]) as Car[];

  const schema={"@context":"https://schema.org","@type":"CollectionPage","@id":`${site}/used-cars-under-3-lakh-ambala#page`,name:"Used Cars Under 3 Lakh in Ambala",url:`${site}/used-cars-under-3-lakh-ambala`,about:{"@id":`${site}/ambala#autodealer`},mainEntity:{"@type":"ItemList",numberOfItems:cars.length,itemListElement:cars.map((c,i)=>({"@type":"ListItem",position:i+1,url:`${site}/cars/${c.id}`,name:[c.year,c.brand,c.model,c.variant].filter(Boolean).join(" ")}))}};

  return <main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/>
    <section className="hero" style={{paddingTop:52,paddingBottom:52}}><div className="heroText">
      <span>LOW BUDGET USED CARS • AMBALA CITY</span>
      <h1>Used Cars Under ₹3 Lakh in Ambala</h1>
      <p className="heroSub">Second hand cars • Budget cars • Live published stock</p>
      <p>Looking for an affordable used car in Ambala? Browse current cars priced up to ₹3 lakh or send the model and budget you need.</p>
      <div className="row" style={{marginTop:18}}><a className="call" href="/used-cars-ambala">All Used Cars in Ambala</a><a className="call" href="/used-cars-under-5-lakh-ambala">Cars Under ₹5 Lakh</a><a className="secondary" href="#ambala-enquiry">Send Requirement</a></div>
    </div></section>

    <AmbalaLeadFunnel source="used_cars_under_3_lakh_ambala" defaultMode="buy"/>

    <section className="section" style={{paddingTop:30}}>
      <div className="head"><div><h2>Current Second Hand Cars Under ₹3 Lakh</h2><p>{cars.length?`${cars.length} published Ambala vehicle${cars.length===1?"":"s"} currently match this budget.`:"No matching Ambala vehicle is published right now. Send your requirement for follow-up."}</p></div></div>
      {cars.length?<div className="grid">{cars.map(c=>{const photos=[...(c.vehicle_photos||[])].sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));const first=photos[0]?.url;return <article className="card" key={c.id}><a className="photo real" href={`/cars/${c.id}`}>{first?<img src={first} alt={`${c.year||""} ${c.brand} ${c.model} used car under 3 lakh in Ambala`}/>:<span>Vehicle photo unavailable</span>}</a><div className="body"><label>UNDER ₹3 LAKH • AMBALA</label><h2 style={{fontSize:22}}>{c.brand} {c.model}</h2>{c.variant&&<p>{c.variant}</p>}<small>{c.year||"Year on request"}{c.km!=null?` • ${Number(c.km).toLocaleString("en-IN")} km`:""}{c.fuel?` • ${c.fuel}`:""}{c.owner_count?` • ${c.owner_count} Owner`:""}</small>{c.asking_price!=null&&<strong>₹{Number(c.asking_price).toLocaleString("en-IN")}</strong>}<a className="call" href={`/cars/${c.id}`} style={{display:"block",textAlign:"center"}}>View Car Details</a></div></article>})}</div>:<div className="notice"><b>Need a low-budget car?</b> <a href="#ambala-enquiry">Send your model and budget →</a></div>}
    </section>
  </main>;
}
