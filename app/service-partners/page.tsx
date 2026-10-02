import type {Metadata} from "next";
import {supabase} from "../supabaseClient";

export const revalidate=300;
export const metadata:Metadata={
 title:"Automotive Service Partners | Rohilla Drive",
 description:"Discover automotive service categories on Rohilla Drive and connect with approved partners as the network grows.",
 alternates:{canonical:"/service-partners"}
};

export default async function ServicePartners(){
 const db=supabase();
 const {data}=await db.from("network_partners").select("id,business_name,city,category,subcategories,service_area").eq("active",true).order("business_name");
 const partners=(data||[]) as any[];
 const categories=["Workshop / Repairs","Car Inspection / Verification","Car Detailing","RC / RTO Assistance","Roadside Assistance","Tyres / Battery","Insurance","Finance DSA","Vehicle Delivery / Logistics"];
 return <main>
  <section className="hero"><div className="heroText"><span>ROHILLA DRIVE NETWORK</span><h1>Automotive Service Partners</h1><p>Find vehicle services through the Rohilla Drive network. Approved businesses can join and receive eligible customer requirements.</p><div className="row"><a className="call" href="/join/partner">List Your Automotive Business</a><a className="secondary" href="/business-hub">Business Hub</a></div></div></section>
  <section className="section"><div className="head"><div><h2>Browse Services</h2><p>Choose the service you need.</p></div></div><div className="grid">{categories.map(c=><article className="card" key={c}><div className="body"><h3>{c}</h3><p>Send your requirement and Rohilla Drive will route it through the supported service workflow.</p><a className="textLink" href="/car-services/ambala">Request Service →</a></div></article>)}</div></section>
  <section className="section compactSection"><div className="head"><div><h2>Network Businesses</h2><p>{partners.length?partners.length+" active partner"+(partners.length===1?"":"s")+" currently listed.":"Approved partners will appear here as the network is activated."}</p></div></div>
  {partners.length?<div className="grid">{partners.map(p=><article className="card" key={p.id}><div className="body"><h3>{p.business_name}</h3><p>{[p.category,p.city].filter(Boolean).join(" • ")}</p>{p.service_area&&<small>Service area: {p.service_area}</small>}</div></article>)}</div>:<div className="notice">No public partner listing is active yet. Customers can still request a service and automotive businesses can apply to join.</div>}</section>
  <section className="section dark"><div className="about"><h2>Are you an automotive business?</h2><p>Workshops, inspection providers, detailers, RC/RTO assistance, roadside support, tyres, batteries and other automotive businesses can apply to the Rohilla Drive network.</p><div className="row"><a className="call" href="/join/partner">Create Partner Account</a><a className="secondary" href="/partner">Partner Sign In</a></div></div></section>
 </main>
}
