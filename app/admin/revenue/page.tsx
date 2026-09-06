"use client";
import {useEffect,useMemo,useState} from "react";
import {supabase} from "../../supabaseClient";

type Revenue={id:string;source_type:string;title:string;lead_id?:string|null;service_request_id?:string|null;deal_room_id?:string|null;vehicle_id?:string|null;counterparty_id?:string|null;expected_fee?:number|null;realized_fee?:number|null;status:string;notes?:string|null;created_at:string};
type Lead={id:string;customer_name:string;requirement?:string|null;enquiry_type?:string|null;status:string};
type Service={id:string;customer_name:string;category:string;status:string};
type Vehicle={id:string;brand:string;model:string;variant?:string|null;year?:number|null};
type Profile={id:string;name?:string|null;business_name?:string|null;role?:string|null};

const sourceLabels:any={used_vehicle:"Used / Pre-Owned Deal",new_vehicle:"New Vehicle Referral",inspection:"Inspection",service:"Service Job",finance_referral:"Finance Referral",insurance_referral:"Insurance Referral",transport:"Transport / Logistics",verification:"Verification",other:"Other"};
const statuses=["potential","agreed","invoiced","received","cancelled"];
const money=(n:any)=>`₹${Number(n||0).toLocaleString("en-IN",{maximumFractionDigits:0})}`;

