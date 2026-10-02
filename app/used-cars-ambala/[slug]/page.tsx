import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {supabase} from "../../supabaseClient";

export const revalidate=300;
const site="https://www.rohilladrive.com";

type Car={id:string;brand:string;model:string;variant:string|null;year:number|null;km:number|null;fuel:string|null;owner_count:number|null;asking_price:number|null;city:string|null;vehicle_photos?:{url:string;sort_order:number|null}[]};

function slugify(v:string){return v.toLowerCase().trim().replace(/&/g,"and").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");}
async function getCars(slug:string){
  const db=supabase();
  const {data}=await db.from("vehicles")
    .select("id,brand,model,variant,year,km,fuel,owner_count,asking_price,city,vehicle_photos(url,sort_order)")
    .eq("status","published").ilike("city","%Ambala%")
    .order("created_at",{ascending:false}).limit(200);
  const all=(data||[]) as Car[];
  return all.filter(c=>slugify(`${c.brand}-${c.model}`)===slug);
}

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const {slug}=await params;
  const cars=await getCars(slug);
  if(!cars.length)return {title:"Used Car in Ambala",robots:{index:false,follow:true}};
  const c=cars[0];
  const name=`${c.brand} ${c.model}`;
  const title=`${name} Used Cars in Ambala | Second Hand ${c.model} for Sale`;
  const description=`Browse current ${name} used cars for sale in Ambala City from Rohilla Multibrand Cars. View second hand ${c.model} prices, kilometres, fuel and photos.`;
  return {title,description,alternates:{canonical:`/used-cars-ambala/${slug}`},openGraph:{title,description,url:`/used-cars-ambala/${slug}`,type:"website"}};
}

export default async function ModelUsedCarsAmbala({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const cars=await getCars(slug);
  if(!cars.length)notFound();
  const first=cars[0];
  const name=`${first.brand} ${first.model}`;
  const schema={"@context":"https://schema.org","@type":"CollectionPage","@id":`${site}/used-cars-ambala/${slug}#page`,name:`${name} Used Cars in Ambala`,url:`${site}/used-cars-ambala/${slug}`,about:{"@id":`${site}/ambala#autodealer`},mainEntity:{"@type":"ItemList",numberOfItems:cars.length,itemListElement:cars.map((c,i)=>({"@type":"ListItem",position:i+1,url:`${site}/cars/${c.id}`,name:[c.year,c.brand,c.model,c.variant].filter(Boolean).join(" ")}))}};
  const breadcrumbSchema={"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:"ROHILLA DRIVE",item:site},{"@type":"ListItem",position:2,name:"Used Cars in Ambala",item:`${site}/used-cars-ambala`},{"@type":"ListItem",position:3,name:`${name} Used Cars in Ambala`,item:`${site}/used-cars-ambala/${slug}`} ]};
  return <main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(breadcrumbSchema)}}/>
    <section className="hero" style={{paddingTop:52,paddingBottom:52}}><div className="heroText">
      <span>USED {first.model.toUpperCase()} • AMBALA CITY</span>
      <h1>{name} Used Cars for Sale in Ambala</h1>
      <p className="heroSub">Second hand {first.model} • Pre-owned {first.model} • Live inventory</p>
      <p>Browse current {name} cars published for Ambala with asking price, kilometres, fuel and photos.</p>
      <div className="row" style={{marginTop:18}}><a className="call" href="/used-cars-ambala">All Used Cars in Ambala</a><a className="call" href="/find-car-ambala">Find a Car for Me</a><a className="secondary" href="https://wa.me/917015260003">WhatsApp</a></div>
    </div></section>
    <section className="section" style={{paddingTop:30}}>
      <div className="head"><div><h2>Current {name} Second Hand Cars in Ambala</h2><p>{cars.length} published vehicle{cars.length===1?"":"s"} currently available.</p></div></div>
      <div className="grid">{cars.map(c=>{const photos=[...(c.vehicle_photos||[])].sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));const image=photos[0]?.url;return <article className="card" key={c.id}>
        <a className="photo real" href={`/cars/${c.id}`}>{image?<img src={image} alt={`${c.year||""} ${c.brand} ${c.model} used car for sale in Ambala`}/>:<span>Vehicle photo unavailable</span>}</a>
        <div className="body"><label>USED CAR • AMBALA</label><h2 style={{fontSize:22}}>{c.year} {c.brand} {c.model}</h2>{c.variant&&<p>{c.variant}</p>}<small>{c.km!=null?`${Number(c.km).toLocaleString("en-IN")} km`:""}{c.fuel?` • ${c.fuel}`:""}{c.owner_count?` • ${c.owner_count} Owner`:""}</small>{c.asking_price!=null&&<strong>₹{Number(c.asking_price).toLocaleString("en-IN")}</strong>}<a className="call" href={`/cars/${c.id}`} style={{display:"block",textAlign:"center"}}>View Car Details</a></div>
      </article>})}</div>
    </section>
    <section className="section compactSection"><div className="head"><div><h2>More Ways to Find a Car</h2><p>Browse current Rohilla Drive inventory or search common Ambala used-car categories.</p></div></div><div className="row" style={{gap:10,flexWrap:"wrap"}}><a className="secondary" href="/inventory">All Cars</a><a className="secondary" href="/used-cars-under-3-lakh-ambala">Cars Under ₹3 Lakh</a><a className="secondary" href="/used-cars-under-5-lakh-ambala">Cars Under ₹5 Lakh</a><a className="secondary" href="/first-owner-used-cars-ambala">First Owner Cars</a><a className="secondary" href="/dealers">Dealer Network</a></div></section>
    <section className="section compactSection"><div className="about"><h2>Looking for another {first.model}?</h2><p>Send your preferred year, fuel, transmission and budget. Rohilla Multibrand Cars can follow up when a suitable option is available.</p><div className="row"><a className="call" href="/find-car-ambala">Send Requirement</a><a className="secondary" href="/sell-car-ambala">Sell Your Car</a></div></div></section>
  </main>;
}
