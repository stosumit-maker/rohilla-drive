"use client";

import {useEffect,useState} from "react";
import {supabase} from "../../supabaseClient";

type Intake={
 brand:string;model:string;variant:string;year:string;fuel:string;transmission:string;owner_count:string;km:string;asking_price:string;city:string;features:string;registration_number:string;registration_source:string;registration_verified:boolean;ai_confidence:any;uncertainties:any[]
};
type ProcessedPhoto={original:File;publicFile:File;preview:string;plateDetected:boolean;plateMasked:boolean;detectedRegistration:string};

type OcrFacts={registration_number?:string;brand?:string;model?:string;variant?:string;year?:string;fuel?:string;transmission?:string;owner_count?:string};

const MODEL_BRAND:[string,string][]=[
 ["Innova Crysta","Toyota"],["Fortuner","Toyota"],["Glanza","Toyota"],["Hyryder","Toyota"],["Corolla Altis","Toyota"],
 ["Grand i10","Hyundai"],["Creta","Hyundai"],["Verna","Hyundai"],["Venue","Hyundai"],["Santro","Hyundai"],["Alcazar","Hyundai"],["i20","Hyundai"],
 ["Range Rover Evoque","Land Rover"],["Evoque","Land Rover"],["XUV700","Mahindra"],["XUV500","Mahindra"],["Scorpio","Mahindra"],["Thar","Mahindra"],["Bolero","Mahindra"],
 ["Harrier","Tata"],["Safari","Tata"],["Nexon","Tata"],["Punch","Tata"],["Altroz","Tata"],["Tiago","Tata"],
 ["Seltos","Kia"],["Sonet","Kia"],["Carens","Kia"],
 ["Swift","Maruti Suzuki"],["WagonR","Maruti Suzuki"],["Baleno","Maruti Suzuki"],["Brezza","Maruti Suzuki"],["Celerio","Maruti Suzuki"],["Ritz","Maruti Suzuki"],["Ertiga","Maruti Suzuki"],["Dzire","Maruti Suzuki"],
 ["Amaze","Honda"],["City","Honda"],["Elevate","Honda"],["WR-V","Honda"],["WRV","Honda"],
 ["EcoSport","Ford"],["Endeavour","Ford"],["Figo","Ford"],["Polo","Volkswagen"],["Virtus","Volkswagen"],["Taigun","Volkswagen"],
 ["Superb","Skoda"],["Octavia","Skoda"],["Slavia","Skoda"],["Kushaq","Skoda"],["C200","Mercedes-Benz"]
];
const BRANDS=["Maruti Suzuki","Hyundai","Mahindra","Tata","Toyota","Honda","Kia","Ford","Volkswagen","Skoda","Renault","Nissan","MG","Jeep","Mercedes-Benz","Mercedes","BMW","Audi","Land Rover","Range Rover"];
const empty:Intake={brand:"",model:"",variant:"",year:"",fuel:"",transmission:"",owner_count:"",km:"",asking_price:"",city:"Ambala City",features:"",registration_number:"",registration_source:"",registration_verified:false,ai_confidence:null,uncertainties:[]};

