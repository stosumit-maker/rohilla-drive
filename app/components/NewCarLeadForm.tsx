"use client";

import {useEffect,useState} from "react";
import {supabase} from "../supabaseClient";
import LegalConsent from "./LegalConsent";
import {newRequestReference} from "../lib/reference";

export default function NewCarLeadForm({defaultCity,locationName}:{defaultCity:string;locationName:string}){
  const db=supabase();
  const [name,setName]=useState("");
  const [phone,setPhone]=useState("");
  const [city,setCity]=useState(defaultCity);
  const [brand,setBrand]=useState("");
  const [model,setModel]=useState("");
  const [budget,setBudget]=useState("");
  const [finance,setFinance]=useState("");
  const [exchange,setExchange]=useState("");
  const [notes,setNotes]=useState("");
  const [source,setSource]=useState("regional_new_car");
  const [busy,setBusy]=useState(false);
  const [msg,setMsg]=useState("");

  useEffect(()=>{
    try{
      const p=new URLSearchParams(window.location.search);
      const s=(p.get("utm_source")||p.get("source")||"").toLowerCase().replace(/[^a-z0-9_-]/g,"").slice(0,48);
      if(s)setSource(`external_${s}`.slice(0,64));
      const b=p.get("brand");if(b)setBrand(b.slice(0,80));
      const m=p.get("model");if(m)setModel(m.slice(0,100));
      const c=p.get("city");if(c)setCity(c.slice(0,80));
    }catch{}
  },[]);

  async function submit(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    if(phone.replace(/\D/g,"").length<10){setMsg("Please enter a valid mobile number.");return}
    setBusy(true);setMsg("Saving your new-car requirement…");
    const ref=newRequestReference("RDN");
    const message=[
      `Reference: ${ref}`,
      `Location page: ${locationName}`,
      brand?`Brand: ${brand}`:"",
      model?`Model: ${model}`:"",
      finance?`Finance: ${finance}`:"",
      exchange?`Exchange: ${exchange}`:"",
      notes?`Notes: ${notes}`:""
    ].filter(Boolean).join("\n");
    const {error}=await db.from("leads").insert({
      customer_name:name.trim(),customer_phone:phone.trim(),
      requirement:`New car assistance in ${locationName}`,message,status:"new",source,
      enquiry_type:"new_vehicle",new_or_used:"new",budget:budget?Number(budget):null,
      preferred_brand:brand.trim()||null,preferred_model:model.trim()||null,vehicle_type:"car_suv",customer_city:city.trim()||locationName
    });
    setBusy(false);
    if(error){setMsg("We could not save the request right now. Please call or WhatsApp 7015260003.");return}
    const wa=[
      "ROHILLA DRIVE - NEW CAR REQUIREMENT","",`Reference: ${ref}`,`Name: ${name}`,`Phone: ${phone}`,`City: ${city}`,
      brand?`Brand: ${brand}`:"",model?`Model: ${model}`:"",budget?`Budget: ₹${Number(budget).toLocaleString("en-IN")}`:"",
      finance?`Finance: ${finance}`:"",exchange?`Exchange: ${exchange}`:"",notes?`Notes: ${notes}`:"",
      "","Please share relevant authorised dealer / new-car options where available."
    ].filter(Boolean).join("\n");
    setMsg(`Requirement saved ✓ Reference: ${ref}. Opening WhatsApp…`);
    window.location.href=`https://wa.me/917015260003?text=${encodeURIComponent(wa)}`;
  }

  return <section className="section" id="new-car-enquiry">
    <div className="head"><div><h2>Request a New Car in {locationName}</h2><p>Share your brand, model, budget, exchange and finance preferences once. ROHILLA DRIVE can coordinate relevant participating dealer options where available.</p></div></div>
    <form className="adminForm" onSubmit={submit}>
      <input required placeholder="Your name" value={name} onChange={e=>setName(e.target.value)}/>
      <input required inputMode="tel" placeholder="Mobile number" value={phone} onChange={e=>setPhone(e.target.value)}/>
      <input required placeholder="City / location" value={city} onChange={e=>setCity(e.target.value)}/>
      <input placeholder="Preferred brand (optional)" value={brand} onChange={e=>setBrand(e.target.value)}/>
      <input placeholder="Preferred model (optional)" value={model} onChange={e=>setModel(e.target.value)}/>
      <input inputMode="numeric" placeholder="Approx budget ₹ (optional)" value={budget} onChange={e=>setBudget(e.target.value.replace(/\D/g,""))}/>
      <select value={finance} onChange={e=>setFinance(e.target.value)}><option value="">Finance requirement?</option><option>Yes</option><option>No</option><option>Need comparison</option></select>
      <select value={exchange} onChange={e=>setExchange(e.target.value)}><option value="">Exchange existing car?</option><option>Yes</option><option>No</option></select>
      <textarea placeholder="Variant, fuel, automatic/manual, delivery timing or other preference" value={notes} onChange={e=>setNotes(e.target.value)}/>
      <LegalConsent/>
      <button disabled={busy}>{busy?"Submitting…":"Save New-Car Requirement & Continue on WhatsApp"}</button>
    </form>
    {msg&&<div className="notice" style={{marginTop:12}}>{msg}</div>}
    <p style={{fontSize:13,color:"#64748b",marginTop:12}}>Stock, final price, discount, finance approval, insurance, exchange valuation, warranty and delivery are confirmed by the relevant authorised seller/provider. ROHILLA DRIVE does not guarantee a particular offer.</p>
  </section>;
}
