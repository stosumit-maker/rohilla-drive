"use client";

import { useState } from "react";
import { supabase } from "../supabaseClient";
import LegalConsent from "../components/LegalConsent";

const checks = [
  ["🚨", "Challan", "eChallan status and available record details"],
  ["🚘", "Vehicle / RC", "Registration and vehicle details"],
  ["🛡️", "Insurance", "Available insurance-status information"],
  ["🌱", "PUC", "Available PUCC-status information"],
  ["🏦", "Hypothecation", "Available finance / hypothecation information"],
  ["🔎", "Risk Review", "Structured review of the available records"],
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
    const wa=`ROHILLA DRIVE VERIFICATION REQUEST\n\nVehicle: ${reg}\nVerification ID: ${data.id}\nName: ${name.trim()||'Customer'}\nPhone: ${phone.trim()}\n\nThe request is already saved with ROHILLA DRIVE.`;
    window.location.href=`https://wa.me/917015260003?text=${encodeURIComponent(wa)}`;
  }

  return <main>
    <header><div className="brand"><b>ROHILLA DRIVE</b><small>Vehicle Verification Desk</small></div><a className="call" href="/">← Back to Rohilla Drive</a></header>
    <section className="hero"><div className="heroText"><span>ROHILLA DRIVE • VEHICLE VERIFICATION</span><h1>Check a vehicle<br/>before you buy.</h1><p>Request a structured review of available vehicle, challan and compliance records before you buy.</p></div></section>
    <section className="section"><div className="card" style={{maxWidth:720,margin:"0 auto"}}><div className="body">
      {submitted ? <div className="success"><h2>Request submitted ✓</h2><p>Verification ID: <b>{submitted}</b></p><p>ROHILLA DRIVE will review the request and coordinate lawfully available checks or documents. If any government, third-party or Rohilla Drive fee applies, the applicable charge should be disclosed before payment.</p><a className="call" href="/">Back to Rohilla Drive</a></div> : <>
        <h2>Vehicle Verification Request</h2><p>Enter the registration number. Customer contact details remain permission-controlled inside Rohilla Drive.</p>
        <div className="notice"><b>Verification summary:</b> Rohilla Drive reports lawfully available information and clearly marks unavailable data. This is an informational review, not a government certificate; final decisions should include appropriate document and physical/technical checks.</div>
        <form className="adminForm" onSubmit={submit}><input value={vehicle} onChange={e=>setVehicle(e.target.value)} placeholder="Vehicle number e.g. HR02AB1234" required/><input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name (optional)"/><input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Mobile number" inputMode="tel" required/><LegalConsent/><button disabled={busy}>{busy?"Submitting…":"Save Request & Continue on WhatsApp"}</button></form>
      </>}
    </div></div></section>
    <section className="section"><div className="head"><div><h2>What we may check</h2><p>We check the records that are relevant and lawfully accessible.</p></div></div><div className="services">{checks.map(([icon,title,text])=><div className="card" key={title}><div className="body"><h3>{icon} {title}</h3><p>{text}</p></div></div>)}</div></section>
    <section className="section dark"><div className="about"><h2>Official-source information</h2><p>Government records remain subject to official portal availability and access rules. Rohilla Drive does not bypass CAPTCHA, OTP, login or other security controls.</p><div className="quickLeadBtns"><a className="call" href="https://echallan.parivahan.gov.in/" target="_blank" rel="noreferrer">Official eChallan</a><a className="call" href="https://parivahan.gov.in/" target="_blank" rel="noreferrer">Parivahan</a></div></div></section>
    <footer><b>ROHILLA DRIVE</b><p>by Rohilla Multibrand Cars • Ambala City</p></footer>
  </main>;
}
