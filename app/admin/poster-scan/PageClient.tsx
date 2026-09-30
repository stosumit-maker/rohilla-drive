"use client";
import {useEffect,useState} from "react";
import {supabase} from "../../supabaseClient";

const MODEL_BRAND:[string,string][]=[
 ["Innova Crysta","Toyota"],["Corolla Altis","Toyota"],["Grand i10","Hyundai"],["Range Rover Evoque","Land Rover"],["XUV700","Mahindra"],["XUV500","Mahindra"],["Scorpio","Mahindra"],["Thar","Mahindra"],["Bolero","Mahindra"],["Harrier","Tata"],["Safari","Tata"],["Nexon","Tata"],["Punch","Tata"],["Altroz","Tata"],["Tiago","Tata"],["Creta","Hyundai"],["Verna","Hyundai"],["Venue","Hyundai"],["Santro","Hyundai"],["Alcazar","Hyundai"],["i20","Hyundai"],["Seltos","Kia"],["Sonet","Kia"],["Carens","Kia"],["Swift","Maruti Suzuki"],["WagonR","Maruti Suzuki"],["Baleno","Maruti Suzuki"],["Brezza","Maruti Suzuki"],["Celerio","Maruti Suzuki"],["Ritz","Maruti Suzuki"],["Ertiga","Maruti Suzuki"],["Dzire","Maruti Suzuki"],["Fortuner","Toyota"],["Glanza","Toyota"],["Hyryder","Toyota"],["Amaze","Honda"],["City","Honda"],["Elevate","Honda"],["WR-V","Honda"],["WRV","Honda"],["EcoSport","Ford"],["Endeavour","Ford"],["Figo","Ford"],["Polo","Volkswagen"],["Virtus","Volkswagen"],["Taigun","Volkswagen"],["Superb","Skoda"],["Octavia","Skoda"],["Slavia","Skoda"],["Kushaq","Skoda"],["C200","Mercedes-Benz"]
];
const BRANDS=["Maruti Suzuki","Hyundai","Mahindra","Tata","Toyota","Honda","Kia","Ford","Volkswagen","Skoda","Renault","Nissan","MG","Jeep","Mercedes-Benz","Mercedes","BMW","Audi","Land Rover","Range Rover"];
const num=(s:string)=>Number(s.replace(/[,\s]/g,""));
const compactRegistration=(s:string)=>s.toUpperCase().replace(/[^A-Z0-9]/g,"");
function findRegistration(text:string){
 const x=compactRegistration(text);
 const bh=x.match(/\d{2}BH\d{4}[A-Z]{1,2}/);if(bh)return bh[0];
 const normal=x.match(/[A-Z]{2}\d{1,2}[A-Z]{1,3}\d{3,4}/);return normal?.[0]||"";
}
function registrationPrefix(value:string){
 const x=compactRegistration(value);const bh=x.match(/^(\d{2}BH)/);if(bh)return bh[1];
 const normal=x.match(/^([A-Z]{2}\d{1,2})/);return normal?.[1]||"";
}
function parsePoster(raw:string){
 const text=raw.replace(/\r/g," ").replace(/[|•]/g," ");const low=text.toLowerCase();const out:any={notes:""};
 const ym=text.match(/\b(20(?:0\d|1\d|2\d))\b/);if(ym)out.year=ym[1];
 const lakhKm=text.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac)\s*(?:km|kms|kilomet)/i);if(lakhKm)out.km=String(Math.round(Number(lakhKm[1])*100000));else{const km=text.match(/(\d{1,3}(?:[,.]\d{3})+|\d{4,6})\s*(?:km|kms|kilometers?|kilometres?)/i);if(km)out.km=String(num(km[1].replace(/\./g,"")))}
 if(/\bdiesel\b/i.test(text))out.fuel="Diesel";else if(/\bpetrol\b/i.test(text))out.fuel="Petrol";else if(/\bcng\b/i.test(text))out.fuel="CNG";else if(/\belectric|\bev\b/i.test(text))out.fuel="Electric";else if(/\bhybrid\b/i.test(text))out.fuel="Hybrid";
 if(/\bautomatic\b|\bauto\b|\bAT\b/.test(text))out.transmission="Automatic";else if(/\bmanual\b|\bMT\b/.test(text))out.transmission="Manual";
 const owner=text.match(/\b([1-9])\s*(?:st|nd|rd|th)?\s*owner\b/i);if(owner)out.owner_count=owner[1];else if(/first owner/i.test(text))out.owner_count="1";else if(/second owner/i.test(text))out.owner_count="2";
 const pr=text.match(/(?:price|only|₹|rs\.?)[\s:=-]*₹?\s*(\d+(?:\.\d+)?)(?:\s*(lakh|lac|cr|crore))?/i);if(pr){let v=Number(pr[1]);const unit=(pr[2]||"").toLowerCase();if(unit.startsWith("cr"))v*=10000000;else if(unit||v<100)v*=100000;out.price=String(Math.round(v))}
 for(const [model,brand] of MODEL_BRAND){if(low.includes(model.toLowerCase())){out.model=model;out.brand=brand;break}}
 if(!out.brand){const b=BRANDS.find(x=>low.includes(x.toLowerCase()));if(b)out.brand=b==="Mercedes"?"Mercedes-Benz":b}
 const cityMatch=text.match(/\b(Ambala(?: City)?|Delhi|Gurugram|Gurgaon|Chandigarh|Panchkula|Yamunanagar|Kurukshetra|Karnal|Panipat|Sonipat|Rohtak|Mohali)\b/i);if(cityMatch)out.city=/ambala/i.test(cityMatch[1])?"Ambala City":cityMatch[1];
 const lines=raw.split(/\n+/).map(x=>x.trim()).filter(Boolean);if(out.model){const line=lines.find(x=>x.toLowerCase().includes(out.model.toLowerCase()));if(line){let rest=line.replace(new RegExp(out.brand||"","i"),"").replace(new RegExp(out.model,"i"),"").replace(/20\d{2}/g,"").replace(/[|•,-]+/g," ").trim();if(rest.length>1&&rest.length<40)out.variant=rest}}
 out.notes=lines.filter(x=>!/^\+?91?\s*\d{10}$/.test(x)).slice(0,8).join(" • ");return out;
}

