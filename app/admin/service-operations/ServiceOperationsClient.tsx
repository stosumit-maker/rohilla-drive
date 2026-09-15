"use client";
import {useEffect,useState} from "react";
import {supabase} from "../../supabaseClient";

type ServiceRequest={
 id:string;customer_name:string;customer_phone:string;category:string;customer_location:string|null;vehicle_location:string|null;details:string|null;preferred_time:string|null;status:string;assigned_partner_id:string|null;created_at:string;
 partner_quote_amount:number|null;partner_quote_notes:string|null;quote_submitted_at:string|null;customer_approval_status:string;customer_approved_at:string|null;appointment_at:string|null;partner_eta:string|null;work_notes:string|null;work_started_at:string|null;completion_notes:string|null;completion_photo_paths:string[]|null;completed_at:string|null;
 partnerName?:string;partnerBusiness?:string;proof?:{path:string;url:string}[];
};
const statusLabel=(s:string)=>String(s||"").replace(/_/g," ").replace(/\b\w/g,x=>x.toUpperCase());

export default function ServiceOperationsClient(){
 const db=supabase();
 const [ready,setReady]=useState(false),[items,setItems]=useState<ServiceRequest[]>([]),[msg,setMsg]=useState("Checking administrator access…"),[busy,setBusy]=useState("");
 useEffect(()=>{gate()},[]);

 async function gate(){
  const {data:{session}}=await db.auth.getSession();if(!session){setMsg("Administrator sign-in is required.");return}
  const [{data:aal},{data:isAdmin}]=await Promise.all([db.auth.mfa.getAuthenticatorAssuranceLevel(),db.rpc("is_admin")]);
  if(aal?.currentLevel!=="aal2"||!isAdmin){setMsg("Administrator authentication is required.");return}
  setReady(true);await load();
 }

 async function load(){
  setMsg("Loading service operations…");
  const {data,error}=await db.from("service_requests").select("id,customer_name,customer_phone,category,customer_location,vehicle_location,details,preferred_time,status,assigned_partner_id,created_at,partner_quote_amount,partner_quote_notes,quote_submitted_at,customer_approval_status,customer_approved_at,appointment_at,partner_eta,work_notes,work_started_at,completion_notes,completion_photo_paths,completed_at").order("created_at",{ascending:false});
  if(error){setMsg(error.message);return}
  const partnerIds=[...new Set((data||[]).map((x:any)=>x.assigned_partner_id).filter(Boolean))] as string[];
  const profiles=partnerIds.length?(await db.from("profiles").select("id,name,business_name").in("id",partnerIds)).data||[]:[];
  const profileMap=new Map(profiles.map((p:any)=>[p.id,p]));
  const hydrated=await Promise.all((data||[]).map(async(row:any)=>{
   const p=profileMap.get(row.assigned_partner_id) as any;
   const proof:{path:string;url:string}[]=[];
   for(const path of row.completion_photo_paths||[]){const signed=await db.storage.from("service-job-photos").createSignedUrl(path,1800);if(signed.data?.signedUrl)proof.push({path,url:signed.data.signedUrl})}
   return {...row,partnerName:p?.name||"",partnerBusiness:p?.business_name||"",proof};
  }));
  setItems(hydrated as ServiceRequest[]);setMsg(hydrated.length?"Record customer approval only after the customer has actually confirmed the quote.":"No service requests yet.");
 }

 async function recordApproval(item:ServiceRequest,approved:boolean){
  if(!item.partner_quote_amount){setMsg("A partner quote is required before customer approval can be recorded.");return}
  if(approved&&!confirm(`Record customer approval for quote ₹${Number(item.partner_quote_amount).toLocaleString("en-IN")}?`))return;
  if(!approved&&!confirm("Record that the customer declined this quote?"))return;
  setBusy(item.id);
  const {error}=await db.from("service_requests").update({customer_approval_status:approved?"approved":"declined",customer_approved_at:approved?new Date().toISOString():null,status:approved?"approved":"quote_declined",updated_at:new Date().toISOString()}).eq("id",item.id).eq("status","quote_submitted");
  setBusy("");if(error){setMsg(error.message);return}setMsg(approved?"Customer approval recorded. Partner can schedule the appointment.":"Quote marked declined.");await load();
 }

 async function requestRequote(item:ServiceRequest){
  if(!confirm("Return this request to the partner for a revised quote?"))return;
  setBusy(item.id);const {error}=await db.from("service_requests").update({customer_approval_status:"pending",customer_approved_at:null,partner_quote_amount:null,partner_quote_notes:null,quote_submitted_at:null,status:"assigned",updated_at:new Date().toISOString()}).eq("id",item.id);setBusy("");
  if(error){setMsg(error.message);return}setMsg("Request returned for a revised quote.");await load();
 }

 const wa=(item:ServiceRequest)=>`https://wa.me/${item.customer_phone.replace(/\D/g,"")}?text=${encodeURIComponent(`ROHILLA DRIVE SERVICE REQUEST\n\nService: ${item.category}\n${item.partner_quote_amount?`Partner quote: ₹${Number(item.partner_quote_amount).toLocaleString("en-IN")}\n`:""}Please confirm whether you approve this quote and proposed service workflow.`)}`;

 if(!ready)return <main><section className="section"><h1>Service Operations</h1><p>{msg}</p><a href="/admin">Back to Dashboard</a></section></main>;
 return <main>
  <section className="hero" style={{paddingTop:36,paddingBottom:36}}><div className="heroText"><span>SERVICE CONTROL WORKFLOW</span><h1>Service Operations</h1><p>Coordinate partner quotes, customer approval, appointment progress and private completion proof.</p></div></section>
  <section className="section" style={{paddingTop:24}}><div className="head"><div><h2>Service Requests ({items.length})</h2><p>{msg}</p></div><button onClick={load}>Refresh</button></div>
   {items.length===0?<div className="notice">No service requests yet.</div>:<div className="grid">{items.map(item=><article className="application" key={item.id}>
    <div className="request-top"><div><label>{item.category}</label><h2>{item.customer_name}</h2></div><span className={`status ${item.status}`}>{statusLabel(item.status)}</span></div>
    <p><b>Customer:</b> {item.customer_name} • {item.customer_phone}</p>
    <p><b>Location:</b> {item.vehicle_location||item.customer_location||"—"}</p>
    {item.details&&<p><b>Request:</b> {item.details}</p>}
    <p><b>Assigned Partner:</b> {item.partnerBusiness||item.partnerName||"Not assigned"}</p>
    {item.partner_quote_amount!=null&&<div className="notice"><b>Partner Quote:</b> ₹{Number(item.partner_quote_amount).toLocaleString("en-IN")}{item.partner_quote_notes?` • ${item.partner_quote_notes}`:""}<br/><b>Customer approval:</b> {statusLabel(item.customer_approval_status||"pending")}</div>}
    {item.status==="quote_submitted"&&<div className="row"><a className="call" href={wa(item)} target="_blank" rel="noreferrer">Confirm with Customer</a><button disabled={busy===item.id} onClick={()=>recordApproval(item,true)}>Record Customer Approval</button><button disabled={busy===item.id} onClick={()=>recordApproval(item,false)}>Record Decline</button></div>}
    {item.customer_approval_status==="declined"&&<button disabled={busy===item.id} onClick={()=>requestRequote(item)}>Request Revised Quote</button>}
    {item.appointment_at&&<p><b>Appointment:</b> {new Date(item.appointment_at).toLocaleString("en-IN")}{item.partner_eta?` • ${item.partner_eta}`:""}</p>}
    {item.work_started_at&&<p><b>Work started:</b> {new Date(item.work_started_at).toLocaleString("en-IN")}{item.work_notes?` • ${item.work_notes}`:""}</p>}
    {item.completed_at&&<p><b>Completed:</b> {new Date(item.completed_at).toLocaleString("en-IN")}{item.completion_notes?` • ${item.completion_notes}`:""}</p>}
    {item.proof?.length?<div className="photo real swipeGallery">{item.proof.map((p,i)=><img key={p.path} src={p.url} alt={`Private completion proof ${i+1}`}/>)}</div>:null}
    <small>{item.proof?.length||0} private completion proof photo(s) • Created {new Date(item.created_at).toLocaleString("en-IN")}</small>
   </article>)}</div>}
  </section>
  <section className="section dark"><div className="about"><h2>Approval Guard</h2><p>Partner work cannot move to scheduling or work-in-progress through the structured RPCs until customer approval is recorded. Completion proof stays private and is never published as public vehicle media.</p></div></section>
 </main>;
}
