"use client";
import {useEffect,useState} from "react";
import {supabase} from "../../supabaseClient";

type Doc={id:string;document_type:string;document_label:string|null;storage_path:string;status:string;review_notes:string|null;expires_on:string|null;created_at:string;preview?:string};
const documentTypes=[
 ["identity","Owner / authorised person identity"],
 ["business_registration","Business registration / establishment proof"],
 ["address_proof","Business address proof"],
 ["tax_registration","GST / tax registration, if applicable"],
 ["category_authorization","Category-specific licence / agency / authorisation, if applicable"],
 ["insurance_certificate","Business insurance certificate, if applicable"],
 ["other","Other supporting business document"]
];
const regulatedHints=["Finance DSA","Insurance","Registered Vehicle Scrapping Facility","RC / RTO"];
const allowed=new Set(["application/pdf","image/jpeg","image/png","image/webp","image/heic","image/heif"]);
const ext=(file:File)=>file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g,"").slice(0,8)||"bin";

export default function PartnerKycClient(){
 const db=supabase();
 const [profile,setProfile]=useState<any>(null),[docs,setDocs]=useState<Doc[]>([]),[msg,setMsg]=useState("Checking partner account…"),[busy,setBusy]=useState(false);
 const [type,setType]=useState("identity"),[label,setLabel]=useState(""),[expiry,setExpiry]=useState(""),[file,setFile]=useState<File|null>(null);
 useEffect(()=>{load()},[]);
 async function load(){
  const {data:{session}}=await db.auth.getSession();if(!session){setMsg("Sign in to your Partner Workspace first.");return}
  const {data:p,error:pErr}=await db.from("profiles").select("id,role,name,business_name,service_categories,city,active,kyc_status,kyc_review_notes,kyc_submitted_at,kyc_verified_at").eq("id",session.user.id).single();
  if(pErr||p?.role!=="partner"){setMsg(pErr?.message||"A partner applicant account is required.");return}setProfile(p);
  const {data,error}=await db.from("partner_kyc_documents").select("id,document_type,document_label,storage_path,status,review_notes,expires_on,created_at").eq("profile_id",session.user.id).order("created_at",{ascending:false});
  if(error){setMsg(error.message);return}
  const hydrated=await Promise.all((data||[]).map(async(d:any)=>{const signed=await db.storage.from("partner-kyc-documents").createSignedUrl(d.storage_path,1200);return {...d,preview:signed.data?.signedUrl||""}}));
  setDocs(hydrated as Doc[]);setMsg(p.kyc_status==="verified"?"KYC verified.":p.kyc_review_notes||"Upload clear business documents, then submit them for ROHILLA DRIVE review.");
 }
 async function upload(e:React.FormEvent){
  e.preventDefault();if(!profile||!file)return;if(!allowed.has(file.type)){setMsg("Use PDF, JPG, PNG, WEBP, HEIC or HEIF only.");return}if(file.size>10*1024*1024){setMsg("Each document must be 10 MB or smaller.");return}
  setBusy(true);setMsg("Uploading privately…");const path=`${profile.id}/${Date.now()}-${crypto.randomUUID()}.${ext(file)}`;
  const up=await db.storage.from("partner-kyc-documents").upload(path,file,{upsert:false,contentType:file.type});if(up.error){setBusy(false);setMsg(up.error.message);return}
  const ins=await db.from("partner_kyc_documents").insert({profile_id:profile.id,document_type:type,document_label:label.trim()||null,storage_path:path,expires_on:expiry||null});
  if(ins.error){await db.storage.from("partner-kyc-documents").remove([path]);setBusy(false);setMsg(ins.error.message);return}
  setFile(null);setLabel("");setExpiry("");setBusy(false);setMsg("Document uploaded privately.");await load();
 }
 async function remove(doc:Doc){if(doc.status==="verified"||!confirm("Remove this KYC document?"))return;setBusy(true);const del=await db.from("partner_kyc_documents").delete().eq("id",doc.id);if(!del.error)await db.storage.from("partner-kyc-documents").remove([doc.storage_path]);setBusy(false);if(del.error){setMsg(del.error.message);return}await load()}
 async function submit(){setBusy(true);const {data,error}=await db.rpc("submit_partner_kyc");setBusy(false);if(error||!data){setMsg(error?.message||"KYC could not be submitted.");return}setMsg("KYC submitted for review.");await load()}
 const category=String(profile?.service_categories||"");const mayNeedAuthorisation=regulatedHints.some(x=>category.toLowerCase().includes(x.toLowerCase()));
 if(!profile)return <main><section className="section"><h1>Partner KYC</h1><p>{msg}</p><a className="call" href="/partner">Partner Sign In</a></section></main>;
 return <main>
  <section className="hero" style={{paddingTop:36,paddingBottom:36}}><div className="heroText"><span>PRIVATE BUSINESS VERIFICATION</span><h1>Partner KYC & Documents</h1><p>{profile.business_name||profile.name} • {profile.service_categories||"Automotive Partner"}</p></div></section>
  <section className="section" style={{paddingTop:24}}><div className="notice"><b>Status:</b> {String(profile.kyc_status||"not_submitted").replace(/_/g," ").toUpperCase()}. {msg}</div>
   <div className="grid"><article className="application"><h2>Recommended documents</h2><p>Upload an authorised-person identity document and business registration/establishment proof. Add address or tax proof where applicable.</p>{mayNeedAuthorisation&&<p><b>Your selected category may require a licence, agency appointment, registration or other authorisation.</b> Upload the applicable current document. ROHILLA DRIVE review does not replace any statutory requirement.</p>}<p>Documents stay private and are used only for business verification and operational compliance review.</p></article>
   <article className="application"><h2>Upload document</h2><form className="adminForm" onSubmit={upload}><select value={type} onChange={e=>setType(e.target.value)}>{documentTypes.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select><input placeholder="Document label / number description (optional)" value={label} onChange={e=>setLabel(e.target.value)}/><input type="date" aria-label="Expiry date if applicable" value={expiry} onChange={e=>setExpiry(e.target.value)}/><label className="upload">Private document<input required type="file" accept="application/pdf,image/jpeg,image/png,image/webp,image/heic,image/heif" onChange={e=>setFile(e.target.files?.[0]||null)}/></label><button disabled={busy||!file}>{busy?"Uploading…":"Upload Private Document"}</button></form></article></div>
  </section>
  <section className="section"><div className="head"><div><h2>Your KYC Documents ({docs.length})</h2><p>At least two documents are required before submitting for review.</p></div></div>{docs.length===0?<div className="notice">No KYC documents uploaded yet.</div>:<div className="grid">{docs.map(doc=><article className="application" key={doc.id}><label>{documentTypes.find(x=>x[0]===doc.document_type)?.[1]||doc.document_type}</label><h3>{doc.document_label||"Supporting document"}</h3><p><b>Status:</b> {doc.status.toUpperCase()}</p>{doc.expires_on&&<p><b>Expiry:</b> {doc.expires_on}</p>}{doc.review_notes&&<p><b>Review note:</b> {doc.review_notes}</p>}<div className="row">{doc.preview&&<a className="call" href={doc.preview} target="_blank" rel="noreferrer">View Private File</a>}{doc.status!=="verified"&&<button disabled={busy} onClick={()=>remove(doc)}>Remove</button>}</div></article>)}</div>}
   {profile.kyc_status!=="verified"&&<div className="row" style={{marginTop:20}}><button disabled={busy||docs.length<2} onClick={submit}>{busy?"Submitting…":profile.kyc_status==="needs_changes"?"Resubmit KYC":"Submit KYC for Review"}</button></div>}
  </section>
 </main>;
}
