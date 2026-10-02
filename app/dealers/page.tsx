import type {Metadata} from "next";
import {supabase} from "../supabaseClient";

const site="https://www.rohilladrive.com";

export const revalidate=300;
export const metadata:Metadata={
 title:"Used Car Dealers & Dealer Inventory | Rohilla Drive",
 description:"Browse dealer-listed used cars on Rohilla Drive or apply as a pre-owned dealer to publish inventory and receive customer requirements.",
 alternates:{canonical:"/dealers"}
};

export default async function Dealers(){
 const db=supabase();
 const {data,count}=await db.from("vehicles").select("id,brand,model,variant,year,asking_price,city,partner_id",{count:"exact"}).eq("status","published").eq("inventory_owner_type","dealer_inventory").order("created_at",{ascending:false}).limit(24);
 const cars=(data||[]) as any[];
 const schema={"@context":"https://schema.org","@type":"CollectionPage","@id":`${site}/dealers#directory`,name:"Used Car Dealers & Dealer Inventory | Rohilla Drive",url:`${site}/dealers`,description:"Rohilla Drive dealer network and published dealer inventory.",mainEntity:{"@type":"ItemList",numberOfItems:cars.length,itemListElement:cars.map((c:any,i:number)=>({"@type":"ListItem",position:i+1,url:`${site}/cars/${c.id}`,name:`${c.year||""} ${c.brand} ${c.model}`.trim()}))}};
 return <main>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/>
  <section className="hero"><div className="heroText"><span>ROHILLA DRIVE DEALER NETWORK</span><h1>Used Car Dealers & Dealer Inventory</h1><p>Rohilla Drive connects customers with published vehicle inventory and gives approved pre-owned dealers a workspace to list stock and handle eligible requirements.</p><div className="row"><a className="call" href="/inventory">Browse All Cars</a><a className="call" href="/join/preowned">Join as Used Car Dealer</a><a className="secondary" href="/dealer">Dealer Sign In</a></div></div></section>
  <section className="section"><div className="head"><div><h2>Dealer-Listed Cars</h2><p>{count?count+" dealer vehicle"+(count===1?"":"s")+" currently published.":"Dealer inventory will appear here when approved dealers publish vehicles."}</p></div></div>
  {cars.length?<div className="grid">{cars.map(c=><article className="card" key={c.id}><div className="body"><h3>{c.brand} {c.model}{c.variant?" "+c.variant:""}</h3><p>{[c.year,c.city].filter(Boolean).join(" • ")}</p>{c.asking_price&&<strong>₹{Number(c.asking_price).toLocaleString("en-IN")}</strong>}<p><a className="textLink" href={"/cars/"+c.id}>View Vehicle →</a></p></div></article>)}</div>:<div className="notice">No dealer-owned vehicle is publicly listed yet. Rohilla Drive's own published inventory remains available in the main inventory.</div>}</section>
  <section className="section dark"><div className="about"><h2>Grow on Rohilla Drive</h2><p>Approved dealers can manage inventory, sourcing and vehicle workflows from the Dealer Workspace. Customer-facing inventory remains tied to actual published vehicles.</p><div className="row"><a className="call" href="/join/preowned">Create Dealer Account</a><a className="secondary" href="/business-hub">View All Business Types</a></div></div></section>
 </main>
}
