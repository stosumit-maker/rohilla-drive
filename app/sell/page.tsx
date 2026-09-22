"use client";
import {useRef,useState} from "react";
import {supabase} from "../supabaseClient";
import LegalConsent from "../components/LegalConsent";
import {newRequestReference} from "../lib/reference";

const MAX_PHOTOS=8;
const MAX_PHOTO_BYTES=8*1024*1024;
const ALLOWED_PHOTO_TYPES=new Set(["image/jpeg","image/png","image/webp","image/heic","image/heif"]);
const extFor=(file:File)=>({"image/jpeg":"jpg","image/png":"png","image/webp":"webp","image/heic":"heic","image/heif":"heif"}[file.type]||"jpg");
const uuid=()=>typeof crypto!=="undefined"&&"randomUUID" in crypto?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}`;


const cleanRegistration=(value:any)=>String(value||"").toUpperCase().replace(/[^A-Z0-9]/g,"");
const registrationPrefix=(value:any)=>{const s=cleanRegistration(value);return s.match(/^[A-Z]{2}\d{1,2}/)?.[0]||s.match(/^\d{2}BH/)?.[0]||""};
async function hashRegistration(value:any){const s=cleanRegistration(value);const bytes=new TextEncoder().encode(s);const digest=await crypto.subtle.digest("SHA-256",bytes);return Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,"0")).join("")}

export default function SellVehicle(){
 const db=supabase();
 const [f,setF]=useState<any>({vehicle_type:"car_suv",city:"Ambala City"});
 const [photos,setPhotos]=useState<File[]>([]);
 const [busy,setBusy]=useState(false);
 const [msg,setMsg]=useState("");
 const submitLock=useRef(false);const [progress,setProgress]=useState("");

 function choosePhotos(list:File[]){
  const selected=list.slice(0,MAX_PHOTOS);
  const badType=selected.find(file=>!ALLOWED_PHOTO_TYPES.has(file.type));
  const tooLarge=selected.find(file=>file.size>MAX_PHOTO_BYTES);
  if(list.length>MAX_PHOTOS){setMsg(`Please choose up to ${MAX_PHOTOS} photos.`);return}
  if(badType){setMsg("Use JPG, PNG, WEBP, HEIC or HEIF vehicle photos only.");return}
  if(tooLarge){setMsg("Each photo must be 8 MB or smaller.");return}
  setPhotos(selected);setMsg(selected.length?`${selected.length} photo(s) selected. They will remain private until ROHILLA DRIVE reviews your request.`:"");
 }

 async function submit(e:React.FormEvent){
  e.preventDefault();if(submitLock.current)return;
  if(!photos.length){setMsg("Please add at least one clear vehicle photo.");return}
  if(!cleanRegistration(f.registration_number)){setMsg("Please enter the full registration number. Only the starting code will ever be shown publicly.");return}
  submitLock.current=true;setBusy(true);setProgress("Checking duplicate vehicle…");setMsg("Submitting once — duplicate protection is active.");
  const ref=newRequestReference("RDS");
  const token=uuid();
  const regHash=await hashRegistration(f.registration_number);const regPrefix=registrationPrefix(f.registration_number);
  const paths=photos.map((file,index)=>`${token}/${String(index+1).padStart(2,"0")}-${uuid()}.${extFor(file)}`);
  const details=[
   `Reference: ${ref}`,
   `Vehicle: ${f.year||""} ${f.brand||""} ${f.model||""} ${f.variant||""}`.trim(),
   f.km?`KM: ${f.km}`:"",
   f.fuel?`Fuel: ${f.fuel}`:"",
   f.transmission?`Transmission: ${f.transmission}`:"",
   f.owner_count?`Owner: ${f.owner_count}`:"",
   f.expected_price?`Expected price: ₹${Number(f.expected_price).toLocaleString("en-IN")}`:"",
   regPrefix?`Registration prefix: ${regPrefix}`:"",
   `${photos.length} private seller photo(s) attached for review.`,
   f.notes||""
  ].filter(Boolean).join("\n");

  const {error}=await db.from("leads").insert({
   customer_name:f.name,
   customer_phone:f.phone,
   requirement:"Sell / List Vehicle",
   message:details,
   status:"new",
   source:"customer_sell_page",
   enquiry_type:"sell_vehicle",
   new_or_used:"used",
   vehicle_type:f.vehicle_type,
   customer_city:f.city||null,
   preferred_brand:f.brand||null,
   preferred_model:f.model||null,
   budget:f.expected_price?Number(f.expected_price):null,
   public_reference:ref,
   submission_token:token,
   private_media_paths:paths,
   vehicle_registration_fingerprint:regHash,
   registration_prefix:regPrefix||null
  });
  if(error){submitLock.current=false;setBusy(false);setProgress("");setMsg((error as any)?.code==="23505"?"This vehicle is already submitted or under review. Duplicate request blocked.":error.message);return}

  let uploaded=0;
  let uploadError="";
  const batchSize=3;
  for(let i=0;i<photos.length;i+=batchSize){
   const batch=photos.slice(i,i+batchSize);
   const results=await Promise.all(batch.map(async(file,j)=>{const index=i+j;const result=await db.storage.from("seller-submission-photos").upload(paths[index],file,{upsert:false,contentType:file.type});if(!result.error){uploaded++;setProgress("Uploading photos "+uploaded+"/"+photos.length)}return result}));
   const failed=results.find(r=>r.error);if(failed?.error){uploadError=failed.error.message;break}
  }

  submitLock.current=false;setBusy(false);setProgress("");
  if(uploadError){
   setMsg(`Vehicle request saved ✓ Reference: ${ref}. ${uploaded}/${photos.length} photo(s) uploaded. ROHILLA DRIVE has your request and can contact you if another photo is needed.`);
   return;
  }
  setMsg(`Vehicle request submitted ✓ Reference: ${ref}. ${uploaded} photo(s) received privately for review.`);
  setF({vehicle_type:"car_suv",city:f.city||"Ambala City"});
  setPhotos([]);
 }

 return <main>
  <header><div className="brand"><b>ROHILLA DRIVE</b><small>Sell / List Your Vehicle</small></div><div className="row"><a className="call" href="/assistant">Ask Rohilla AI</a><a className="call" href="/business-hub">Business Hub</a></div></header>
  <section className="hero"><div className="heroText"><span>INDIVIDUAL SELLER</span><h1>Sell or list your vehicle with Rohilla Drive.</h1><p>No dealer account is needed for a personal vehicle. Share the details and clear photos once so ROHILLA DRIVE can review the vehicle and coordinate relevant enquiries.</p></div></section>
  <section className="section"><div className="notice"><b>Before you submit:</b> Please provide accurate ownership, mileage, condition and document details and confirm that you have the right to sell the vehicle. Seller photos are stored privately for review and are not made public automatically. Final price and transaction decisions remain with the seller and buyer.</div></section>
  <section className="section"><form className="adminForm" onSubmit={submit}>
   <input required placeholder="Your name" value={f.name||""} onChange={e=>setF({...f,name:e.target.value})}/>
   <input required placeholder="Mobile / WhatsApp number" value={f.phone||""} onChange={e=>setF({...f,phone:e.target.value})}/>
   <select value={f.vehicle_type} onChange={e=>setF({...f,vehicle_type:e.target.value})}><option value="car_suv">Car / SUV</option><option value="two_wheeler">Two-Wheeler</option><option value="commercial">Commercial Vehicle</option><option value="tractor_agri">Tractor / Agriculture</option><option value="ev">Electric Vehicle</option><option value="other">Other Automobile</option></select>
   <input required placeholder="Brand" value={f.brand||""} onChange={e=>setF({...f,brand:e.target.value})}/>
   <input required placeholder="Model" value={f.model||""} onChange={e=>setF({...f,model:e.target.value})}/>
   <input placeholder="Variant" value={f.variant||""} onChange={e=>setF({...f,variant:e.target.value})}/>
   <input type="number" required placeholder="Year" value={f.year||""} onChange={e=>setF({...f,year:e.target.value})}/>
   <input type="number" placeholder="KM driven" value={f.km||""} onChange={e=>setF({...f,km:e.target.value})}/>
   <input placeholder="Fuel / powertrain" value={f.fuel||""} onChange={e=>setF({...f,fuel:e.target.value})}/>
   <input placeholder="Transmission" value={f.transmission||""} onChange={e=>setF({...f,transmission:e.target.value})}/>
   <input type="number" placeholder="Owner count" value={f.owner_count||""} onChange={e=>setF({...f,owner_count:e.target.value})}/>
   <input type="number" placeholder="Expected price ₹" value={f.expected_price||""} onChange={e=>setF({...f,expected_price:e.target.value})}/>
   <input required placeholder="City" value={f.city||""} onChange={e=>setF({...f,city:e.target.value})}/>
   <input required placeholder="Full registration number (kept private; public shows only HR01 / DL01)" value={f.registration_number||""} onChange={e=>setF({...f,registration_number:e.target.value})}/>
   <textarea placeholder="Condition, insurance, service history, features or anything important" value={f.notes||""} onChange={e=>setF({...f,notes:e.target.value})}/>
   <label className="upload">Vehicle Photos — 1 to {MAX_PHOTOS}<input required multiple accept="image/jpeg,image/png,image/webp,image/heic,image/heif" type="file" onChange={e=>choosePhotos(Array.from(e.target.files||[]))}/></label>
   {photos.length>0&&<small>{photos.length} selected • max 8 MB each • private until reviewed</small>}
   <LegalConsent/>
   {busy&&<div className="notice">{progress||"Submitting securely…"} Please do not tap Submit again.</div>}<button disabled={busy}>{busy?"Submitting…":"Submit Vehicle & Private Photos"}</button>
  </form>{msg&&<div className="notice">{msg}</div>}<div className="notice"><b>Dealer or automotive business?</b> <a href="/business-hub">Open Rohilla Business Hub →</a></div></section>
 </main>
}
