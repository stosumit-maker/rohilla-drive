"use client";
import {useEffect,useState} from "react";
import {supabase} from "../../supabaseClient";

type SellerLead={
 id:string;customer_name:string|null;customer_phone:string|null;message:string|null;status:string|null;created_at:string|null;
 public_reference:string|null;private_media_paths:string[]|null;preferred_brand:string|null;preferred_model:string|null;customer_city:string|null;budget:number|null;
 previews?:{path:string;url:string}[];
};

export default function SellerSubmissionsClient(){
 const db=supabase();
 const [ready,setReady]=useState(false);
 const [items,setItems]=useState<SellerLead[]>([]);
 const [msg,setMsg]=useState("Checking administrator access…");
 const [busy,setBusy]=useState("");

 useEffect(()=>{gate()},[]);

 async function gate(){
  const {data:{session}}=await db.auth.getSession();
  if(!session){setMsg("Administrator sign-in is required.");return}
  const [{data:aal},{data:isAdmin}]=await Promise.all([db.auth.mfa.getAuthenticatorAssuranceLevel(),db.rpc("is_admin")]);
  if(aal?.currentLevel!=="aal2"||!isAdmin){setMsg("Administrator authentication is required.");return}
  setReady(true);await load();
 }

 async function load(){
  setMsg("Loading seller submissions…");
  const {data,error}=await db.from("leads")
   .select("id,customer_name,customer_phone,message,status,created_at,public_reference,private_media_paths,preferred_brand,preferred_model,customer_city,budget")
   .eq("enquiry_type","sell_vehicle")
   .order("created_at",{ascending:false});
  if(error){setMsg(error.message);return}
  const hydrated=await Promise.all((data||[]).map(async(row:any)=>{
   const previews:{path:string;url:string}[]=[];
   for(const path of row.private_media_paths||[]){
    const signed=await db.storage.from("seller-submission-photos").createSignedUrl(path,1800);
    if(signed.data?.signedUrl)previews.push({path,url:signed.data.signedUrl});
   }
   return {...row,previews};
  }));
  setItems(hydrated as SellerLead[]);
  setMsg(hydrated.length?"Private seller media is visible only to authorised administration users.":"No seller submissions yet.");
 }

 async function setStatus(id:string,status:string){
  setBusy(id);const {error}=await db.from("leads").update({status}).eq("id",id);setBusy("");
  if(error){setMsg(error.message);return}setMsg(`Seller request marked ${status}.`);await load();
 }

 const wa=(phone:string|null,item:SellerLead)=>phone?`https://wa.me/${phone.replace(/\D/g,"")}?text=${encodeURIComponent(`ROHILLA DRIVE seller request ${item.public_reference||item.id.slice(0,8)}\n\nWe are reviewing your vehicle submission and private photos.`)}`:"#";

 if(!ready)return <main><section className="section"><h1>Seller Submissions</h1><p>{msg}</p><a href="/admin">Back to Dashboard</a></section></main>;
 return <main>
  <section className="hero" style={{paddingTop:36,paddingBottom:36}}><div className="heroText"><span>PRIVATE SELLER INTAKE</span><h1>Seller Submissions & Photos</h1><p>Review customer-submitted vehicle details and private photos before any listing is created or published.</p></div></section>
  <section className="section" style={{paddingTop:24}}>
   <div className="head"><div><h2>Seller Requests ({items.length})</h2><p>{msg}</p></div><button onClick={load}>Refresh</button></div>
   {items.length===0?<div className="notice">No seller submissions require review.</div>:<div className="grid">{items.map(item=><article className="application" key={item.id}>
    <div className="photo real swipeGallery">{item.previews?.length?item.previews.map((p,i)=><img key={p.path} src={p.url} alt={`Private seller vehicle photo ${i+1}`}/>):<span>No private photo available</span>}</div>
    <h2>{item.preferred_brand||"Vehicle"} {item.preferred_model||"submission"}</h2>
    <p><b>Reference:</b> {item.public_reference||`RDS-${item.id.replace(/-/g,"").slice(0,8).toUpperCase()}`}</p>
    <p><b>Seller:</b> {item.customer_name||"—"} • {item.customer_phone||"—"}</p>
    <p><b>Location:</b> {item.customer_city||"—"}{item.budget?` • Expected ₹${Number(item.budget).toLocaleString("en-IN")}`:""}</p>
    <p style={{whiteSpace:"pre-wrap"}}>{item.message||"No additional details."}</p>
    <small>{item.previews?.length||0} private photo(s) • {item.status||"new"} • {item.created_at?new Date(item.created_at).toLocaleString("en-IN"):""}</small>
    <div className="row">
     {item.customer_phone&&<a className="call" href={wa(item.customer_phone,item)} target="_blank" rel="noreferrer">Contact Seller</a>}
     <button disabled={busy===item.id} onClick={()=>setStatus(item.id,"contacted")}>Mark Contacted</button>
     <button disabled={busy===item.id} onClick={()=>setStatus(item.id,"qualified")}>Qualify</button>
     <button disabled={busy===item.id} onClick={()=>setStatus(item.id,"closed")}>Close</button>
    </div>
   </article>)}</div>}
  </section>
  <section className="section dark"><div className="about"><h2>Privacy Guard</h2><p>Seller photos stay in the private seller-submission bucket. This screen does not publish them or create public inventory automatically. A reviewed vehicle must still go through the normal inventory/draft publication workflow.</p></div></section>
 </main>;
}
