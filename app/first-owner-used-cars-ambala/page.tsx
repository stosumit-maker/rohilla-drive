import type {Metadata} from "next";
import {supabase} from "../supabaseClient";
import AmbalaLeadFunnel from "../components/AmbalaLeadFunnel";

export const revalidate=300;

export const metadata:Metadata={
  title:"First Owner Used Cars in Ambala | Second Hand Cars",
  description:"Browse current first owner used and second hand cars in Ambala City from Rohilla Multibrand Cars. View live published stock, prices, kilometres and photos.",
  alternates:{canonical:"/first-owner-used-cars-ambala"},
  openGraph:{title:"First Owner Used Cars in Ambala | Rohilla Multibrand Cars",description:"Current first-owner pre-owned cars in Ambala City.",url:"/first-owner-used-cars-ambala",type:"website"}
};

type Car={id:string;brand:string;model:string;variant:string|null;year:number|null;km:number|null;fuel:string|null;owner_count:number|null;asking_price:number|null;city:string|null;vehicle_photos?:{url:string;sort_order:number|null}[]};
const site="https://www.rohilladrive.com";

export default async function FirstOwnerUsedCarsAmbala(){
  const db=supabase();
  const {data}=await db.from("vehicles")
    .select("id,brand,model,variant,year,km,fuel,owner_count,asking_price,city,vehicle_photos(url,sort_order)")
    .eq("status","published")
    .eq("owner_count",1)
    .ilike("city","%Ambala%")
    .order("created_at",{ascending:false})
    .limit(48);
  const cars=(data||[]) as Car[];

  const schema={"@context":"https://schema.org","@type":"CollectionPage","@id":`${site}/first-owner-used-cars-ambala#page`,name:"First Owner Used Cars in Ambala",url:`${site}/first-owner-used-cars-ambala`,about:{"@id":`${site}/ambala#autodealer`},mainEntity:{"@type":"ItemList",numberOfItems:cars.length,itemListElement:cars.map((c,i)=>({"@type":"ListItem",position:i+1,url:`${site}/cars/${c.id}`,name:[c.year,c.brand,c.model,c.variant].filter(Boolean).join(" ")}))}};

  return <main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/>
    <section className="hero" style={{paddingTop:52,paddingBottom:52}}><div className="heroText">
      <span>FIRST OWNER USED CARS • AMBALA</span>
      <h1>First Owner Used Cars in Ambala</h1>
      <p className="heroSub">Second hand cars • Pre-owned cars • Live inventory</p>
      <p>Browse current first-owner cars published for Ambala and check price, kilometres, fuel and photos before enquiry.</p>
      <div className="row" style={{marginTop:18}}><a className="call" href="/used-cars-ambala">All Used Cars in Ambala</a><a className="call" href="/used-cars-under-5-lakh-ambala">Cars Under ₹5 Lakh</a><a className="secondary" href="#ambala-enquiry">Find a Car</a></div>
    </div></section>

    <AmbalaLeadFunnel source="first_owner_used_cars_ambala" defaultMode="buy"/>

    <section className="section" style={{paddingTop:30}}>
      <div className="head"><div><h2>Current First Owner Cars in Ambala</h2><p>{cars.length?`${cars.length} published first-owner vehicle${cars.length===1?"":"s"} currently match Ambala.`:"No matching vehicle is published right now. Send your requirement for follow-up."}</p></div></div>
      {cars.length?<div className="grid">{cars.map(c=>{const photos=[...(c.vehicle_photos||[])].sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));const first=photos[0]?.url;return <article className="card" key={c.id}><a className="photo real" href={`/cars/${c.id}`}>{first?<img src={first} alt={`${c.year||""} ${c.brand} ${c.model} first owner used car in Ambala`}/>:<span>Vehicle photo unavailable</span>}</a><div className="body"><label>FIRST OWNER • AMBALA</label><h2 style={{fontSize:22}}>{c.brand} {c.model}</h2>{c.variant&&<p>{c.variant}</p>}<small>{c.year||"Year on request"}{c.km!=null?` • ${Number(c.km).toLocaleString("en-IN")} km`:""}{c.fuel?` • ${c.fuel}`:""}</small>{c.asking_price!=null&&<strong>₹{Number(c.asking_price).toLocaleString("en-IN")}</strong>}<a className="call" href={`/cars/${c.id}`} style={{display:"block",textAlign:"center"}}>View Car Details</a></div></article>})}</div>:<div className="notice"><b>Looking specifically for a first-owner car?</b> <a href="#ambala-enquiry">Send your requirement →</a></div>}
    </section>
  </main>;
}
