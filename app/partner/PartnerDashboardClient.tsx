"use client";
import {useEffect,useState} from "react";
import {supabase} from "../supabaseClient";
import LegalConsent from "../components/LegalConsent";
import {partnerCategoryLabels} from "../lib/businessCategories";

type Request={
 id:string;customer_name:string;category:string;vehicle_location:string|null;customer_location:string|null;details:string|null;preferred_time:string|null;status:string;created_at:string;
 vehicle?:{brand:string;model:string;variant:string|null;year:number|null}|null;
 partner_quote_amount:number|null;partner_quote_notes:string|null;quote_submitted_at:string|null;customer_approval_status:string;
 appointment_at:string|null;partner_eta:string|null;work_notes:string|null;work_started_at:string|null;completion_notes:string|null;completion_photo_paths:string[]|null;completed_at:string|null;
};
const statusLabel=(s:string)=>s.replace(/_/g," ").replace(/\b\w/g,x=>x.toUpperCase());
const filterStatuses=["assigned","quote_submitted","approved","scheduled","in_progress","completed","cancelled"];
const allowedProofTypes=new Set(["image/jpeg","image/png","image/webp","image/heic","image/heif"]);
const extensionFor=(file:File)=>({"image/jpeg":"jpg","image/png":"png","image/webp":"webp","image/heic":"heic","image/heif":"heif"}[file.type]||"jpg");