export default function RevenuePage(){
 const db=supabase();
 const [ready,setReady]=useState(false),[msg,setMsg]=useState("Checking Admin access…"),[events,setEvents]=useState<Revenue[]>([]),[leads,setLeads]=useState<Lead[]>([]),[services,setServices]=useState<Service[]>([]),[vehicles,setVehicles]=useState<Vehicle[]>([]),[profiles,setProfiles]=useState<Profile[]>([]);
 const [form,setForm]=useState<any>({source_type:"used_vehicle",status:"potential"});
 useEffect(()=>{gate()},[]);
 async function gate(){const {data:{session}}=await db.auth.getSession();if(!session){setMsg("Admin login required.");return}const {data:aal}=await db.auth.mfa.getAuthenticatorAssuranceLevel();if(aal?.currentLevel!=="aal2"){setMsg("Admin Authenticator verification required. Open Control Room first.");return}const {data:isAdmin}=await db.rpc("is_admin");if(!isAdmin){setMsg("Admin access required.");return}setReady(true);setMsg("");await load()}
 async function load(){const [r,l,s,v,p]=await Promise.all([
  db.from("revenue_events").select("*").order("created_at",{ascending:false}),
  db.from("leads").select("id,customer_name,requirement,enquiry_type,status").order("created_at",{ascending:false}).limit(60),
  db.from("service_requests").select("id,customer_name,category,status").order("created_at",{ascending:false}).limit(60),
  db.from("vehicles").select("id,brand,model,variant,year").order("created_at",{ascending:false}).limit(100),
  db.from("profiles").select("id,name,business_name,role").in("role",["dealer","partner"]).eq("active",true).limit(200)
 ]);setEvents((r.data||[]) as Revenue[]);setLeads((l.data||[]) as Lead[]);setServices((s.data||[]) as Service[]);setVehicles((v.data||[]) as Vehicle[]);setProfiles((p.data||[]) as Profile[]);if(r.error)setMsg(r.error.message)}
 const kpi=useMemo(()=>{const live=events.filter(x=>x.status!=="cancelled");return {potential:live.filter(x=>x.status!=="received").reduce((a,x)=>a+Number(x.expected_fee||0),0),received:events.filter(x=>x.status==="received").reduce((a,x)=>a+Number(x.realized_fee||x.expected_fee||0),0),agreed:events.filter(x=>x.status==="agreed"||x.status==="invoiced").reduce((a,x)=>a+Number(x.expected_fee||0),0),count:live.length}},[events]);
 function prefillLead(l:Lead){setForm({source_type:l.enquiry_type?.includes("new")?"new_vehicle":"used_vehicle",status:"potential",title:`${l.customer_name} • ${l.requirement||l.enquiry_type||"Vehicle opportunity"}`,lead_id:l.id});window.scrollTo({top:0,behavior:"smooth"})}
 function prefillService(s:Service){setForm({source_type:s.category?.toLowerCase().includes("inspection")?"inspection":"service",status:"potential",title:`${s.customer_name} • ${s.category}`,service_request_id:s.id});window.scrollTo({top:0,behavior:"smooth"})}
 async function add(e:React.FormEvent){e.preventDefault();if(!form.title?.trim())return;setMsg("Saving opportunity…");const payload:any={source_type:form.source_type,title:form.title.trim(),status:form.status||"potential",notes:form.notes?.trim()||null,lead_id:form.lead_id||null,service_request_id:form.service_request_id||null,deal_room_id:form.deal_room_id||null,vehicle_id:form.vehicle_id||null,counterparty_id:form.counterparty_id||null,expected_fee:form.expected_fee?Number(form.expected_fee):null};const {error}=await db.from("revenue_events").insert(payload);if(error){setMsg(error.message);return}setForm({source_type:"used_vehicle",status:"potential"});setMsg("Revenue opportunity saved ✓");await load()}
 async function save(row:Revenue){const {error}=await db.from("revenue_events").update({status:row.status,expected_fee:row.expected_fee==null?null:Number(row.expected_fee),realized_fee:row.realized_fee==null?null:Number(row.realized_fee),notes:row.notes||null,updated_at:new Date().toISOString()}).eq("id",row.id);setMsg(error?error.message:"Revenue record updated ✓");if(!error)await load()}
 if(!ready)return <main className="section"><h1>Revenue Pipeline</h1><p>{msg}</p><a className="call" href="/admin">Open Admin Control Room</a></main>;
 return <main>
  <section className="section" style={{paddingTop:28}}><div className="head"><div><h1>₹ Revenue Pipeline</h1><p>Track income opportunities before spending on paid AI or ads. Amounts stay optional until a commercial fee is actually agreed.</p></div><button onClick={load}>Refresh</button></div>
   <div className="stats-grid"><div className="stat-card"><strong>{kpi.count}</strong><span>Open Opportunities</span></div><div className="stat-card"><strong>{money(kpi.potential)}</strong><span>Potential / Outstanding</span></div><div className="stat-card"><strong>{money(kpi.agreed)}</strong><span>Agreed / Invoiced</span></div><div className="stat-card"><strong>{money(kpi.received)}</strong><span>Received</span></div></div>
   <div className="card" style={{marginTop:18}}><div className="body"><h2>Add Income Opportunity</h2><form className="adminForm" onSubmit={add}>
    <select value={form.source_type} onChange={e=>setForm({...form,source_type:e.target.value})}>{Object.entries(sourceLabels).map(([k,v])=><option key={k} value={k}>{String(v)}</option>)}</select>
    <input required placeholder="Opportunity / deal title" value={form.title||""} onChange={e=>setForm({...form,title:e.target.value})}/>
    <input type="number" min="0" step="1" placeholder="Expected Rohilla fee ₹ (optional)" value={form.expected_fee||""} onChange={e=>setForm({...form,expected_fee:e.target.value})}/>
    <select value={form.vehicle_id||""} onChange={e=>setForm({...form,vehicle_id:e.target.value})}><option value="">Related vehicle (optional)</option>{vehicles.map(v=><option key={v.id} value={v.id}>{v.year||""} {v.brand} {v.model} {v.variant||""}</option>)}</select>
    <select value={form.counterparty_id||""} onChange={e=>setForm({...form,counterparty_id:e.target.value})}><option value="">Dealer / Partner (optional)</option>{profiles.map(p=><option key={p.id} value={p.id}>{p.business_name||p.name||p.id} • {p.role}</option>)}</select>
    <textarea placeholder="Commercial notes / next action" value={form.notes||""} onChange={e=>setForm({...form,notes:e.target.value})}/>
    <button>Save Opportunity</button>
   </form><p>{msg}</p></div></div>
  </section>
  <section className="section" style={{paddingTop:10}}><h2>Pipeline</h2>{events.length===0?<p>No revenue opportunities logged yet. Use a real lead/service below to start tracking.</p>:<div className="request-list">{events.map((r,i)=><article className="request-card" key={r.id}><div className="request-top"><div><label>{sourceLabels[r.source_type]||r.source_type}</label><h2>{r.title}</h2></div><span className={`status ${r.status}`}>{r.status}</span></div><div className="row"><input type="number" min="0" placeholder="Expected ₹" value={r.expected_fee??""} onChange={e=>setEvents(old=>old.map((x,n)=>n===i?{...x,expected_fee:e.target.value===""?null:Number(e.target.value)}:x))}/><input type="number" min="0" placeholder="Received ₹" value={r.realized_fee??""} onChange={e=>setEvents(old=>old.map((x,n)=>n===i?{...x,realized_fee:e.target.value===""?null:Number(e.target.value)}:x))}/><select value={r.status} onChange={e=>setEvents(old=>old.map((x,n)=>n===i?{...x,status:e.target.value}:x))}>{statuses.map(s=><option key={s}>{s}</option>)}</select></div><textarea placeholder="Notes" value={r.notes||""} onChange={e=>setEvents(old=>old.map((x,n)=>n===i?{...x,notes:e.target.value}:x))}/><button onClick={()=>save(events[i])}>Save Update</button></article>)}</div>}</section>
  <section className="section" style={{paddingTop:10}}><h2>Turn Existing Demand Into Trackable Income</h2><div className="grid"><div className="card"><div className="body"><h3>Recent Customer Leads</h3>{leads.slice(0,12).map(l=><div key={l.id} style={{padding:"9px 0",borderBottom:"1px solid #e5e7eb"}}><b>{l.customer_name}</b><small>{l.requirement||l.enquiry_type||"Vehicle enquiry"} • {l.status}</small><button onClick={()=>prefillLead(l)}>Track Revenue</button></div>)}</div></div><div className="card"><div className="body"><h3>Recent Service Requests</h3>{services.slice(0,12).map(s=><div key={s.id} style={{padding:"9px 0",borderBottom:"1px solid #e5e7eb"}}><b>{s.customer_name}</b><small>{s.category} • {s.status}</small><button onClick={()=>prefillService(s)}>Track Revenue</button></div>)}</div></div></div></section>
 </main>
}
