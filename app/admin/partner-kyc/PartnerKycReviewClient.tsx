"use client";
import {useEffect,useState} from "react";
import {supabase} from "../../supabaseClient";

type Doc={id:string;profile_id:string;document_type:string;document_label:string|null;storage_path:string;status:string;review_notes:string|null;expires_on:string|null;created_at:string;preview?:string};
type Partner={id:string;name:string|null;business_name:string|null;phone:string|null;city:string|null;service_categories:string|null;active:boolean|null;kyc_status:string;kyc_review_notes:string|null;kyc_submitted_at:string|null;kyc_verified_at:string|null;docs?:Doc[]};
const label=(v:string)=>v.replace(/_/g," ").replace(/\b\w/g,x=>x.toUpperCase());

export default function PartnerKycReviewClient(){
 const db=supabase();
 const [ready,setReady]=useState(false),[partners,setPartners]=useState<Partner[]>([]),[msg,setMsg]=useState("Checking administrator access…"),[busy,setBusy]=useState("");
 useEffect(()=>{gate()},[]);
 async function gate(){const {data:{session}}=await db.auth.getSession();if(!session){setMsg("Administrator sign-in is required.");return}const [{data:aal},{data:isAdmin}]=await Promise.all([db.auth.mfa.getAuthenticatorAssuranceLevel(),db.rpc("is_admin")]);if(aal?.currentLevel!=="aal2"||!isAdmin){setMsg("Administrator authentication is required.");return}setReady(true);await load()}
 async function load(){
  setMsg("Loading partner KYC…");
  const {data:p,error:pErr}=await db.from("profiles").select("id,name,business_name,phone,city,service_categories,active,kyc_status,kyc_review_notes,kyc_submitted_at,kyc_verified_at").eq("role","partner").order("created_at",{ascending:false});if(pErr){setMsg(pErr.message);return}
  const ids=(p||[]).map((x:any)=>x.id);const {data:d,error:dErr}=ids.length?await db.from("partner_kyc_documents").select("id,profile_id,document_type,document_label,storage_path,status,review_notes,expires_on,created_at").in("profile_id",ids):{data:[],error:null} as any;if(dErr){setMsg(dErr.message);return}
  const docs=await Promise.all((d||[]).map(async(x:any)=>{const signed=await db.storage.from("partner-kyc-documents").createSignedUrl(x.storage_path,1200);return {...x,preview:signed.data?.signedUrl||""}}));
  const grouped=new Map<string,Doc[]>();for(const doc of docs){const arr=grouped.get(doc.profile_id)||[];arr.push(doc);grouped.set(doc.profile_id,arr)}
  setPartners((p||[]).map((x:any)=>({...x,docs:grouped.get(x.id)||[]})));setMsg((p||[]).length?"Verify documents only after checking the actual file and any category-specific authorisation that applies.":"No partner applicants yet.");
 }
 async function reviewDoc(doc:Doc,status:"verified"|"rejected"){
  const note=status==="rejected"?prompt("Reason / correction required for this document:",doc.review_notes||"")||"Document requires correction.":null;
  setBusy(doc.id);const {error}=await db.from("partner_kyc_documents").update({status,review_notes:note,updated_at:new Date().toISOString()}).eq("id",doc.id);setBusy("");if(error){setMsg(error.message);return}await load()
 }
 async function verifyPartner(partner:Partner){
  const docs=partner.docs||[];if(docs.length<2){setMsg("At least two KYC documents are required.");return}if(docs.some(d=>d.status!=="verified")){setMsg("Verify every uploaded KYC document before verifying the partner KYC.");return}if(!confirm(`Mark KYC verified for ${partner.business_name||partner.name||"this partner"}?`))return;
  setBusy(partner.id);const {error}=await db.from("profiles").update({kyc_status:"verified",kyc_review_notes:null,kyc_verified_at:new Date().toISOString()}).eq("id",partner.id).eq("role","partner");setBusy("");if(error){setMsg(error.message);return}setMsg("Partner KYC verified. The business application can now be approved separately.");await load()
 }
 async function requestChanges(partner:Partner){const note=prompt("What must the partner correct or upload?",partner.kyc_review_notes||"");if(!note)return;setBusy(partner.id);const {error}=await db.from("profiles").update({kyc_status:"needs_changes",kyc_review_notes:note,kyc_verified_at:null}).eq("id",partner.id).eq("role","partner");setBusy("");if(error){setMsg(error.message);return}setMsg("KYC changes requested.");await load()}
 if(!ready)return <main><section className="section"><h1>Partner KYC Review</h1><p>{msg}</p><a href="/admin">Back to Dashboard</a></section></main>;
 return <main><section className="hero" style={{paddingTop:36,paddingBottom:36}}><div className="heroText"><span>PRIVATE BUSINESS VERIFICATION</span><h1>Partner KYC Review</h1><p>Review business identity and applicable authorisation documents before activating a service partner.</p></div></section>
  <section className="section" style={{paddingTop:24}}><div className="head"><div><h2>Partner Applicants ({partners.length})</h2><p>{msg}</p></div><button onClick={load}>Refresh</button></div>{partners.length===0?<div className="notice">No partner applicants yet.</div>:<div className="grid">{partners.map(p=><article className="application" key={p.id}><h2>{p.business_name||p.name||"Partner Applicant"}</h2><p>{p.service_categories||"Automotive Partner"} • {p.city||"—"} • {p.phone||"—"}</p><div className="notice"><b>KYC:</b> {label(p.kyc_status||"not_submitted")} • <b>Account:</b> {p.active?"Active":"Not Active"}{p.kyc_review_notes&&<><br/><b>Review note:</b> {p.kyc_review_notes}</>}</div>
   {(p.docs||[]).length===0?<p>No KYC documents uploaded.</p>:(p.docs||[]).map(doc=><div className="notice" key={doc.id}><b>{label(doc.document_type)}</b>{doc.document_label?` • ${doc.document_label}`:""}<br/>Status: {label(doc.status)}{doc.expires_on?` • Expiry: ${doc.expires_on}`:""}{doc.review_notes&&<><br/>Note: {doc.review_notes}</>}<div className="row" style={{marginTop:8}}>{doc.preview&&<a className="call" href={doc.preview} target="_blank" rel="noreferrer">View Private File</a>}<button disabled={busy===doc.id} onClick={()=>reviewDoc(doc,"verified")}>Verify Document</button><button disabled={busy===doc.id} onClick={()=>reviewDoc(doc,"rejected")}>Reject / Request Replacement</button></div></div>)}
   <div className="row"><button disabled={busy===p.id||p.kyc_status==="verified"} onClick={()=>verifyPartner(p)}>Verify Partner KYC</button><button disabled={busy===p.id} onClick={()=>requestChanges(p)}>Request KYC Changes</button></div><small>Business activation remains a separate approval step. Database rules block partner activation until KYC status is verified.</small></article>)}</div>}</section>
 </main>;
}