function compact(value:string){return value.toUpperCase().replace(/[^A-Z0-9]/g,"")}
function findRegistration(text:string){
 const x=compact(text);
 const bh=x.match(/\d{2}BH\d{4}[A-Z]{1,2}/);if(bh)return bh[0];
 const normal=x.match(/[A-Z]{2}\d{1,2}[A-Z]{1,3}\d{3,4}/);return normal?.[0]||"";
}
function registrationPrefix(value:string){
 const x=compact(value);const bh=x.match(/^(\d{2}BH)/);if(bh)return bh[1];const normal=x.match(/^([A-Z]{2}\d{1,2})/);return normal?.[1]||"";
}
function labelledYear(text:string){
 const m=text.match(/(?:REG(?:ISTRATION|N)?\.?\s*DATE|DATE\s*OF\s*REGISTRATION|MFG\.?\s*(?:YEAR|YR)|YEAR\s*OF\s*MANUFACTURE)[^0-9]{0,25}(20\d{2})/i);return m?.[1]||"";
}
function visibleFacts(text:string):OcrFacts{
 const out:OcrFacts={};const low=text.toLowerCase();const reg=findRegistration(text);if(reg)out.registration_number=reg;
 const year=labelledYear(text);if(year)out.year=year;
 if(/\bdiesel\b/i.test(text))out.fuel="Diesel";else if(/\bpetrol\b/i.test(text))out.fuel="Petrol";else if(/\bcng\b/i.test(text))out.fuel="CNG";else if(/\belectric\b|\bev\b/i.test(text))out.fuel="Electric";else if(/\bhybrid\b/i.test(text))out.fuel="Hybrid";
 if(/\bautomatic\b|\bauto\b|\bAT\b/.test(text))out.transmission="Automatic";else if(/\bmanual\b|\bMT\b/.test(text))out.transmission="Manual";
 const owner=text.match(/(?:OWNER\s*(?:SERIAL|SR\.?|S\/?NO\.?|NO\.?)?|OWNERSHIP)[^0-9]{0,18}([1-9])/i);if(owner)out.owner_count=owner[1];
 for(const [model,brand] of MODEL_BRAND){if(low.includes(model.toLowerCase())){out.model=model;out.brand=brand;break}}
 if(!out.brand){const b=BRANDS.find(x=>low.includes(x.toLowerCase()));if(b)out.brand=b==="Mercedes"?"Mercedes-Benz":b}
 return out;
}
function linesFromBlocks(blocks:any[]|null|undefined){
 const lines:any[]=[];for(const block of blocks||[])for(const paragraph of block?.paragraphs||[])for(const line of paragraph?.lines||[])lines.push(line);return lines;
}
async function toDataUrl(file:File){return new Promise<string>((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=()=>reject(r.error);r.readAsDataURL(file)})}
async function maskPhoto(file:File,boxes:any[],prefix:string){
 if(!boxes.length)return file;
 const url=URL.createObjectURL(file);
 try{
  const img=await new Promise<HTMLImageElement>((resolve,reject)=>{const x=new Image();x.onload=()=>resolve(x);x.onerror=reject;x.src=url});
  const canvas=document.createElement("canvas");canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;const ctx=canvas.getContext("2d");if(!ctx)return file;ctx.drawImage(img,0,0);
  for(const box of boxes){const pad=Math.max(6,Math.round((box.y1-box.y0)*.12));const x=Math.max(0,box.x0-pad),y=Math.max(0,box.y0-pad),w=Math.min(canvas.width-x,(box.x1-box.x0)+pad*2),h=Math.min(canvas.height-y,(box.y1-box.y0)+pad*2);ctx.fillStyle="#111827";ctx.fillRect(x,y,w,h);if(prefix){ctx.fillStyle="#ffffff";ctx.textAlign="center";ctx.textBaseline="middle";ctx.font=`700 ${Math.max(16,Math.floor(h*.55))}px Arial`;ctx.fillText(prefix,x+w/2,y+h/2,w*.9)}}
  const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,"image/jpeg",.93));if(!blob)return file;return new File([blob],`public-${file.name.replace(/\.[^.]+$/,"")}.jpg`,{type:"image/jpeg",lastModified:Date.now()});
 }finally{URL.revokeObjectURL(url)}
}
function cleanFeatures(value:any){if(Array.isArray(value))return value.filter(Boolean).join(" • ");return typeof value==="string"?value:""}
function cleanUncertainties(value:any){if(Array.isArray(value))return value.map(String).filter(Boolean);if(typeof value==="string"&&value.trim())return [value.trim()];return []}

