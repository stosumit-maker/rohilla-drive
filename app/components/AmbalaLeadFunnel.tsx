"use client";

import {useEffect,useState} from "react";
import {supabase} from "../supabaseClient";
import LegalConsent from "./LegalConsent";
import {track} from "@vercel/analytics";

type Mode="buy"|"sell";

export default function AmbalaLeadFunnel({source="ambala_lead_funnel",defaultMode="buy",defaultCity="Ambala City",locationName="Ambala"}:{source?:string;defaultMode?:Mode;defaultCity?:string;locationName?:string}){
  const db=supabase();
  const [mode,setMode]=useState<Mode>(defaultMode);
  const [name,setName]=useState("");
  const [phone,setPhone]=useState("");
  const [city,setCity]=useState(defaultCity);
  const [car,setCar]=useState("");
  const [budget,setBudget]=useState("");
  const [year,setYear]=useState("");
  const [timing,setTiming]=useState("Within 15 days");
  const [busy,setBusy]=useState(false);
  const [msg,setMsg]=useState("");
  const [leadSource,setLeadSource]=useState(source);
  const [campaign,setCampaign]=useState("");

  useEffect(()=>{
    try{
      const params=new URLSearchParams(window.location.search);
      const rawSource=(params.get("utm_source")||params.get("source")||"").toLowerCase().replace(/[^a-z0-9_-]/g,"").slice(0,48);
      const rawCampaign=(params.get("utm_campaign")||"").toLowerCase().replace(/[^a-z0-9_-]/g,"").slice(0,64);
      if(rawSource)setLeadSource(`external_${rawSource}`.slice(0,64));
      else if(document.referrer){
        const host=new URL(document.referrer).hostname.replace(/^www\./,"").toLowerCase().replace(/[^a-z0-9.-]/g,"").slice(0,45);
        if(host&&!host.endsWith("rohilladrive.com"))setLeadSource(`referral_${host}`.slice(0,64));
      }
      if(rawCampaign)setCampaign(rawCampaign);
      if((params.get("intent")||"").toLowerCase()==="sell")setMode("sell");
      const model=params.get("model");if(model)setCar(model.slice(0,100));
      const cityParam=params.get("city");if(cityParam)setCity(cityParam.slice(0,80));
      const budgetParam=(params.get("budget")||"").replace(/\D/g,"");if(budgetParam)setBudget(budgetParam.slice(0,10));
    }catch{}
  },[source]);

  function reset(){
    setName("");setPhone("");setCar("");setBudget("");setYear("");setTiming("Within 15 days");setCity(defaultCity);
  }

  async function submit(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    const digits=phone.replace(/\D/g,"");
    if(digits.length<10){setMsg("Please enter a valid mobile / WhatsApp number.");return}
    setBusy(true);setMsg("Saving your requirement…");
    const buying=mode==="buy";
    const message=buying
      ?[`Wanted car: ${car}`,budget?`Budget: ₹${Number(budget).toLocaleString("en-IN")}`:"",`Purchase timing: ${timing}`,`City: ${city}`,campaign?`Campaign: ${campaign}`:""].filter(Boolean).join("\n")
      :[`Car to sell: ${car}`,year?`Year: ${year}`:"",budget?`Expected price: ₹${Number(budget).toLocaleString("en-IN")}`:"",`City: ${city}`,campaign?`Campaign: ${campaign}`:""].filter(Boolean).join("\n");

    const {error}=await db.from("leads").insert({
      customer_name:name.trim(),
      customer_phone:phone.trim(),
      requirement:buying?`Buy Used Car in ${locationName}`:`Sell Used Car in ${locationName}`,
      message,
      status:"new",
      source:leadSource,
      enquiry_type:buying?"buy_vehicle":"sell_vehicle",
      new_or_used:"used",
      customer_city:city.trim()||null,
      preferred_model:car.trim()||null,
      budget:budget?Number(budget):null
    });
    setBusy(false);
    if(error){
      setMsg("We could not save the request right now. Please call or WhatsApp 7015260003.");
      return;
    }

    track("Lead Submitted",{surface:"ambala_funnel",intent:buying?"buy_used":"sell_used",source:leadSource,campaign:campaign||"none"});

    const wa=buying
      ?`ROHILLA DRIVE - BUY CAR REQUIREMENT\n\nName: ${name}\nPhone: ${phone}\nCity: ${city}\nCar wanted: ${car}\nBudget: ${budget?`₹${Number(budget).toLocaleString("en-IN")}`:"Open"}\nTiming: ${timing}\n\nMy requirement is saved. Please contact me with suitable options.`
      :`ROHILLA DRIVE - SELL CAR REQUIREMENT\n\nName: ${name}\nPhone: ${phone}\nCity: ${city}\nCar: ${car}\nYear: ${year||"Not entered"}\nExpected price: ${budget?`₹${Number(budget).toLocaleString("en-IN")}`:"Open"}\n\nMy requirement is saved. Please contact me for the next step.`;
    setMsg("Requirement saved. Opening WhatsApp…");
    reset();
    window.location.href=`https://wa.me/917015260003?text=${encodeURIComponent(wa)}`;
  }

  return <section className="section" id="ambala-enquiry" style={{paddingTop:30}}>
    <div className="head"><div>
      <h2>{mode==="buy"?`Looking for a car in ${locationName}?`:`Want to sell your car in ${locationName}?`}</h2>
      <p>{mode==="buy"?"Tell us the model, budget and timing.":"Share the basic car details and we’ll contact you."}</p>
    </div></div>
    <div className="row" style={{marginBottom:14}}>
      <button type="button" className={mode==="buy"?"call":"secondary"} onClick={()=>{setMode("buy");setMsg("")}}>Buy a Car</button>
      <button type="button" className={mode==="sell"?"call":"secondary"} onClick={()=>{setMode("sell");setMsg("")}}>Sell a Car</button>
      <a className="secondary" href="tel:+917015260003" onClick={()=>track("Call Click",{surface:"ambala_funnel"})}>Call 7015260003</a>
    </div>
    <form className="adminForm" onSubmit={submit}>
      <input required placeholder="Your name" value={name} onChange={e=>setName(e.target.value)}/>
      <input required inputMode="tel" placeholder="Mobile / WhatsApp number" value={phone} onChange={e=>setPhone(e.target.value)}/>
      <input required placeholder={mode==="buy"?"Car / model wanted (example Creta, Swift, Thar)":"Car / model to sell"} value={car} onChange={e=>setCar(e.target.value)}/>
      {mode==="sell"&&<input inputMode="numeric" placeholder="Model year" value={year} onChange={e=>setYear(e.target.value.replace(/\D/g,"").slice(0,4))}/>}
      <input inputMode="numeric" placeholder={mode==="buy"?"Budget ₹ (optional)":"Expected price ₹ (optional)"} value={budget} onChange={e=>setBudget(e.target.value.replace(/\D/g,""))}/>
      <input required placeholder="City / location" value={city} onChange={e=>setCity(e.target.value)}/>
      {mode==="buy"&&<select value={timing} onChange={e=>setTiming(e.target.value)}><option>Immediately / this week</option><option>Within 15 days</option><option>Within 30 days</option><option>Just exploring</option></select>}
      <LegalConsent/>
      <button disabled={busy}>{busy?"Saving…":mode==="buy"?"Send Requirement":"Send Sell Request"}</button>
    </form>
    {msg&&<div className="notice" style={{marginTop:12}}>{msg}</div>}
    <p style={{marginTop:12,fontSize:13,color:"#64748b"}}>Availability, condition, price and final terms must be confirmed before any transaction.</p>
  </section>;
}
