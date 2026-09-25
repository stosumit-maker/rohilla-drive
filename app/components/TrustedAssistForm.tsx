"use client";

import {useState} from "react";
import {supabase} from "../supabaseClient";
import LegalConsent from "./LegalConsent";

const profiles=[
  "NRI / family abroad",
  "Defence personnel / family",
  "Senior citizen",
  "Outstation vehicle owner",
  "Busy professional",
  "Family member managing the vehicle",
  "Other"
];

const needs=[
  "Service / repair",
  "Vehicle inspection",
  "Battery / tyre / breakdown",
  "Pickup / drop",
  "RC / insurance / documents",
  "Periodic vehicle check",
  "Prepare / sell the vehicle",
  "Other assistance"
];

export default function TrustedAssistForm({defaultProfile="NRI / family outside India",source="trusted_assist"}:{defaultProfile?:string;source?:string}){
  const db=supabase();
  const [name,setName]=useState("");
  const [phone,setPhone]=useState("");
  const [whatsapp,setWhatsapp]=useState("");
  const [currentLocation,setCurrentLocation]=useState("");
  const [vehicleLocation,setVehicleLocation]=useState("Ambala City");
  const [profile,setProfile]=useState(defaultProfile);
  const [need,setNeed]=useState(needs[0]);
  const [vehicle,setVehicle]=useState("");
  const [preferredTime,setPreferredTime]=useState("");
  const [notes,setNotes]=useState("");
  const [busy,setBusy]=useState(false);
  const [msg,setMsg]=useState("");

  async function submit(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    const digits=phone.replace(/\D/g,"");
    if(digits.length<10){setMsg("Please enter a valid mobile number.");return}
    setBusy(true);setMsg("Saving your Trusted Assist request…");
    const details=[
      `Customer profile: ${profile}`,
      `Assistance needed: ${need}`,
      whatsapp.trim()?`WhatsApp: ${whatsapp.trim()}`:"",
      currentLocation.trim()?`Customer currently at: ${currentLocation.trim()}`:"",
      vehicle.trim()?`Vehicle: ${vehicle.trim()}`:"",
      notes.trim()?`Notes: ${notes.trim()}`:"",
      `Lead source: ${source}`
    ].filter(Boolean).join("\n");
    const {error}=await db.from("service_requests").insert({
      customer_name:name.trim(),
      customer_phone:phone.trim(),
      category:"ROHILLA Trusted Assist",
      vehicle_location:vehicleLocation.trim()||null,
      customer_location:currentLocation.trim()||null,
      details,
      preferred_time:preferredTime.trim()||null,
      status:"new"
    });
    setBusy(false);
    if(error){setMsg("We could not save the request right now. Please call or WhatsApp 7015260003.");return}
    const wa=[
      "ROHILLA TRUSTED ASSIST REQUEST","",
      `Name: ${name}`,
      `Phone: ${phone}`,
      whatsapp?`WhatsApp: ${whatsapp}`:"",
      `Profile: ${profile}`,
      `Need: ${need}`,
      currentLocation?`Customer currently at: ${currentLocation}`:"",
      `Vehicle location: ${vehicleLocation}`,
      vehicle?`Vehicle: ${vehicle}`:"",
      preferredTime?`Preferred contact time: ${preferredTime}`:"",
      notes?`Notes: ${notes}`:"",
      "",
      "My request is saved. Please contact me and confirm before any work proceeds."
    ].filter(Boolean).join("\n");
    setMsg("Request saved. Opening WhatsApp…");
    window.location.href=`https://wa.me/917015260003?text=${encodeURIComponent(wa)}`;
  }

  return <section className="section" id="trusted-assist-enquiry">
    <div className="head"><div><h2>Need Vehicle Assistance?</h2><p>Share a few details. Our team will contact you to confirm the next step.</p></div></div>
    <div className="row" style={{marginBottom:14}}>
      <a className="call" href="tel:+917015260003">Call 7015260003</a>
      <a className="call" href="https://wa.me/917015260003">WhatsApp Now</a>
      <a className="call secondary" href="#trusted-assist-enquiry">Get a Callback</a>
    </div>
    
    <form className="adminForm trustedAssistForm" onSubmit={submit}>
      <input required placeholder="Your name" value={name} onChange={e=>setName(e.target.value)}/>
      <input required inputMode="tel" placeholder="Mobile number" value={phone} onChange={e=>setPhone(e.target.value)}/>
      <input inputMode="tel" placeholder="WhatsApp number (if different)" value={whatsapp} onChange={e=>setWhatsapp(e.target.value)}/>
      <select value={profile} onChange={e=>setProfile(e.target.value)}>{profiles.map(x=><option key={x}>{x}</option>)}</select>
      <select value={need} onChange={e=>setNeed(e.target.value)}>{needs.map(x=><option key={x}>{x}</option>)}</select>
      <input placeholder="Your current city / location (optional)" value={currentLocation} onChange={e=>setCurrentLocation(e.target.value)}/>
      <input required placeholder="Vehicle location / city" value={vehicleLocation} onChange={e=>setVehicleLocation(e.target.value)}/>
      <input placeholder="Car make & model (optional)" value={vehicle} onChange={e=>setVehicle(e.target.value)}/>
      <input placeholder="Best time to call (optional)" value={preferredTime} onChange={e=>setPreferredTime(e.target.value)}/>
      <textarea placeholder="Tell us briefly what you need" value={notes} onChange={e=>setNotes(e.target.value)}/>
      <LegalConsent/>
      <button disabled={busy}>{busy?"Saving…":"Request Assistance"}</button>
    </form>
    {msg&&<div className="notice" style={{marginTop:12}}>{msg}</div>}
    <p style={{fontSize:13,color:"#64748b",marginTop:12}}>We’ll confirm the work and estimated cost with you before proceeding.</p>
  </section>;
}