export default function PartnerPage(){
 const db=supabase();
 const [session,setSession]=useState<any>(null),[partner,setPartner]=useState<any>(null),[requests,setRequests]=useState<Request[]>([]),[loading,setLoading]=useState(true),[message,setMessage]=useState(""),[filter,setFilter]=useState("all"),[mode,setMode]=useState<"login"|"signup"|"forgot">("login");
 const [forms,setForms]=useState<Record<string,any>>({});
 const [proofFiles,setProofFiles]=useState<Record<string,File[]>>({});
 const [busyId,setBusyId]=useState("");
 useEffect(()=>{start()},[]);

 const form=(id:string)=>forms[id]||{};
 const patch=(id:string,key:string,value:any)=>setForms(old=>({...old,[id]:{...(old[id]||{}),[key]:value}}));

 async function start(){setLoading(true);const {data:{session}}=await db.auth.getSession();if(!session){setLoading(false);return}setSession(session);const {data:profile}=await db.from("profiles").select("*").eq("id",session.user.id).single();setPartner(profile);if(profile?.role!=="partner"){setLoading(false);setMessage("This account does not have partner access.");return}if(!profile.active){setLoading(false);setMessage("Your partner application is under review.");return}await loadRequests();setLoading(false)}
 async function loadRequests(){const {data,error}=await db.rpc("get_partner_service_requests");if(error){setMessage(error.message);return}setRequests((data||[]).map((item:any)=>({...item,vehicle:item.vehicle_brand?{brand:item.vehicle_brand,model:item.vehicle_model,variant:item.vehicle_variant,year:item.vehicle_year}:null})))}
 async function login(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setMessage("Signing in…");const x=new FormData(e.currentTarget);const {data,error}=await db.auth.signInWithPassword({email:String(x.get("email")),password:String(x.get("password"))});if(error){setMessage(error.message);return}setSession(data.session);await start()}
 async function signup(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setMessage("Submitting partner application…");const x=new FormData(e.currentTarget);const name=String(x.get("name")),mobile=String(x.get("mobile")),business=String(x.get("business_name")),city=String(x.get("city")),address=String(x.get("address")),category=String(x.get("category")),applicationMessage=String(x.get("message")||"");const {data,error}=await db.auth.signUp({email:String(x.get("email")),password:String(x.get("password")),options:{data:{network_role:"partner",application_source:"trusted_signup_v2",name,phone:mobile,business_name:business,address,city,service_categories:category,application_message:applicationMessage}}});if(error){setMessage(error.message);return}if(!data.user){setMessage("Account could not be created.");return}const wa=`ROHILLA DRIVE PARTNER APPLICATION\n\nBusiness: ${business}\nContact: ${name}\nMobile: ${mobile}\nCategory: ${category}\nCity: ${city}\n\nMy partner application has been submitted for review.`;window.location.href=`https://wa.me/917015260003?text=${encodeURIComponent(wa)}`}
 async function forgot(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setMessage("Sending reset link…");const email=String(new FormData(e.currentTarget).get("email"));const {error}=await db.auth.resetPasswordForEmail(email,{redirectTo:`${window.location.origin}/reset-password`});setMessage(error?error.message:"Password reset link sent to your email.")}
 async function logout(){await db.auth.signOut();setSession(null);setPartner(null);setRequests([])}

 async function submitQuote(request:Request){
  const amount=Number(form(request.id).quote_amount||0);if(!amount){setMessage("Enter the service quote amount first.");return}
  setBusyId(request.id);const {data,error}=await db.rpc("submit_partner_service_quote",{p_request_id:request.id,p_amount:amount,p_notes:form(request.id).quote_notes||null});setBusyId("");
  if(error||!data){setMessage(error?.message||"Quote could not be submitted.");return}setMessage("Quote submitted for customer approval.");await loadRequests();
 }
 async function scheduleRequest(request:Request){
  const raw=form(request.id).appointment_at;if(!raw){setMessage("Choose an appointment date and time.");return}
  setBusyId(request.id);const {data,error}=await db.rpc("schedule_partner_service_request",{p_request_id:request.id,p_appointment_at:new Date(raw).toISOString(),p_eta:form(request.id).eta||null});setBusyId("");
  if(error||!data){setMessage(error?.message||"Appointment could not be scheduled.");return}setMessage("Appointment scheduled.");await loadRequests();
 }
 async function startWork(request:Request){
  setBusyId(request.id);const {data,error}=await db.rpc("start_partner_service_work",{p_request_id:request.id,p_notes:form(request.id).work_notes||null});setBusyId("");
  if(error||!data){setMessage(error?.message||"Work could not be started.");return}setMessage("Work marked in progress.");await loadRequests();
 }
 function chooseProof(requestId:string,list:File[]){
  const files=list.slice(0,8);if(list.length>8){setMessage("Use up to 8 completion photos.");return}if(files.some(file=>!allowedProofTypes.has(file.type))){setMessage("Completion proof must be JPG, PNG, WEBP, HEIC or HEIF images.");return}if(files.some(file=>file.size>10*1024*1024)){setMessage("Each completion photo must be 10 MB or smaller.");return}setProofFiles(old=>({...old,[requestId]:files}));
 }
 async function completeWork(request:Request){
  const files=proofFiles[request.id]||[];if(!files.length){setMessage("Add at least one completion / work proof photo.");return}
  setBusyId(request.id);setMessage("Uploading private completion proof…");const paths:string[]=[];
  for(let i=0;i<files.length;i++){
   const path=`${request.id}/${Date.now()}-${i}-${crypto.randomUUID()}.${extensionFor(files[i])}`;
   const up=await db.storage.from("service-job-photos").upload(path,files[i],{upsert:false,contentType:files[i].type});
   if(up.error){setBusyId("");setMessage(up.error.message);return}paths.push(path);
  }
  const {data,error}=await db.rpc("complete_partner_service_work",{p_request_id:request.id,p_notes:form(request.id).completion_notes||null,p_photo_paths:paths});setBusyId("");
  if(error||!data){setMessage(error?.message||"Job could not be completed.");return}setMessage("Job completed with private proof attached.");setProofFiles(old=>({...old,[request.id]:[]}));await loadRequests();
 }
 async function cancelRequest(request:Request){if(!confirm("Cancel this assigned service request?"))return;setBusyId(request.id);const {data,error}=await db.rpc("update_partner_service_request_status",{p_request_id:request.id,p_status:"cancelled"});setBusyId("");if(error||!data){setMessage(error?.message||"Request could not be cancelled.");return}setMessage("Request cancelled.");await loadRequests()}

 const filtered=filter==="all"?requests:requests.filter(r=>r.status===filter);
 if(loading)return <main className="section"><h2>Loading Partner Workspace…</h2></main>;
 if(!session||!partner||partner.role!=="partner"||!partner.active)return <main><div className="auth"><h1>ROHILLA DRIVE</h1><h2>Partner Workspace</h2><p>Secure access for approved automotive service, mobility, logistics and support businesses participating in the ROHILLA DRIVE network.</p><div className="notice">Partner access is subject to review and approval. Regulated activities must be performed only by businesses holding the required licences or authorisations.</div>{mode==="login"&&<><form onSubmit={login}><input name="email" type="email" placeholder="Partner email" required/><input name="password" type="password" placeholder="Password" required/><button>Sign In</button></form><button className="secondary" onClick={()=>{setMode("signup");setMessage("")}}>Apply for Partner Access</button><button className="secondary" onClick={()=>{setMode("forgot");setMessage("")}}>Forgot Password?</button></>}{mode==="signup"&&<form onSubmit={signup}><input name="name" placeholder="Contact name" required/><input name="business_name" placeholder="Business name" required/><input name="mobile" placeholder="Mobile" required/><input name="email" type="email" placeholder="Email" required/><input name="password" type="password" minLength={6} placeholder="Create password" required/><select name="category" defaultValue="" required><option value="" disabled>Select business category</option>{partnerCategoryLabels.map(category=><option key={category} value={category}>{category}</option>)}</select><input name="city" placeholder="City / service area" required/><input name="address" placeholder="Business address" required/><textarea name="message" placeholder="Services, experience, coverage and relevant licence / registration details"/><LegalConsent regulated/><button>Submit Partner Application</button><button type="button" className="secondary" onClick={()=>setMode("login")}>Back to Sign In</button></form>}{mode==="forgot"&&<form onSubmit={forgot}><input name="email" type="email" placeholder="Registered email" required/><button>Send Reset Link</button><button type="button" className="secondary" onClick={()=>setMode("login")}>Back to Sign In</button></form>}<p>{message}</p>{partner&&!partner.active&&<button onClick={logout}>Sign Out</button>}<a href="/">Public Website</a></div></main>;

 return <main><header><div className="brand"><b>ROHILLA DRIVE</b><small>Partner Workspace</small></div><button className="call" onClick={logout}>Sign Out</button></header>
  <section className="section"><div className="partner-head"><div><label>WORKSPACE OVERVIEW</label><h1>Welcome{partner?.name?`, ${partner.name}`:""}</h1><p>Manage assigned customer requests through a controlled quote, approval, appointment, work and completion workflow.</p></div><button className="secondary" onClick={loadRequests}>Refresh</button></div>{message&&<div className="notice">{message}</div>}
   <div className="stats-grid"><div className="stat-card"><strong>{requests.length}</strong><span>Total Requests</span></div><div className="stat-card"><strong>{requests.filter(r=>["assigned","quote_submitted"].includes(r.status)).length}</strong><span>Awaiting Action / Approval</span></div><div className="stat-card"><strong>{requests.filter(r=>["approved","scheduled","in_progress"].includes(r.status)).length}</strong><span>Active</span></div><div className="stat-card"><strong>{requests.filter(r=>r.status==="completed").length}</strong><span>Completed</span></div></div>
   <div className="filter-row">{["all",...filterStatuses].map(item=><button key={item} className={filter===item?"filter active":"filter"} onClick={()=>setFilter(item)}>{item==="all"?"All":statusLabel(item)}</button>)}</div>
   <div className="request-list">{filtered.length===0?<div className="empty-card"><h2>No assigned requests</h2><p>Requests assigned to your business will appear here.</p></div>:filtered.map(request=><article className="request-card" key={request.id}>
    <div className="request-top"><div><label>{request.category}</label><h2>{request.customer_name}</h2></div><span className={`status ${request.status}`}>{statusLabel(request.status)}</span></div>
    {request.vehicle&&<div className="vehicle-box"><strong>{request.vehicle.brand} {request.vehicle.model}</strong><span>{request.vehicle.variant||""}{request.vehicle.year?` • ${request.vehicle.year}`:""}</span></div>}
    <div className="request-details"><p><b>Customer:</b> {request.customer_name}</p><p><b>Phone:</b> Protected <small>• ROHILLA DRIVE controls customer contact release</small></p>{request.customer_location&&<p><b>Customer Location:</b> {request.customer_location}</p>}{request.vehicle_location&&<p><b>Vehicle Location:</b> {request.vehicle_location}</p>}{request.preferred_time&&<p><b>Preferred Time:</b> {request.preferred_time}</p>}{request.details&&<p><b>Details:</b> {request.details}</p>}</div>

    {["assigned","accepted"].includes(request.status)&&<div className="application"><h3>1. Submit Quote</h3><input type="number" min="0" placeholder="Quote amount ₹" value={form(request.id).quote_amount||""} onChange={e=>patch(request.id,"quote_amount",e.target.value)}/><textarea placeholder="Scope, exclusions, parts, warranty or quote notes" value={form(request.id).quote_notes||""} onChange={e=>patch(request.id,"quote_notes",e.target.value)}/><button disabled={busyId===request.id} onClick={()=>submitQuote(request)}>Submit Quote for Approval</button></div>}

    {request.status==="quote_submitted"&&<div className="notice"><b>Quote submitted:</b> ₹{Number(request.partner_quote_amount||0).toLocaleString("en-IN")} {request.partner_quote_notes?`• ${request.partner_quote_notes}`:""}<br/>Waiting for ROHILLA DRIVE to record the customer's approval or decline.</div>}

    {request.customer_approval_status==="approved"&&request.status==="approved"&&<div className="application"><h3>2. Schedule Appointment</h3><input type="datetime-local" value={form(request.id).appointment_at||""} onChange={e=>patch(request.id,"appointment_at",e.target.value)}/><input placeholder="ETA / arrival note" value={form(request.id).eta||""} onChange={e=>patch(request.id,"eta",e.target.value)}/><button disabled={busyId===request.id} onClick={()=>scheduleRequest(request)}>Confirm Appointment</button></div>}

    {request.status==="scheduled"&&<div className="application"><h3>3. Start Work</h3>{request.appointment_at&&<p><b>Appointment:</b> {new Date(request.appointment_at).toLocaleString("en-IN")}{request.partner_eta?` • ${request.partner_eta}`:""}</p>}<textarea placeholder="Initial inspection / work-start notes" value={form(request.id).work_notes||""} onChange={e=>patch(request.id,"work_notes",e.target.value)}/><button disabled={busyId===request.id} onClick={()=>startWork(request)}>Start Work</button></div>}

    {request.status==="in_progress"&&<div className="application"><h3>4. Complete Job with Proof</h3><textarea placeholder="Work completed, parts used, observations and handover notes" value={form(request.id).completion_notes||""} onChange={e=>patch(request.id,"completion_notes",e.target.value)}/><label className="upload">Completion / Work Proof Photos<input multiple accept="image/jpeg,image/png,image/webp,image/heic,image/heif" type="file" onChange={e=>chooseProof(request.id,Array.from(e.target.files||[]))}/></label>{(proofFiles[request.id]||[]).length>0&&<small>{proofFiles[request.id].length} private proof photo(s) selected</small>}<button disabled={busyId===request.id} onClick={()=>completeWork(request)}>Mark Completed</button></div>}

    {request.status==="completed"&&<div className="notice"><b>Completed:</b> {request.completed_at?new Date(request.completed_at).toLocaleString("en-IN"):"Recorded"}{request.completion_notes?` • ${request.completion_notes}`:""}<br/>{request.completion_photo_paths?.length||0} private completion proof photo(s) attached.</div>}
    {request.customer_approval_status==="declined"&&<div className="notice">Customer declined the submitted quote. Do not start work unless a new approved workflow is created.</div>}
    {!['completed','cancelled'].includes(request.status)&&<div className="request-actions"><button className="secondary" onClick={()=>setMessage("Customer contact is protected. ROHILLA DRIVE will coordinate the connection when the workflow permits it.")}>Request Customer Contact</button><button className="secondary" disabled={busyId===request.id} onClick={()=>cancelRequest(request)}>Cancel Request</button></div>}
   </article>)}</div>
  </section>
 </main>;
}
