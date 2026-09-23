"use client";
import {useEffect,useState} from "react";
import {supabase} from "../../supabaseClient";

const ownerLabel=(v:string)=>({rohilla_inventory:"Our / Rohilla inventory",dealer_inventory:"Dealer inventory",customer_vehicle:"Customer vehicle",external_vehicle:"External listing"} as Record<string,string>)[v]||"Inventory";
const outcomeLabel=(v:string)=>({sold_by_rohilla:"Sold by Rohilla Drive",sold_through_rohilla:"Sold through Rohilla Drive"} as Record<string,string>)[v]||"Needs sale classification";
const selectFields="id,brand,model,variant,year,km,fuel,asking_price,city,registration_prefix,inventory_owner_type,sale_outcome,sold_at,sold_notes,vehicle_photos(url,sort_order)";

export default function SoldHistoryClient(){
 const db=supabase();const [cars,setCars]=useState<any[]>([]),[pending,setPending]=useState<any[]>([]),[loading,setLoading]=useState(true),[msg,setMsg]=useState("");
 async function load(){
  setLoading(true);
  const [history,needsClassification]=await Promise.all([
   db.from("vehicles").select(selectFields).eq("status","sold").in("sale_outcome",["sold_by_rohilla","sold_through_rohilla"]).order("sold_at",{ascending:false,nullsFirst:false}),
   db.from("vehicles").select(selectFields).eq("status","sold").is("sale_outcome",null).order("created_at",{ascending:false})
  ]);
  setLoading(false);
  if(history.error||needsClassification.error){setMsg(history.error?.message||needsClassification.error?.message||"Could not load sold vehicles.");return}
  setCars(history.data||[]);setPending(needsClassification.data||[]);
 }
 useEffect(()=>{load()},[]);
 async function restore(id:string){if(!confirm("Move this vehicle back to active draft inventory?"))return;const {error}=await db.from("vehicles").update({status:"draft",sale_outcome:null,sold_at:null,sold_notes:null}).eq("id",id);if(error){setMsg(error.message);return}setMsg("Vehicle restored to draft inventory.");load()}
 async function classify(id:string,outcome:string){const through=["sold_by_rohilla","sold_through_rohilla"].includes(outcome);const {error}=await db.from("vehicles").update({status:through?"sold":"archived",sale_outcome:outcome,sold_at:outcome==="removed"?null:new Date().toISOString()}).eq("id",id);if(error){setMsg(error.message);return}setMsg(through?"Sale classification saved.":"Removed from Sold History.");load()}
 function card(c:any,needsClassification=false){const photo=[...(c.vehicle_photos||[])].sort((a:any,b:any)=>(a.sort_order||0)-(b.sort_order||0))[0]?.url;return <article className="card" key={c.id}><div className="photo real">{photo&&<img src={photo} alt=""/>}</div><div className="body"><label>{needsClassification?"CLASSIFY SALE":"SOLD"}</label><h3>{c.year} {c.brand} {c.model} {c.variant||""}</h3><p>{Number(c.km||0).toLocaleString("en-IN")} km • {c.fuel||"—"} • {c.city||"—"}{c.registration_prefix?" • "+c.registration_prefix:""}</p><strong>₹{Number(c.asking_price||0).toLocaleString("en-IN")}</strong><small>{ownerLabel(c.inventory_owner_type)} • {outcomeLabel(c.sale_outcome)}{c.sold_at?" • "+new Date(c.sold_at).toLocaleDateString("en-IN"):""}</small>{c.sold_notes&&<p>{c.sold_notes}</p>}{needsClassification&&<div className="row"><button onClick={()=>classify(c.id,"sold_by_rohilla")}>Sold by us</button><button onClick={()=>classify(c.id,"sold_through_rohilla")}>Sold through us</button><button className="secondary" onClick={()=>classify(c.id,"sold_elsewhere")}>Sold elsewhere</button><button className="secondary" onClick={()=>classify(c.id,"removed")}>Remove / withdraw</button></div>}<button className="secondary" onClick={()=>restore(c.id)}>Restore if marked by mistake</button></div></article>}
 return <main className="section">
  <div className="adminSectionTitleRow"><div><div className="adminSectionKicker">TRANSACTION HISTORY</div><h1>Sold History</h1><p>Only vehicles sold by or through Rohilla Drive are kept here. Vehicles sold elsewhere or withdrawn do not appear in this history.</p></div><a className="call" href="/admin">← Dashboard</a></div>
  {msg&&<div className="notice">{msg}</div>}
  {pending.length>0&&<section style={{marginBottom:28}}><div className="head"><div><h2>Needs Classification</h2><p>Legacy sold entries stay outside Sold History until you confirm how the sale happened.</p></div></div><div className="grid">{pending.map(c=>card(c,true))}</div></section>}
  {loading?<p>Loading sold vehicles…</p>:cars.length===0?<div className="notice">No classified Rohilla Drive sold vehicles recorded yet.</div>:<div className="grid">{cars.map(c=>card(c,false))}</div>}
 </main>
}