function dataUrl(file:File){
 return new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result||""));reader.onerror=()=>reject(reader.error||new Error("Could not read image"));reader.readAsDataURL(file)});
}
function nonEmpty(v:any){return v!==null&&v!==undefined&&String(v).trim()!==""}
function mergeVisible(old:any,patch:any){
 const next={...old};
 for(const [key,value] of Object.entries(patch||{}))if(nonEmpty(value))next[key]=value;
 return next;
}
function aiPatch(result:any){
 const reg=findRegistration(String(result?.plate_text||result?.registration_hint||""));
 const features=Array.isArray(result?.features)?result.features.filter(Boolean).join(" • "):String(result?.features||"").trim();
 const note=String(result?.notes||"").trim();
 const notes=[features,note].filter(Boolean).join(" • ");
 return {
  brand:result?.brand,model:result?.model,variant:result?.variant,year:result?.year,km:result?.km,
  fuel:result?.fuel,transmission:result?.transmission,owner_count:result?.owner_count,price:result?.asking_price,
  city:result?.city,registration_number:reg||undefined,notes:notes||undefined
 };
}

export default function PosterScan(){
 const db=supabase();const [ready,setReady]=useState(false);const [poster,setPoster]=useState<File|null>(null);const [gallery,setGallery]=useState<File[]>([]);const [preview,setPreview]=useState("");const [ocrText,setOcrText]=useState("");const [progress,setProgress]=useState(0);const [busy,setBusy]=useState(false);const [msg,setMsg]=useState("");const [scanMethod,setScanMethod]=useState("");const [uncertainties,setUncertainties]=useState<string[]>([]);const [fieldConfidence,setFieldConfidence]=useState<Record<string,number>>({});const [f,setF]=useState<any>({status:"draft",city:"Ambala City"});
 useEffect(()=>{(async()=>{const {data:{session}}=await db.auth.getSession();if(!session){setMsg("Administrator sign-in is required.");return}const {data:aal}=await db.auth.mfa.getAuthenticatorAssuranceLevel();const {data:isAdmin}=await db.rpc("is_admin");if(aal?.currentLevel!=="aal2"||!isAdmin){setMsg("Administrator authentication is required.");return}setReady(true)})()},[]);
 function choose(file:File|null){
  setPoster(file);if(preview)URL.revokeObjectURL(preview);setPreview(file?URL.createObjectURL(file):"");setMsg("");setUncertainties([]);setFieldConfidence({});
  if(file)void scan(file);
 }
 async function scanOcr(file:File){
  setScanMethod("OCR fallback");setProgress(1);setMsg("AI read was unavailable. Reading visible poster text locally…");
  const T=await import("tesseract.js");
  const result=await T.recognize(file,"eng",{logger:(m:any)=>{if(m.status==="recognizing text")setProgress(Math.round((m.progress||0)*100))}});
  const text=result.data.text||"";setOcrText(text);const parsed=parsePoster(text);
  setF((old:any)=>mergeVisible(old,parsed));
  const warn:string[]=[];if(!parsed.city)warn.push("city: not visible — confirm Ambala City or enter the correct location");if(!parsed.price)warn.push("price: not confidently detected");if(!parsed.variant)warn.push("variant: check manually if it is not clear");
  setUncertainties(warn);setFieldConfidence({});setMsg("Poster read with OCR fallback. Review highlighted / uncertain fields before saving.");
 }
 async function scan(fileArg?:File|null){
  const file=fileArg||poster;if(!file)return;setBusy(true);setProgress(0);setMsg("Reading poster with vehicle AI…");
  try{
   const {data:{session}}=await db.auth.getSession();if(!session?.access_token)throw new Error("Administrator session expired");
   const image=await dataUrl(file);
   const res=await fetch("/api/ai/vehicle-understand",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${session.access_token}`},body:JSON.stringify({
    images:[image],
    prompt:"Read this used-car sale poster/listing image and extract only facts clearly visible on it. Treat V, VX, VXi, ZXi, EX, SX, HTX, RXT and similar text as possible variants, never cities. Treat Petrol, Diesel and CNG as fuel, never cities. If location/city is not explicitly visible, return city null. Read asking price, kilometres, owner count and registration only when clearly visible."
   })});
   const body=await res.json();
   if(!res.ok||!body?.result||body.result?.raw)throw new Error(body?.error||"AI extraction did not return structured fields");
   const result=body.result;setF((old:any)=>mergeVisible(old,aiPatch(result)));setScanMethod("Vehicle AI");
   const fc:Record<string,number>={};if(result.field_confidence&&typeof result.field_confidence==="object")for(const [k,v] of Object.entries(result.field_confidence)){const n=Number(v);if(Number.isFinite(n))fc[k]=n}setFieldConfidence(fc);
   const warn=(Array.isArray(result.uncertainties)?result.uncertainties.map((x:any)=>String(x)):[]);if(!result.city)warn.push("city: not visible — confirm Ambala City or enter the correct location");setUncertainties(Array.from(new Set(warn)));
   const extracted=Object.values(aiPatch(result)).filter(nonEmpty).length;setMsg(`Vehicle AI filled ${extracted} visible details. Review any uncertain fields, then save or publish.`);
  }catch(e:any){
   try{await scanOcr(file)}catch(ocr:any){setMsg(`Poster reading failed: ${ocr?.message||e?.message||"Unknown error"}. Paste listing text below and select Parse Listing Text.`)}
  }finally{setBusy(false)}
 }
 function parseTyped(){const parsed=parsePoster(ocrText);setF((old:any)=>mergeVisible(old,parsed));setScanMethod("Pasted text");setUncertainties(!parsed.city?["city: not found in pasted text — confirm location"]:[]);setFieldConfidence({});setMsg("Listing text parsed. Existing entered values were preserved unless a visible value was found.");}
 function needsReview(name:string){
  const aliases:Record<string,string[]>={
   brand:["brand"],model:["model"],variant:["variant","trim"],year:["year","model year"],km:["km","mileage","odometer"],fuel:["fuel"],transmission:["transmission"],owner_count:["owner","ownership"],price:["price","asking_price"],city:["city","location"],registration_number:["registration","plate"]
  };
  const confidenceKey=name==="price"?"asking_price":name==="registration_number"?"plate_text":name;
  if(fieldConfidence[confidenceKey]!==undefined&&fieldConfidence[confidenceKey]<0.75)return true;
  const terms=aliases[name]||[name];return uncertainties.some(x=>terms.some(t=>x.toLowerCase().includes(t)));
 }
 function reviewStyle(name:string){return needsReview(name)?{outline:"2px solid rgba(217,119,6,.6)",outlineOffset:"1px"}:undefined}
 async function upload(vehicleId:string,files:File[],targetStatus:string){const bucket=targetStatus==="published"?"vehicle-photos":"vehicle-draft-photos";for(let i=0;i<files.length;i++){const file=files[i];const path=`${vehicleId}/${Date.now()}-${i}-${file.name.replace(/[^a-zA-Z0-9._-]/g,"")}`;const up=await db.storage.from(bucket).upload(path,file,{upsert:false});if(up.error)throw up.error;const url=bucket==="vehicle-photos"?db.storage.from(bucket).getPublicUrl(path).data.publicUrl:"";const ins=await db.from("vehicle_photos").insert({vehicle_id:vehicleId,url,path,sort_order:i,storage_bucket:bucket});if(ins.error){await db.storage.from(bucket).remove([path]);throw ins.error}}}
 async function save(e:React.FormEvent){e.preventDefault();if(!poster&&gallery.length===0){setMsg("Select at least one image.");return}setBusy(true);setMsg("Saving vehicle record…");const targetStatus=f.status||"draft";const fullRegistration=compactRegistration(f.registration_number||"");const prefix=registrationPrefix(fullRegistration);
 const payload:any={brand:f.brand,model:f.model,variant:f.variant||null,year:f.year?Number(f.year):null,km:f.km?Number(f.km):null,fuel:f.fuel||null,transmission:f.transmission||null,owner_count:f.owner_count?Number(f.owner_count):null,asking_price:f.price?Number(f.price):null,city:f.city||"Ambala City",public_notes:f.notes||"",registration_prefix:prefix||null,status:targetStatus};const {data,error}=await db.from("vehicles").insert(payload).select().single();if(error){setMsg(error.message);setBusy(false);return}try{if(fullRegistration){const priv=await db.from("vehicle_private").insert({id:data.id,registration_number:fullRegistration,registration_source:"listing_text",registration_verified:false});if(priv.error)throw priv.error}const files=[...(poster?[poster]:[]),...gallery.filter(x=>x!==poster)];await upload(data.id,files,targetStatus);await db.from("vehicle_events").insert({vehicle_id:data.id,event_type:"poster_scan_created",event_data:{ocr_used:Boolean(ocrText),scan_method:scanMethod||"manual",uncertainties,status:payload.status,media_storage:targetStatus==="published"?"public":"private_draft"}});if(payload.status==="published"){const media=(await db.from("vehicle_photos").select("url").eq("vehicle_id",data.id).order("sort_order")).data?.map((x:any)=>x.url).filter(Boolean)||[];await db.from("social_posts").insert(["instagram","facebook","youtube"].map(platform=>({vehicle_id:data.id,platform,caption:`${data.brand} ${data.model} ${data.variant||""} | ₹${data.asking_price||""}`,media_urls:media,status:"queued"})))}setMsg(payload.status==="published"?"Vehicle published successfully.":"Vehicle saved as a private-media draft. Use Draft Review when it is ready to go live.");setF({status:"draft",city:"Ambala City"});setPoster(null);setGallery([]);setOcrText("");setPreview("");setScanMethod("");setUncertainties([]);setFieldConfidence({})}catch(err:any){await db.from("vehicles").update({status:"draft"}).eq("id",data.id);setMsg(err?.message||"Photo upload failed. Vehicle retained as a draft.")}finally{setBusy(false)}}
 if(!ready)return <main><section className="section"><h1>Listing Intake</h1><p>{msg||"Checking administrator access…"}</p><a href="/admin">Back to Dashboard</a></section></main>;
 return <main><header><div className="brand"><b>ROHILLA DRIVE</b><small>Listing Intake</small></div><div className="row"><a className="call" href="/admin/draft-review">Draft Review</a><a className="call" href="/admin">Back to Dashboard</a><a className="call" href="/admin/finance">Transactions & RC</a></div></header><section className="section"><h1>Upload Poster → Auto-Fill Vehicle Details</h1><p>Choose a sale poster or listing image. Vehicle AI reads visible details automatically, fills the form and flags uncertain fields for confirmation. Existing typed values are never cleared by a scan.</p><div className="adminForm"><label className="upload">Listing Image / First Vehicle Photo<input accept="image/*" type="file" onChange={e=>choose(e.target.files?.[0]||null)}/></label>{preview&&<img src={preview} alt="Listing preview" style={{maxWidth:320,width:"100%",borderRadius:14}}/>}<button type="button" disabled={!poster||busy} onClick={()=>scan()}>{busy?(progress?`Reading… ${progress}%`:"Reading with AI…"):"Read Poster Again"}</button><textarea placeholder="Extracted or Pasted Listing Text" value={ocrText} onChange={e=>setOcrText(e.target.value)} style={{minHeight:120}}/><button disabled={!ocrText||busy} onClick={parseTyped}>Parse Listing Text</button></div>{msg&&<p>{msg}</p>}{scanMethod&&<div className="notice"><b>Read method:</b> {scanMethod}{uncertainties.length>0&&<><br/><b>Confirm:</b> {uncertainties.join(" • ")}</>}</div>}</section><section className="section"><h2>Review Vehicle Details</h2><form className="adminForm" onSubmit={save}><input required style={reviewStyle("brand")} placeholder="Brand" value={f.brand||""} onChange={e=>setF({...f,brand:e.target.value})}/><input required style={reviewStyle("model")} placeholder="Model" value={f.model||""} onChange={e=>setF({...f,model:e.target.value})}/><input style={reviewStyle("variant")} placeholder="Variant" value={f.variant||""} onChange={e=>setF({...f,variant:e.target.value})}/><input style={reviewStyle("year")} type="number" placeholder="Model Year" value={f.year||""} onChange={e=>setF({...f,year:e.target.value})}/><input style={reviewStyle("km")} type="number" placeholder="Odometer (km)" value={f.km||""} onChange={e=>setF({...f,km:e.target.value})}/><input style={reviewStyle("fuel")} placeholder="Fuel / Powertrain" value={f.fuel||""} onChange={e=>setF({...f,fuel:e.target.value})}/><input style={reviewStyle("transmission")} placeholder="Transmission" value={f.transmission||""} onChange={e=>setF({...f,transmission:e.target.value})}/><input style={reviewStyle("owner_count")} type="number" placeholder="Number of Owners" value={f.owner_count||""} onChange={e=>setF({...f,owner_count:e.target.value})}/><input style={reviewStyle("price")} type="number" placeholder="Asking Price (₹)" value={f.price??""} onChange={e=>setF((old:any)=>({...old,price:e.target.value}))}/><input style={reviewStyle("city")} placeholder="City" value={f.city||""} onChange={e=>setF({...f,city:e.target.value})}/>{f.registration_number&&<div className="notice" style={{gridColumn:"1 / -1"}}><b>Registration detected automatically:</b> {registrationPrefix(f.registration_number)||"Detected"} • full number stays private.</div>}<textarea placeholder="Description / Features / Condition" value={f.notes||""} onChange={e=>setF({...f,notes:e.target.value})}/><label className="upload">Additional Vehicle Photos<input multiple accept="image/*" type="file" onChange={e=>setGallery(Array.from(e.target.files||[]))}/></label><select value={f.status||"draft"} onChange={e=>setF({...f,status:e.target.value})}><option value="draft">Save as Private Draft</option><option value="published">Publish after review</option></select><button disabled={busy}>{busy?"Saving…":f.status==="published"?"Publish Vehicle":"Save Private Draft"}</button></form></section></main>
}
