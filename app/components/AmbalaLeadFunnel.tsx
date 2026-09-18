"use client";

import {useState} from "react";
import {supabase} from "../supabaseClient";
import LegalConsent from "./LegalConsent";

type Mode="buy"|"sell";

export default function AmbalaLeadFunnel({source="ambala_lead_funnel",defaultMode="buy"}:{source?:string;defaultMode?:Mode}){
  const db=supabase();
  const [mode,setMode]=useState<Mode>(defaultMode);
  const [name,setName]=useState("");
  const [phone,setPhone]=useState("");
  const [city,setCity]=useState("Ambala City");
  const [car,setCar]=useState("");
  const [budget,setBudget]=useState("");
  const [year,setYear]=useState("");
  const [timing,setTiming]=useState("Within 15 days");
  const [busy,setBusy]=useState(false);
  const [msg,setMsg]=useState("");

  function reset(){
    setName("");setPhone("");setCar("");setBudget("");setYear("");setTiming("Within 15 days");
  }

  async function submit(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    const digits=phone.replace(/\D/g,"");
    if(digits.length<10){setMsg("Please enter a valid mobile / WhatsApp number.");return}
    setBusy(true);setMsg("Saving your requirement…");
    const buying=mode==="buy";
    const message=buying
      ?[`Wanted car: ${car}`,budget?`Budget: ₹${Number(budget).toLocaleString("en-IN")}`:"",`Purchase timing: ${timing}`,`City: ${city}`].filter(Boolean).join("\n")
      :[`Car to sell: ${car}`,year?`Year: ${year}`:"",budget?`Expected price: ₹${Number(budget).toLocaleString("en-IN")}`:"",`City: ${city}`].filter(Boolean).join("\n");

    const {error}=await db.from("leads").insert({
      customer_name:name.trim(),
      customer_phone:phone.trim(),
      requirement:buying?"Buy Used Car in Ambala":"Sell Used Car in Ambala",
      message,
      status:"new",
      source,
      enquiry_type:buying?"buy_vehicle":"sell_vehicle",
      new_or_used:"used"
    });
    setBusy(false);
    if(error){
      setMsg("We could not save the request right now. Please call or WhatsApp 7015260003.");
      return;
    }

    const wa=buying
      ?`ROHILLA DRIVE - BUY CAR REQUIREMENT\n\nName: ${name}\nPhone: ${phone}\nCity: ${city}\nCar wanted: ${car}\nBudget: ${budget?`₹${Number(budget).toLocaleString("en-IN")}`:"Open"}\nTiming: ${timing}\n\nMy requirement is saved. Please contact me with suitable options.`
      :`ROHILLA DRIVE - SELL CAR REQUIREMENT\n\nName: ${name}\nPhone: ${phone}\nCity: ${city}\nCar: ${car}\nYear: ${year||"Not entered"}\nExpected price: ${budget?`₹${Number(budget).toLocaleString("en-IN")}`:"Open"}\n\nMy requirement is saved. Please contact me for the next step.`;
    setMsg("Requirement saved. Opening WhatsApp…");
    reset();
    window.location.href=`https://wa.me/917015260003?text=${encodeURIComponent(wa)}`;
  }

  return <section className="section" id="ambala-enquiry" style={{paddingTop:30}}>
    <div className="head"><div>
      <h2>{mode==="buy"?"Can’t find the exact car? Tell us what you want.":"Want to sell your car in Ambala?"}</h2>
      <p>{mode==="buy"?"Share the model, budget and timing once. Your requirement is saved for direct follow-up, even when the exact car is not currently published.":"Send a quick requirement now. You can add full vehicle details and private photos later."}</p>
    </div></div>
    <div className="row" style={{marginBottom:14}}>
      <button type="button" className={mode==="buy"?"call":"secondary"} onClick={()=>{setMode("buy");setMsg("")}}>I Want to Buy</button>
      <button type="button" className={mode==="sell"?"call":"secondary"} onClick={()=>{setMode("sell");setMsg("")}}>I Want to Sell</button>
      <a className="secondary" href="tel:+917015260003">Call 7015260003</a>
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
      <button disabled={busy}>{busy?"Saving…":mode==="buy"?"Save Requirement & Continue on WhatsApp":"Save Sell Request & Continue on WhatsApp"}</button>
    </form>
    {msg&&<div className="notice" style={{marginTop:12}}>{msg}</div>}
    <p style={{marginTop:12,fontSize:13,color:"#64748b"}}>No payment is required to send this enquiry. Vehicle availability, condition, price and transaction terms must be confirmed separately before purchase or sale.</p>
  </section>;
}
