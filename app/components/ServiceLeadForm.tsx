"use client";

import {useEffect,useState} from "react";
import {supabase} from "../supabaseClient";
import LegalConsent from "./LegalConsent";
import {autoServiceIntents} from "../lib/auto-services";

export default function ServiceLeadForm({defaultCity,locationName}:{defaultCity:string;locationName:string}){
  const db=supabase();
  const [name,setName]=useState("");
  const [phone,setPhone]=useState("");
  const [city,setCity]=useState(defaultCity);
  const [service,setService]=useState(autoServiceIntents[0].id);
  const [vehicle,setVehicle]=useState("");
  const [preferredTime,setPreferredTime]=useState("");
  const [notes,setNotes]=useState("");
  const [source,setSource]=useState("regional_car_services");
  const [busy,setBusy]=useState(false);
  const [msg,setMsg]=useState("");

  useEffect(()=>{
    try{
      const p=new URLSearchParams(window.location.search);
      const s=(p.get("utm_source")||p.get("source")||"").toLowerCase().replace(/[^a-z0-9_-]/g,"").slice(0,48);
      const requested=p.get("service");
      if(s)setSource(`external_${s}`.slice(0,64));
      else if(document.referrer){
        const host=new URL(document.referrer).hostname.replace(/^www\./,"").toLowerCase().replace(/[^a-z0-9.-]/g,"").slice(0,45);
        if(host&&!host.endsWith("rohilladrive.com"))setSource(`referral_${host}`.slice(0,64));
      }
      if(requested&&autoServiceIntents.some(x=>x.id===requested))setService(requested);
      const cityParam=p.get("city");if(cityParam)setCity(cityParam.slice(0,80));
    }catch{}
  },[]);

  async function submit(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    const digits=phone.replace(/\D/g,"");
    if(digits.length<10){setMsg("Please enter a valid mobile number.");return}
    const selected=autoServiceIntents.find(x=>x.id===service) || autoServiceIntents[0];
    setBusy(true);setMsg("Saving your service request…");
    const details=[
      vehicle?`Vehicle: ${vehicle}`:"",
      notes?`Requirement: ${notes}`:"",
      `Source: ${source}`,
      `Coverage page: ${locationName}`
    ].filter(Boolean).join("\n");
    const {error}=await db.from("service_requests").insert({
      customer_name:name.trim(),
      customer_phone:phone.trim(),
      category:selected.label,
      customer_location:city.trim()||locationName,
      details:details||null,
      preferred_time:preferredTime.trim()||null,
      status:"new"
    });
    setBusy(false);
    if(error){setMsg("We could not save the request right now. Please call or WhatsApp 7015260003.");return}
    const wa=[
      "ROHILLA DRIVE - AUTOMOTIVE SERVICE REQUEST",
      "",
      `Service: ${selected.label}`,
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Location: ${city}`,
      vehicle?`Vehicle: ${vehicle}`:"",
      preferredTime?`Preferred time: ${preferredTime}`:"",
      notes?`Requirement: ${notes}`:"",
      "",
      "My request is saved. Please coordinate the next step."
    ].filter(Boolean).join("\n");
    setMsg("Request saved. Opening WhatsApp…");
    window.location.href=`https://wa.me/917015260003?text=${encodeURIComponent(wa)}`;
  }

  return <section className="section" id="service-enquiry">
    <div className="head"><div><h2>Need an automotive service in {locationName}?</h2><p>Send one request. ROHILLA DRIVE can coordinate it with a suitable participating partner where available. Regulated finance, insurance and RTO-related work is handled only through appropriately authorised providers.</p></div></div>
    <form className="adminForm" onSubmit={submit}>
      <input required placeholder="Your name" value={name} onChange={e=>setName(e.target.value)}/>
      <input required inputMode="tel" placeholder="Mobile / WhatsApp number" value={phone} onChange={e=>setPhone(e.target.value)}/>
      <input required placeholder="City / location" value={city} onChange={e=>setCity(e.target.value)}/>
      <select value={service} onChange={e=>setService(e.target.value)}>{autoServiceIntents.map(x=><option key={x.id} value={x.id}>{x.label}</option>)}</select>
      <input placeholder="Vehicle / model (optional)" value={vehicle} onChange={e=>setVehicle(e.target.value)}/>
      <input placeholder="Preferred time (optional)" value={preferredTime} onChange={e=>setPreferredTime(e.target.value)}/>
      <textarea placeholder="What help do you need?" value={notes} onChange={e=>setNotes(e.target.value)}/>
      <LegalConsent/>
      <button disabled={busy}>{busy?"Saving…":"Save Request & Continue on WhatsApp"}</button>
    </form>
    {msg&&<div className="notice" style={{marginTop:12}}>{msg}</div>}
    <p style={{fontSize:13,color:"#64748b",marginTop:12}}>Submitting a request does not guarantee partner availability, price, turnaround time, finance approval, insurance issuance or RTO outcome. Confirm the provider, scope, documents and final terms before proceeding.</p>
  </section>;
}
