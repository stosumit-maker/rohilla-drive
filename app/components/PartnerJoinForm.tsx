"use client";
import {useState} from "react";
import {supabase} from "../supabaseClient";
import LegalConsent from "./LegalConsent";
import {canonicalPartnerCategory,partnerCategoryLabels} from "../lib/businessCategories";

export default function PartnerJoinForm({defaultCategory=""}:{defaultCategory?:string}){
 const db=supabase();const initial=canonicalPartnerCategory(defaultCategory);const [category,setCategory]=useState(partnerCategoryLabels.includes(initial)?initial:"");const [msg,setMsg]=useState("");const [busy,setBusy]=useState(false);const [submitted,setSubmitted]=useState(false);
 async function signup(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();setBusy(true);setMsg("Creating account…");
  const x=new FormData(e.currentTarget);
  const name=String(x.get("name")),mobile=String(x.get("mobile")),business=String(x.get("business_name")),city=String(x.get("city")),address=String(x.get("address")),email=String(x.get("email")),password=String(x.get("password"));
  const canonicalCategory=canonicalPartnerCategory(category);
  const applicationMessage=["Address: "+address,String(x.get("message")||"")].filter(Boolean).join("\n");
  const {data,error}=await db.auth.signUp({
   email,
   password,
   options:{data:{
    network_role:"partner",
    application_source:"trusted_signup_v2",
    name,
    phone:mobile,
    business_name:business,
    address,
    city,
    service_categories:canonicalCategory,
    application_message:applicationMessage
   }}
  });
  setBusy(false);
  if(error){setMsg(error.message);return}
  if(!data.user){setMsg("Account could not be created.");return}
  setSubmitted(true);
  setMsg("Application submitted. Partner activation remains blocked until KYC and the business application are approved. If email verification is requested, verify your email and sign in before continuing KYC.");
 }
 return <main><header><div className="brand"><b>ROHILLA DRIVE</b><small>Service / Business Partner Registration</small></div><div className="row"><a className="call" href="/partner">Partner Workspace Sign In</a><a className="call" href="/business-hub">Business Hub</a></div></header><section className="hero"><div className="heroText"><span>DIRECT BUSINESS HUB REGISTRATION</span><h1>Join ROHILLA DRIVE as a Service / Mobility Partner</h1><p>Apply for service, mobility and automotive workflows aligned to your business category. Approved partners receive access only to the workflows enabled for their account.</p></div></section><section className="section"><div className="notice"><b>Compliance:</b> Business verification is required before partner activation. Regulated categories must provide the licence, registration, agency appointment or other authorisation applicable to the service they actually offer. RVSF status is verified where applicable.</div><form className="adminForm" onSubmit={signup}><input name="name" placeholder="Contact Name" required/><input name="business_name" placeholder="Business Name" required/><input name="mobile" placeholder="Mobile Number" required/><input name="email" type="email" placeholder="Email Address" required/><input name="password" type="password" minLength={6} placeholder="Create Password" required/><select value={category} onChange={e=>setCategory(e.target.value)} required><option value="" disabled>Select Business Category</option>{partnerCategoryLabels.map(x=><option key={x} value={x}>{x}</option>)}</select><input name="city" placeholder="City / Service Area" required/><input name="address" placeholder="Business Address" required/><textarea name="message" placeholder="Services, experience, coverage and any licence, registration or authorisation details"/><LegalConsent regulated/><button disabled={busy}>{busy?"Submitting…":"Create Account & Submit Application"}</button></form>{msg&&<div className="notice">{msg}{submitted&&<div className="row" style={{marginTop:10}}><a className="call" href="/partner/kyc">Continue to Private KYC →</a><a className="call" href="/partner">Partner Sign In</a></div>}</div>}<div className="notice">Already registered? <a href="/partner"><b>Sign In to Partner Workspace →</b></a> • <a href="/partner/kyc"><b>KYC & Documents →</b></a></div></section></main>
}
