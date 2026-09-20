"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { track } from "@vercel/analytics";

type Vehicle = { id:string; brand:string; model:string; variant?:string; year:number; km:number; fuel:string; owner_count?:number; asking_price:number; city?:string; public_notes?:string; vehicle_photos?:{url:string;sort_order?:number}[] };

export default function Home(){
 const db=supabase(); const [cars,setCars]=useState<Vehicle[]>([]); const [loading,setLoading]=useState(true); const [search,setSearch]=useState(""); const [fuel,setFuel]=useState("All"); const [leadOpen,setLeadOpen]=useState(false); const [leadMessage,setLeadMessage]=useState("I am looking for a used car. Please contact me with suitable options."); const [leadType,setLeadType]=useState("vehicle purchase"); const [leadName,setLeadName]=useState(""); const [leadPhone,setLeadPhone]=useState(""); const [leadLocation,setLeadLocation]=useState(""); const [leadTime,setLeadTime]=useState(""); const [leadBusy,setLeadBusy]=useState(false);
 useEffect(()=>{async function loadCars(){const {data}=await db.from("vehicles").select("id,brand,model,variant,year,km,fuel,owner_count,asking_price,city,public_notes,vehicle_photos(url,sort_order)").eq("status","published").order("created_at",{ascending:false}).limit(6);setCars((data||[]) as Vehicle[]);setLoading(false)}loadCars()},[]);
 function browseInventory(){track("Inventory Search",{surface:"homepage",fuel});const p=new URLSearchParams();if(search.trim())p.set("q",search.trim());if(fuel!=="All")p.set("fuel",fuel);window.location.href=`/inventory${p.toString()?`?${p.toString()}`:""}`}
 function whatsapp(text:string){track("WhatsApp Click",{surface:"homepage"});window.open(`https://wa.me/917015260003?text=${encodeURIComponent(text)}`,"_blank")}
 function continueOnWhatsapp(text:string){window.location.href=`https://wa.me/917015260003?text=${encodeURIComponent(text)}`}
 function openLead(type:string){setLeadType(type);setLeadMessage(type==='new car purchase'?"Hello Rohilla Drive, I am looking for a new car. Please help me with model, variant, price and availability options.":`Hello Rohilla Drive, I am interested in your ${type} service. Please contact me.`);setLeadOpen(true)}
 function openVehicleEnquiry(car:Vehicle){setLeadType('vehicle purchase');setLeadMessage(`I am interested in ${car.brand} ${car.model} ${car.variant||''} (${car.year}) listed at ₹${Number(car.asking_price).toLocaleString('en-IN')}. Vehicle ID: ${car.id}`);setLeadOpen(true)}
 function openServiceLead(type:string){setLeadType(type);setLeadMessage(type==='Rohilla Trusted Assist'?"I need trusted vehicle assistance while I am away or unable to manage it personally. Please coordinate the requirement with me before any work proceeds.":`I need ${type} assistance.`);setLeadOpen(true)}
 function goTo(id:string){document.getElementById(id)?.scrollIntoView({behavior:'smooth'})}
 function resetLead(){setLeadOpen(false);setLeadName('');setLeadPhone('');setLeadLocation('');setLeadTime('');setLeadMessage('I am looking for a used car. Please contact me with suitable options.');setLeadType('vehicle purchase')}
 async function submitLead(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();if(!leadName.trim()||!leadPhone.trim())return;const formSource=e.currentTarget.dataset.source||'customer_website';const params=new URLSearchParams(window.location.search);const campaign=[params.get('utm_source'),params.get('utm_medium'),params.get('utm_campaign')].filter(Boolean).join('/');const leadSource=campaign?`website:${campaign}`:formSource;setLeadBusy(true);
  const isService=!['vehicle purchase','vehicle sale','car purchase','car sale','new car purchase'].includes(leadType);
  if(isService){
   const {error}=await db.from('service_requests').insert({customer_name:leadName.trim(),customer_phone:leadPhone.trim(),category:leadType,customer_location:leadLocation.trim()||null,details:[leadMessage.trim(),`Source: ${leadSource}`].filter(Boolean).join('\n'),preferred_time:leadTime.trim()||null,status:'new'});
   setLeadBusy(false);if(error){alert(error.message);return}
   track("Lead Submitted",{surface:formSource,intent:"service",source:leadSource});
   const wa=`ROHILLA DRIVE REQUEST\n\nService: ${leadType}\n${leadMessage}\n\nName: ${leadName}\nPhone: ${leadPhone}\nLocation: ${leadLocation}\n${leadTime?`Preferred time: ${leadTime}\n`:''}\nRequest is also saved with ROHILLA DRIVE.`;
   resetLead();continueOnWhatsapp(wa);return;
  }
  const enquiryType=leadType==='new car purchase'?'new_car':leadType==='vehicle sale'||leadType==='car sale'?'sell_vehicle':'buy_vehicle';
  const {error}=await db.from('leads').insert({customer_name:leadName.trim(),customer_phone:leadPhone.trim(),requirement:leadType,message:[leadMessage.trim(),leadLocation.trim()?`Location: ${leadLocation.trim()}`:'',leadTime.trim()?`Preferred time: ${leadTime.trim()}`:''].filter(Boolean).join('\n'),status:'new',source:leadSource,enquiry_type:enquiryType,new_or_used:leadType==='new car purchase'?'new':'used'});
  setLeadBusy(false);if(error){alert(error.message);return}
  track("Lead Submitted",{surface:formSource,intent:enquiryType,source:leadSource});
  const wa=`ROHILLA DRIVE ENQUIRY\n\n${leadMessage}\n\nName: ${leadName}\nPhone: ${leadPhone}\nLocation: ${leadLocation}\n${leadTime?`Preferred time: ${leadTime}\n`:''}\nROHILLA DRIVE\n7015260003`;
  resetLead();continueOnWhatsapp(wa);
 }
 const services=[['🔍','Vehicle Inspection','vehicle inspection'],['💳','Finance Assistance','vehicle finance'],['🛡️','Insurance Assistance','insurance'],['📄','RC Transfer','RC / ownership transfer'],['🔧','Workshop / Repairs','workshop service'],['✨','Detailing','vehicle detailing'],['🚨','Roadside Assistance','RSA assistance'],['🔄','Exchange Assistance','vehicle exchange']];
 const socialLinks=<div className="socialIcons">
  <a href="https://www.instagram.com/rohillamultibrandcars/" target="_blank" rel="noreferrer" aria-label="Instagram" title="Instagram" className="instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg></a>
  <a href="https://www.facebook.com/profile.php?id=100094277025442" target="_blank" rel="noreferrer" aria-label="Facebook" title="Facebook" className="facebook"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 8h3V4h-3c-3.3 0-5 2-5 5v2H6v4h3v5h4v-5h3.2l.8-4H13V9c0-.7.3-1 1-1Z"/></svg></a>
  <a href="https://youtube.com/@sumitrohilla983" target="_blank" rel="noreferrer" aria-label="YouTube" title="YouTube" className="youtube"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.6 7.2a2.8 2.8 0 0 0-2-2C17.8 4.7 12 4.7 12 4.7s-5.8 0-7.6.5a2.8 2.8 0 0 0-2 2C1.9 9 1.9 12 1.9 12s0 3 .5 4.8a2.8 2.8 0 0 0 2 2c1.8.5 7.6.5 7.6.5s5.8 0 7.6-.5a2.8 2.8 0 0 0 2-2c.5-1.8.5-4.8.5-4.8s0-3-.5-4.8ZM10 15.5v-7l6 3.5-6 3.5Z"/></svg></a>
 </div>;
 return <main>
 <header>
  <div className="brand"><img className="rdLogo" src="/rohilla-drive-logo.svg" alt="Rohilla Drive"/><small>by Rohilla Multibrand Cars</small></div>
  <nav><a href="/inventory">Cars</a><a href="/sell-car-ambala">Sell Your Car</a><a href="#services">Services</a><a href="#about">About</a></nav>
  <div className="topActions"><a className="call" href="/verify">Verify Vehicle</a>{socialLinks}<button className="waTop" onClick={()=>whatsapp("Hello Rohilla Drive, I want to know about available cars.")}>WhatsApp</button></div>
 </header>

 <div className="publicAccessBar" data-no-translate>
  <span>For Automotive Businesses</span><a href="/business-hub">Business Hub</a><a href="/dealer">Dealer Sign In</a><a href="/partner">Partner Sign In</a>
 </div>

 <section className="hero"><div className="heroText">
  <span>ROHILLA DRIVE • BY ROHILLA MULTIBRAND CARS</span>
  <h1>Buy & Sell Cars in Ambala.<br/><span className="lifeLine">Simple enquiries. Clear vehicle details. Direct assistance.</span></h1>
  <p className="heroSub">Used Cars • Sell Your Car • New Car Enquiry • Vehicle Services</p>
  <p>Browse available cars or tell us exactly what you need. If the right car is not listed, send your requirement and our team will follow up.</p>
  <div className="search"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by brand, model, year or city..."/><select value={fuel} onChange={e=>setFuel(e.target.value)}><option>All</option><option>Petrol</option><option>Diesel</option><option>CNG</option><option>Electric</option><option>Hybrid</option></select><button onClick={browseInventory}>Search Cars</button></div>
 </div></section>

 <section className="section actionSection">
  <div className="primaryActions sixActions">
   <a href="/inventory"><span>🚘</span><b>Available Cars</b></a>
   <a href="/sell-car-ambala"><span>🏷️</span><b>Sell Your Car</b></a>
   <a href="/find-car-ambala"><span>🎯</span><b>Find a Car</b></a>
   <a href="/new-cars/ambala"><span>✨</span><b>New Car Enquiry</b></a>
  </div>
 </section>

 <section className="quickLead leadCapture" aria-label="Quick vehicle enquiry">
  <div className="quickLeadCopy"><span>QUICK ENQUIRY • AMBALA</span><h2>Tell us what you need</h2><p>Buying, selling or looking for vehicle assistance? Send the requirement once and we will follow up.</p><div className="quickLeadBtns"><a className="secondary" href="tel:7015260003" onClick={()=>track("Call Click",{surface:"homepage_quick_lead"})}>Call 7015260003</a><button type="button" className="secondary" onClick={()=>whatsapp("Hello Rohilla Drive, I have a vehicle requirement in Ambala.")}>WhatsApp</button></div></div>
  <form className="quickLeadForm" data-source="homepage_quick_lead" onSubmit={submitLead}>
   <select value={leadType} onChange={e=>{const type=e.target.value;setLeadType(type);setLeadMessage(type==='vehicle sale'?'I want to sell my car. Please contact me for the next steps.':type==='new car purchase'?'I am looking for a new car. Please help with model, price and availability.':type==='vehicle service'?'I need vehicle service / inspection assistance. Please contact me.':'I am looking for a used car. Please contact me with suitable options.')}} aria-label="Requirement type"><option value="vehicle purchase">Buy a Used Car</option><option value="vehicle sale">Sell My Car</option><option value="new car purchase">New Car Enquiry</option><option value="vehicle service">Vehicle Service / Inspection</option></select>
   <input value={leadName} onChange={e=>setLeadName(e.target.value)} placeholder="Your name" required/>
   <input value={leadPhone} onChange={e=>setLeadPhone(e.target.value)} placeholder="Mobile number" inputMode="tel" required/>
   <input value={leadLocation} onChange={e=>setLeadLocation(e.target.value)} placeholder="City / Location" required/>
   <textarea value={leadMessage} onChange={e=>setLeadMessage(e.target.value)} rows={3} placeholder="Car, budget or requirement" required/>
   <button type="submit" disabled={leadBusy}>{leadBusy?'Submitting…':'Send Enquiry & Continue on WhatsApp'}</button>
  </form>
 </section>

 <section className="section inventorySection" id="inventory">
  <div className="head"><div><h2>Cars Available Now</h2><p>{loading?"Loading available cars...":cars.length?"Latest published cars from Rohilla Drive. Open any listing for full details.":"No cars are published right now. Send your requirement and we will contact you with suitable options."}</p></div><div className="row"><button className="secondary" onClick={()=>openLead("vehicle purchase")}>Send Your Car Requirement</button><a className="textLink" href="/inventory">View All Cars →</a></div></div>
  {loading?<p>Loading cars...</p>:cars.length===0?<div className="card"><div className="body"><h3>Looking for a specific car?</h3><p>Tell us the model, budget and location. We will follow up with suitable options.</p><button onClick={()=>openLead("vehicle purchase")}>Send Requirement</button></div></div>:<div className="grid">{cars.map(car=>{const photos=[...(car.vehicle_photos||[])].sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));return <article className="card" key={car.id}><div className="photo real swipeGallery">{photos.length?photos.map((photo,index)=><img key={photo.url||index} src={photo.url} alt={`${car.brand} ${car.model} photo ${index+1}`}/>):<span>🚘</span>}</div>{photos.length>1&&<div className="swipeHint">← Swipe →</div>}<div className="body"><label>ROHILLA DRIVE</label><h3>{car.brand} {car.model}</h3>{car.variant&&<p>{car.variant}</p>}<small>{car.year} • {Number(car.km).toLocaleString("en-IN")} km • {car.fuel}{car.owner_count?` • ${car.owner_count} Owner`:""}</small><strong>₹{Number(car.asking_price).toLocaleString("en-IN")}</strong><a className="call" href={`/cars/${car.id}`} style={{display:"block",textAlign:"center",marginBottom:"10px"}}>View Details</a><button onClick={()=>openVehicleEnquiry(car)}>Enquire on WhatsApp</button></div></article>})}</div>}
 </section>

 <section className="section compactSection localSearchLinks" aria-label="Cars and vehicle services in Ambala">
  <div className="head compactHead"><div><h2>Cars & Vehicle Help in Ambala</h2><p>Quick access to the pages customers use most.</p></div></div>
  <div className="joinActions"><a href="/used-cars-ambala">Used Cars in Ambala</a><a href="/used-cars-under-5-lakh-ambala">Cars Under ₹5 Lakh</a><a href="/find-car-ambala">Find a Car</a><a href="/sell-car-ambala">Sell Your Car</a><a href="/verify">Vehicle Verification</a><a href="/car-services/ambala">Vehicle Services</a></div>
 </section>

 <section className="section compactSection" id="services">
  <div className="head compactHead"><div><h2>Vehicle Services</h2><p>Inspection, RC transfer, repairs, detailing and other assistance through Rohilla Drive.</p></div><div className="row"><a className="textLink" href="/car-services/ambala">View Vehicle Services →</a></div></div>
  <div className="compactServices">{services.map(s=><button key={s[1]} onClick={()=>openServiceLead(s[2])}><span>{s[0]}</span><b>{s[1]}</b></button>)}</div>
 </section>

 <section className="section actionSection">
  <a className="trustedAssistStrip" href="/trusted-assist"><span className="trustedIcon">🤝</span><span className="trustedCopy"><b>ROHILLA TRUSTED ASSIST</b><em>Vehicle assistance when you cannot manage it personally.</em><small>NRI / remote owners • Defence personnel • Senior citizens • Outstation support</small></span><span className="trustedCta">View Trusted Assist →</span></a>
  <div className="joinStrip"><div><b>Dealer or automotive service business?</b><span> Rohilla Drive also has dedicated business access for dealers and service partners.</span></div><div className="joinActions"><a href="/business-hub">Business Hub</a><a href="/join/preowned">Dealer Registration</a><a href="/join/partner">Service Partner Registration</a></div></div>
 </section>

 <section className="section dark compactAbout" id="about">
  <div className="about"><h2>ROHILLA DRIVE</h2><p className="brandPromise">Cars first. Vehicle assistance when you need it.</p><p>Rohilla Drive by Rohilla Multibrand Cars is based in Ambala City. The public website focuses first on buying and selling cars, with vehicle services and business-partner access available as supporting sections.</p><p><a className="call" href="/coverage">View Service Coverage</a></p></div>
 </section>

 <footer><img className="rdFooterLogo" src="/rohilla-drive-logo.svg" alt="Rohilla Drive"/><div className="footerCopy"><p>Buy • Sell • Vehicle Assistance<br/>by Rohilla Multibrand Cars • Ambala City</p><p><a className="premiumPhone" href="tel:7015260003" onClick={()=>track("Call Click",{surface:"homepage_footer"})}><span>CALL</span>7015260003</a></p><div className="footerSocial">{socialLinks}</div></div></footer>
 <button className="floatingWa" onClick={()=>whatsapp("Hello Rohilla Drive, I want to enquire about a car or vehicle service.")}>WhatsApp</button>
 {leadOpen&&<div className="overlay"><div className="modal"><button className="x" onClick={resetLead}>×</button><h2>{leadType==='new car purchase'?'New Car Enquiry':leadType==='vehicle purchase'?'Car Enquiry':leadType==='vehicle sale'?'Sell Your Car':leadType==='Rohilla Trusted Assist'?'Rohilla Trusted Assist':`Request ${leadType}`}</h2><p>{leadType==='Rohilla Trusted Assist'?"Tell us what needs to be managed. We will confirm the requirement with you before any work proceeds.":['vehicle purchase','vehicle sale','new car purchase'].includes(leadType)?(leadType==='new car purchase'?"Tell us the brand, model or budget you have in mind. We will help with available options.":"Tell us your requirement and our team will contact you."):"Your request is saved with Rohilla Drive and our team will coordinate the next step."}</p><form data-source="homepage_modal" onSubmit={submitLead}><input value={leadName} onChange={e=>setLeadName(e.target.value)} placeholder="Your name" required/><input value={leadPhone} onChange={e=>setLeadPhone(e.target.value)} placeholder="Mobile number" inputMode="tel" required/><input value={leadLocation} onChange={e=>setLeadLocation(e.target.value)} placeholder="City / Location" required/><input value={leadTime} onChange={e=>setLeadTime(e.target.value)} placeholder="Preferred time (optional)"/><textarea value={leadMessage} onChange={e=>setLeadMessage(e.target.value)} rows={5} required/><button type="submit" disabled={leadBusy}>{leadBusy?'Submitting…':'Save Enquiry & Continue on WhatsApp'}</button></form></div></div>}
 </main>
}
