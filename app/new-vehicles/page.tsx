"use client";
import {useState} from "react";
import {supabase} from "../supabaseClient";
import CustomerBackBar from "../components/CustomerBackBar";
import LegalConsent from "../components/LegalConsent";

const vehicleTypes=[
 ["car_suv","Car / SUV","🚗"],["two_wheeler","Two-Wheeler","🏍️"],["commercial","Commercial Vehicle","🚚"],["tractor_agri","Tractor / Agriculture","🚜"],["ev","Electric Vehicle","⚡"],["fleet","Fleet / Corporate","🏢"]
];

export default function NewVehicles(){
 const db=supabase();
 const [f,setF]=useState<any>({vehicle_type:"car_suv",city:"Ambala City"});
 const [busy,setBusy]=useState(false);const [msg,setMsg]=useState("");
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setMsg("Saving your requirement…");
  const {error}=await db.from("leads").insert({customer_name:f.name.trim(),customer_phone:f.phone.trim(),requirement:`New ${f.vehicle_type} assistance`,message:[f.use_case?`Use: ${f.use_case}`:"",f.finance?`Finance: ${f.finance}`:"",f.exchange?`Exchange: ${f.exchange}`:"",f.notes||""].filter(Boolean).join("\n"),status:"new",source:"new_vehicle_assistance",enquiry_type:"new_vehicle",new_or_used:"new",budget:f.budget?Number(f.budget):null,preferred_brand:f.brand||null,preferred_model:f.model||null,vehicle_type:f.vehicle_type,customer_city:f.city||null});
  setBusy(false);if(error){setMsg(error.message);return}setMsg("Requirement saved ✓ Rohilla Drive can review it and, where relevant, coordinate available OEM/authorised dealer options.");
 }
 return <main>
  <CustomerBackBar/>
  <header><div className="brand"><b>ROHILLA DRIVE</b><small>Multi-Brand New Vehicle Assistance</small></div><div className="row"><a className="call" href="/language-assist">Language Bridge</a><a className="call" href="/business-hub">Business Hub</a></div></header>
  <section className="hero"><div className="heroText"><span>NEW VEHICLE • MULTI-BRAND • MULTI-CATEGORY</span><h1>One request. Relevant new-vehicle options.</h1><p>Share your requirement once. Rohilla Drive coordinates it with relevant participating dealer teams where available, including model options, quotes and test-drive requests.</p><p><b>One network. Every vehicle. Every language.</b></p><div className="row"><a className="call" href="/join/oem">OEM / New Vehicle Dealer? Register Here</a><a className="call" href="/dealer">Dealer / OEM Login</a></div></div></section>
  <section className="section"><div className="head"><div><h2>Choose vehicle category</h2><p>Cars are only one part of the platform.</p></div></div><div className="vehicleVerticals compactNetwork">{vehicleTypes.map(([value,label,icon])=><button key={value} className={f.vehicle_type===value?"filter active":""} onClick={()=>setF({...f,vehicle_type:value})}><span>{icon}</span><b>{label}</b></button>)}</div></section>
  <section className="section"><div className="grid"><article className="application"><h2>What Rohilla Drive can coordinate</h2><p>Brand/model discovery • participating dealer availability • test-drive requests • quote comparison • exchanges • accessories or fleet requirements • delivery coordination.</p><p><b>Finance / insurance:</b> Requests are handed off only to the relevant authorised provider for eligibility, advice and final terms.</p><p><b>Seller confirmation:</b> Stock, final price, discount, warranty, exchange valuation and delivery are confirmed by the relevant authorised seller.</p></article><article className="application"><h2>How routing works</h2><p>Your requirement is structured once and routed to relevant participating teams based on category, brand, model, city and availability. Responses and availability vary by dealer.</p></article></div></section>
  <section className="section"><h2>Request New Vehicle Assistance</h2><form className="adminForm" onSubmit={submit}><input required placeholder="Your name" value={f.name||""} onChange={e=>setF({...f,name:e.target.value})}/><input required placeholder="Mobile number" value={f.phone||""} onChange={e=>setF({...f,phone:e.target.value})}/><input placeholder="City" value={f.city||""} onChange={e=>setF({...f,city:e.target.value})}/><input placeholder="Preferred brand (optional)" value={f.brand||""} onChange={e=>setF({...f,brand:e.target.value})}/><input placeholder="Preferred model (optional)" value={f.model||""} onChange={e=>setF({...f,model:e.target.value})}/><input type="number" placeholder="Approx budget ₹" value={f.budget||""} onChange={e=>setF({...f,budget:e.target.value})}/><input placeholder="Use: family / business / taxi / fleet / farm / delivery…" value={f.use_case||""} onChange={e=>setF({...f,use_case:e.target.value})}/><select value={f.finance||""} onChange={e=>setF({...f,finance:e.target.value})}><option value="">Finance requirement?</option><option>Yes</option><option>No</option><option>Need comparison</option></select><select value={f.exchange||""} onChange={e=>setF({...f,exchange:e.target.value})}><option value="">Exchange existing vehicle?</option><option>Yes</option><option>No</option></select><textarea placeholder="Variant, fuel, automatic/manual, seats, delivery timeline or other preference" value={f.notes||""} onChange={e=>setF({...f,notes:e.target.value})}/><LegalConsent/><button disabled={busy}>{busy?"Submitting…":"Submit Requirement"}</button></form>{msg&&<div className="notice">{msg}</div>}</section>
 </main>;
}