export default function PhotoListingClient(){
 const db=supabase();const [ready,setReady]=useState(false);const [photos,setPhotos]=useState<File[]>([]);const [rcFile,setRcFile]=useState<File|null>(null);const [processed,setProcessed]=useState<ProcessedPhoto[]>([]);const [f,setF]=useState<Intake>(empty);const [busy,setBusy]=useState(false);const [progress,setProgress]=useState(0);const [msg,setMsg]=useState("");const [privacyConfirmed,setPrivacyConfirmed]=useState(false);const [aiState,setAiState]=useState<"unknown"|"available"|"unavailable">("unknown");
 useEffect(()=>{(async()=>{const {data:{session}}=await db.auth.getSession();if(!session){setMsg("Administrator sign-in is required.");return}const [{data:aal},{data:isAdmin}]=await Promise.all([db.auth.mfa.getAuthenticatorAssuranceLevel(),db.rpc("is_admin")]);if(aal?.currentLevel!=="aal2"||!isAdmin){setMsg("Administrator authentication is required.");return}setReady(true)})()},[]);
 useEffect(()=>()=>{for(const p of processed)URL.revokeObjectURL(p.preview)},[processed]);
 function update<K extends keyof Intake>(key:K,value:Intake[K]){setF(old=>({...old,[key]:value}))}
 function setVehiclePhotos(files:File[]){for(const p of processed)URL.revokeObjectURL(p.preview);setProcessed([]);setPrivacyConfirmed(false);setPhotos(files.slice(0,6));setMsg("")}
 async function analyse(){
  if(!photos.length){setMsg("Select at least one vehicle photo.");return}setBusy(true);setProgress(0);setMsg("Reading vehicle photos and protecting registration privacy…");
  let worker:any=null;let photoText="",rcText="";let photoFacts:OcrFacts={},rcFacts:OcrFacts={};const outputs:ProcessedPhoto[]=[];
  try{
   const T=await import("tesseract.js");worker=await T.createWorker("eng",1,{logger:(m:any)=>{if(m.status==="recognizing text")setProgress(Math.round((m.progress||0)*100))}});
   for(const file of photos){const ret=await worker.recognize(file,{}, {text:true,blocks:true});const text=String(ret?.data?.text||"");photoText+=`\n${text}`;const lines=linesFromBlocks(ret?.data?.blocks);const boxes:any[]=[];let detected="";for(const line of lines){const reg=findRegistration(String(line?.text||""));if(reg&&line?.bbox){detected=detected||reg;boxes.push(line.bbox)}}if(!detected)detected=findRegistration(text);const prefix=registrationPrefix(detected||f.registration_number);const publicFile=await maskPhoto(file,boxes,prefix);outputs.push({original:file,publicFile,preview:URL.createObjectURL(publicFile),plateDetected:Boolean(detected),plateMasked:boxes.length>0,detectedRegistration:detected})}
   if(rcFile){const ret=await worker.recognize(rcFile,{}, {text:true});rcText=String(ret?.data?.text||"")}
   photoFacts=visibleFacts(photoText);rcFacts=visibleFacts(rcText);
   const detectedReg=rcFacts.registration_number||photoFacts.registration_number||outputs.find(x=>x.detectedRegistration)?.detectedRegistration||"";
   setProcessed(outputs);setF(old=>({...old,brand:old.brand||rcFacts.brand||photoFacts.brand||"",model:old.model||rcFacts.model||photoFacts.model||"",variant:old.variant||rcFacts.variant||photoFacts.variant||"",year:old.year||rcFacts.year||photoFacts.year||"",fuel:old.fuel||rcFacts.fuel||photoFacts.fuel||"",transmission:old.transmission||rcFacts.transmission||photoFacts.transmission||"",owner_count:old.owner_count||rcFacts.owner_count||"",registration_number:old.registration_number||detectedReg,registration_source:old.registration_number?old.registration_source:(rcFacts.registration_number?"rc_ocr":detectedReg?"photo_ocr":"")}));
   try{
    const {data:{session}}=await db.auth.getSession();if(session){const images=await Promise.all(photos.map(toDataUrl));const r=await fetch("/api/ai/vehicle-understand",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${session.access_token}`},body:JSON.stringify({prompt:"Identify only clearly visible vehicle facts from these vehicle photos. Suggest brand, model, variant, likely model generation/year only when visually supportable, fuel/transmission only when supported, visible features, plate text if clearly readable, confidence and uncertainties. Never infer ownership or mileage from appearance. Return unknown fields as null.",images})});const j=await r.json();if(j.configured&&r.ok&&j.result&&!j.result.raw){setAiState("available");const a=j.result;setF(old=>({...old,brand:old.brand||a.brand||"",model:old.model||a.model||"",variant:old.variant||a.variant||"",year:old.year||String(a.year||""),fuel:old.fuel||a.fuel||"",transmission:old.transmission||a.transmission||"",features:old.features||cleanFeatures(a.features),registration_number:old.registration_number||findRegistration(String(a.plate_text||a.registration_hint||"")),registration_source:old.registration_source||(findRegistration(String(a.plate_text||a.registration_hint||""))?"photo_ai":""),ai_confidence:a.confidence??null,uncertainties:cleanUncertainties(a.uncertainties)}));}else setAiState("unavailable")}
   }catch{setAiState("unavailable")}
   const masked=outputs.filter(x=>x.plateMasked).length;setMsg(`Analysis ready. ${masked} of ${outputs.length} photo${outputs.length===1?"":"s"} had readable registration text automatically masked. Review every public preview before publishing.`);
  }catch(err:any){for(const p of outputs)URL.revokeObjectURL(p.preview);setMsg(err?.message||"Photo analysis failed.")}
  finally{if(worker)await worker.terminate().catch(()=>{});setBusy(false);setProgress(0)}
 }
 async function publish(e:React.FormEvent){
  e.preventDefault();if(!processed.length){setMsg("Run Auto-Fill & Privacy Review before publishing.");return}if(!privacyConfirmed){setMsg("Review the public photo previews and confirm registration privacy before publishing.");return}if(!f.brand.trim()||!f.model.trim()||!f.km||!f.asking_price){setMsg("Brand, model, odometer and asking price are required for a live listing.");return}
  const fullRegistration=compact(f.registration_number);const prefix=registrationPrefix(fullRegistration);if(fullRegistration&&!prefix){setMsg("Registration format could not be converted to a safe public prefix. Correct it or leave it blank.");return}
  setBusy(true);setMsg("Publishing reviewed vehicle listing…");
  const vehiclePayload:any={brand:f.brand.trim(),model:f.model.trim(),variant:f.variant.trim()||null,year:f.year?Number(f.year):null,km:Number(f.km),fuel:f.fuel.trim()||null,transmission:f.transmission.trim()||null,owner_count:f.owner_count?Number(f.owner_count):null,asking_price:Number(f.asking_price),city:f.city.trim()||"Ambala City",public_notes:f.features.trim()||"",status:"published",registration_prefix:prefix||null,metadata:{photo_first_intake:true,ai_confidence:f.ai_confidence??null,uncertainties:f.uncertainties||[],plate_privacy_confirmed:true,analysis_mode:aiState==="available"?"local_ocr_plus_ai":"local_ocr"}};
  const {data,error}=await db.from("vehicles").insert(vehiclePayload).select().single();if(error){setMsg(error.message);setBusy(false);return}
  try{
   if(fullRegistration||rcFile){const privatePayload:any={id:data.id,registration_number:fullRegistration||null,registration_source:f.registration_source||null,registration_verified:Boolean(f.registration_verified),rc_snapshot:{year:f.year?Number(f.year):null,fuel:f.fuel||null,transmission:f.transmission||null,owner_count:f.owner_count?Number(f.owner_count):null,variant:f.variant||null}};const priv=await db.from("vehicle_private").insert(privatePayload);if(priv.error)throw priv.error}
   for(let i=0;i<processed.length;i++){const file=processed[i].publicFile;const path=`${data.id}/${Date.now()}-${i}-${file.name.replace(/[^a-zA-Z0-9._-]/g,"")}`;const up=await db.storage.from("vehicle-photos").upload(path,file,{upsert:false});if(up.error)throw up.error;const url=db.storage.from("vehicle-photos").getPublicUrl(path).data.publicUrl;const ins=await db.from("vehicle_photos").insert({vehicle_id:data.id,url,path,sort_order:i});if(ins.error)throw ins.error}
   const media=(await db.from("vehicle_photos").select("url").eq("vehicle_id",data.id).order("sort_order")).data?.map((x:any)=>x.url)||[];await db.from("social_posts").insert(["instagram","facebook","youtube"].map(platform=>({vehicle_id:data.id,platform,caption:`${data.brand} ${data.model} ${data.variant||""} | ₹${data.asking_price||""}`,media_urls:media,status:"queued"})));
   await db.from("vehicle_events").insert({vehicle_id:data.id,event_type:"photo_first_listing_published",event_data:{registration_prefix:prefix||null,registration_source:f.registration_source||null,registration_verified:Boolean(f.registration_verified),ai_used:aiState==="available",privacy_confirmed:true}});
   setMsg(`Vehicle published successfully${prefix?` with public registration ${prefix}`:""}. Full registration remains private.`);for(const p of processed)URL.revokeObjectURL(p.preview);setPhotos([]);setRcFile(null);setProcessed([]);setPrivacyConfirmed(false);setAiState("unknown");setF(empty);
  }catch(err:any){await db.from("vehicles").update({status:"draft"}).eq("id",data.id);setMsg(`${err?.message||"Publishing failed"}. Vehicle retained as a draft and was not intentionally exposed as a live listing.`)}finally{setBusy(false)}
 }
 if(!ready)return <main><section className="section"><h1>Photo-First Listing</h1><p>{msg||"Checking administrator access…"}</p><a href="/admin">Back to Dashboard</a></section></main>;
 const prefix=registrationPrefix(f.registration_number);const maskedCount=processed.filter(x=>x.plateMasked).length;
 return <main>
  <header><div className="brand"><b>ROHILLA DRIVE</b><small>Photo-First Listing</small></div><div className="row"><a className="call" href="/admin/poster-scan">Listing Intake</a><a className="call" href="/admin">Back to Dashboard</a></div></header>
  <section className="hero"><div className="heroText"><span>UPLOAD • AUTO-FILL • PRIVACY • REVIEW • PUBLISH</span><h1>Publish a vehicle from photos with minimal typing.</h1><p>Upload vehicle photos, enter the odometer and asking price, optionally add an RC image for local extraction, then review the suggested details before publishing.</p></div></section>
  <section className="section"><div className="notice"><b>Privacy design:</b> Full registration is stored only in the private vehicle record. Public inventory receives only a safe prefix such as HR01. The RC image is processed locally in your browser and is not uploaded by this screen.</div><div className="notice"><b>Accuracy:</b> Brand/model/features may be suggested from photos when the connected AI provider is available. Exact ownership, RC validity and legal title are never inferred from appearance; owner/year suggestions should be confirmed from the RC or another authorised verification source.</div>
   <div className="adminForm"><label className="upload">Vehicle Photos (1–6)<input type="file" accept="image/*" multiple onChange={e=>setVehiclePhotos(Array.from(e.target.files||[]))}/></label><label className="upload">Optional RC Image — local OCR only<input type="file" accept="image/*" onChange={e=>setRcFile(e.target.files?.[0]||null)}/></label><button type="button" disabled={!photos.length||busy} onClick={analyse}>{busy?`Analysing… ${progress}%`:"Auto-Fill & Protect Number Plate"}</button></div>{photos.length>0&&<p>{photos.length} vehicle photo{photos.length===1?"":"s"} selected{rcFile?" • RC image selected":""}.</p>}{msg&&<div className="notice">{msg}</div>}
  </section>
  {processed.length>0&&<section className="section"><div className="head"><div><h2>Public Photo Privacy Preview</h2><p>{maskedCount} of {processed.length} photos had readable registration text automatically masked. A missed plate is still possible, so visual confirmation is required.</p></div></div><div className="grid">{processed.map((p,i)=><article className="card" key={`${p.original.name}-${i}`}><div className="photo real"><img src={p.preview} alt={`Public preview ${i+1}`}/></div><div className="body"><b>Photo {i+1}</b><p>{p.plateMasked?`Plate text masked${p.detectedRegistration?` • detected ${registrationPrefix(p.detectedRegistration)||"registration"}`:""}`:p.plateDetected?"Registration detected but no reliable mask box — inspect carefully.":"No readable plate text detected — inspect carefully."}</p></div></article>)}</div></section>}
  <section className="section"><h2>Review Vehicle Details</h2><form className="adminForm" onSubmit={publish}>
   <input required placeholder="Brand" value={f.brand} onChange={e=>update("brand",e.target.value)}/><input required placeholder="Model" value={f.model} onChange={e=>update("model",e.target.value)}/><input placeholder="Variant" value={f.variant} onChange={e=>update("variant",e.target.value)}/><input type="number" min="1990" max="2035" placeholder="Model Year" value={f.year} onChange={e=>update("year",e.target.value)}/>
   <input required type="number" min="0" placeholder="Odometer (km) — enter manually" value={f.km} onChange={e=>update("km",e.target.value)}/><input required type="number" min="0" placeholder="Asking Price (₹)" value={f.asking_price} onChange={e=>update("asking_price",e.target.value)}/><input placeholder="Fuel / Powertrain" value={f.fuel} onChange={e=>update("fuel",e.target.value)}/><input placeholder="Transmission" value={f.transmission} onChange={e=>update("transmission",e.target.value)}/><input type="number" min="1" max="9" placeholder="Number of Owners" value={f.owner_count} onChange={e=>update("owner_count",e.target.value)}/><input placeholder="City" value={f.city} onChange={e=>update("city",e.target.value)}/>
   <input placeholder="Full Registration — Admin only" value={f.registration_number} onChange={e=>setF(old=>({...old,registration_number:compact(e.target.value),registration_source:"manual"}))}/><input readOnly placeholder="Public Registration Prefix" value={prefix} title="Only this value is stored on the public vehicle row"/>
   <textarea placeholder="Visible Features / Public Description" value={f.features} onChange={e=>update("features",e.target.value)}/>
   <label style={{display:"flex",gap:10,alignItems:"flex-start",gridColumn:"1 / -1"}}><input type="checkbox" checked={f.registration_verified} onChange={e=>update("registration_verified",e.target.checked)} style={{width:18,height:18,marginTop:3}}/><span>I independently verified the full registration details from the RC or another authorised source.</span></label>
   {(f.ai_confidence!=null||f.uncertainties.length>0)&&<div className="notice" style={{gridColumn:"1 / -1"}}><b>AI review:</b> {f.ai_confidence!=null?`Confidence: ${typeof f.ai_confidence==="object"?JSON.stringify(f.ai_confidence):String(f.ai_confidence)}. `:""}{f.uncertainties.length?`Needs review: ${f.uncertainties.join(" • ")}`:"No specific uncertainty returned."}</div>}
   <label style={{display:"flex",gap:10,alignItems:"flex-start",gridColumn:"1 / -1"}}><input type="checkbox" required checked={privacyConfirmed} onChange={e=>setPrivacyConfirmed(e.target.checked)} style={{width:18,height:18,marginTop:3}}/><span>I reviewed every public photo preview and confirm that no full registration number or sensitive RC information is visible. Only the safe prefix may appear publicly.</span></label>
   <button disabled={busy||!processed.length}>{busy?"Publishing…":"Publish Reviewed Vehicle"}</button>
  </form></section>
 </main>;
}
