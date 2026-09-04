"use client";

import { useState } from "react";
import { supabase } from "../supabaseClient";

const checks = [
  ["🚨", "All-India Challan", "Official eChallan verification"],
  ["🚘", "Vehicle / RC", "Official vehicle details where available"],
  ["🛡️", "Insurance", "Insurance status where available"],
  ["🌱", "PUC", "PUCC status where available"],
  ["🏦", "Hypothecation", "Loan / finance status where available"],
  ["🔎", "Risk Review", "Rohilla Drive assessment from verified records"],
];

export default function VerifyVehicle() {
  const db = supabase();
  const [vehicle, setVehicle] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const reg = vehicle.trim().toUpperCase().replace(/\s+/g, "");
    if (!reg || !phone.trim()) return;
    setBusy(true);
    const { data, error } = await db.from("vehicle_verification_orders").insert({
      vehicle_number: reg,
      customer_name: name.trim() || null,
      customer_phone: phone.trim(),
      service_type: "full_verification",
      status: "submitted",
      payment_status: "unpaid",
      official_links: {
        echallan: "https://echallan.parivahan.gov.in/",
        mparivahan: "https://parivahan.gov.in/",
      },
    }).select("id").single();
    setBusy(false);
    if (error) { alert(error.message); return; }
    setSubmitted(data.id);
  }

  return <main>
    <header><div className="brand"><b>ROHILLA DRIVE</b><small>Vehicle Verification Desk</small></div><a className="call" href="/">← Back to Cars</a></header>
    <section className="hero"><div className="heroText"><span>ROHILLA DRIVE • VEHICLE VERIFICATION</span><h1>Verify a vehicle<br/>before you buy.</h1><p>Request a structured verification covering official vehicle information, challans and available compliance records. We never label a vehicle “clear” where an official record is unavailable.</p></div></section>
    <section className="section"><div className="card" style={{maxWidth:720,margin:"0 auto"}}><div className="body">
      {submitted ? <div className="success"><h2>Request submitted ✓</h2><p>Verification ID: <b>{submitted}</b></p><p>ROHILLA DRIVE will process the request and coordinate any required verification or documents. Government fees and Rohilla Drive service fees will be shown separately before payment.</p><a className="call" href="/">Back to Rohilla Drive</a></div> : <>
        <h2>Full Vehicle Verification</h2><p>Enter the registration number. Customer contact details remain with Rohilla Drive and are not exposed to service providers.</p>
        <form className="adminForm" onSubmit={submit}><input value={vehicle} onChange={e=>setVehicle(e.target.value)} placeholder="Vehicle number e.g. HR02AB1234" required/><input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name (optional)"/><input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Mobile number" inputMode="tel" required/><button disabled={busy}>{busy?"Submitting…":"Start Verification"}</button></form>
      </>}
    </div></div></section>
    <section className="section"><div className="head"><div><h2>What we check</h2><p>Only information that can be legitimately verified is reported.</p></div></div><div className="services">{checks.map(([icon,title,text])=><div className="card" key={title}><div className="body"><h3>{icon} {title}</h3><p>{text}</p></div></div>)}</div></section>
    <section className="section dark"><div className="about"><h2>Official-source verification</h2><p>Challan and government records remain subject to the availability and rules of the relevant official authority. Rohilla Drive does not bypass CAPTCHA, OTP, login or government security controls, and an unavailable record is never presented as “clear”.</p><div className="quickLeadBtns"><a className="call" href="https://echallan.parivahan.gov.in/" target="_blank" rel="noreferrer">Official eChallan</a><a className="call" href="https://parivahan.gov.in/" target="_blank" rel="noreferrer">Parivahan</a></div></div></section>
    <footer><b>ROHILLA DRIVE</b><p>by Rohilla Multibrand Cars • Ambala City</p></footer>
  </main>;
}
