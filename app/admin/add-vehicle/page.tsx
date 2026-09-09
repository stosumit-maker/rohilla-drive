"use client";
import {useEffect,useState} from "react";
import {supabase} from "../../supabaseClient";

const vehicleTypes=[
 ["car","Car / SUV"],
 ["two_wheeler","Two-Wheeler"],
 ["commercial","Commercial Vehicle"],
 ["tractor_agri","Tractor / Agriculture"],
 ["ev","Electric Vehicle"],
 ["fleet","Fleet / Corporate Vehicle"],
 ["other","Other Automobile"]
] as const;
const numOrNull=(v:any)=>v===""||v===undefined||v===null?null:Number(v);

export default function AdminAddVehicle(){
 const db=supabase();
 const [ready,setReady]=useState(false),[msg,setMsg]=useState("Checking administration access…"),[busy,setBusy]=useState(false),[files,setFiles]=useState<File[]>([]);
 const [f,setF]=useState<any>({vehicle_type:"car",status:"draft"});
 useEffect(()=>{gate()},[]);
 async function gate(){
  const {data:{session}}=await db.auth.getSession();
  if(!session){setMsg("Administration sign-in required.");return}
  const [{data:aal},{data:isAdmin}]=await Promise.all([db.auth.mfa.getAuthenticatorAssuranceLevel(),db.rpc("is_admin")]);
  if(aal?.currentLevel!=="aal2"||!isAdmin){setMsg("Administrator authentication and Authenticator verification are required.");return}
  setReady(true);setMsg("");
 }
 async function uploadPhotos(vehicleId:string,chosen:File[]){
  for(let n=0;n<chosen.length;n++){
   const file=chosen[n];
   const path=`${vehicleId}/${Date.now()}-${n}-${file.name.replace(/[^a-zA-Z0-9._-]/g,"")}`;
   const up=await db.storage.from("vehicle-photos").upload(path,file,{upsert:false});
   if(up.error)throw new Error(up.error.message);
   const pub=db.storage.from("vehicle-photos").getPublicUrl(path).data.publicUrl;
   const {error}=await db.from("vehicle_photos").insert({vehicle_id:vehicleId,url:pub,sort_order:n,path});
   if(error)throw new Error(error.message);
  }
 }
 async function add(e:React.FormEvent){
  e.preventDefault();if(!files.length){setMsg("Add at least one vehicle photo.");return}
  setBusy(true);setMsg("Creating draft record and uploading media…");
  const payload:any={
   vehicle_type:f.vehicle_type||"car",brand:f.brand?.trim(),model:f.model?.trim(),variant:f.variant?.trim()||null,
   year:numOrNull(f.year),km:numOrNull(f.km),fuel:f.fuel?.trim()||null,transmission:f.transmission?.trim()||null,
   owner_count:numOrNull(f.owner_count),asking_price:numOrNull(f.price),city:f.city?.trim()||null,public_notes:f.notes?.trim()||"",
   body_type:f.body_type?.trim()||null,registration_class:f.registration_class?.trim()||null,engine_cc:numOrNull(f.engine_cc),
   seating_capacity:numOrNull(f.seating_capacity),payload_kg:numOrNull(f.payload_kg),gross_vehicle_weight_kg:numOrNull(f.gross_vehicle_weight_kg),
   axle_count:numOrNull(f.axle_count),permit_type:f.permit_type?.trim()||null,fitness_valid_till:f.fitness_valid_till||null,
   battery_kwh:numOrNull(f.battery_kwh),range_km:numOrNull(f.range_km),status:"draft"
  };
  const {data,error}=await db.from("vehicles").insert(payload).select("id").single();
  if(error){setBusy(false);setMsg(error.message);return}
  try{
   await uploadPhotos(data.id,files);
   if(f.status==="published"){
    const published=await db.from("vehicles").update({status:"published"}).eq("id",data.id);
    if(published.error)throw new Error(published.error.message);
   }
   setF({vehicle_type:"car",status:"draft"});setFiles([]);setBusy(false);
   setMsg(f.status==="published"?"Vehicle published successfully.":"Vehicle saved as draft.");
  }catch(err:any){
   setBusy(false);setMsg(`${err?.message||"Photo upload failed."} The vehicle remains in draft and is not publicly visible.`);
  }
 }
 if(!ready)return <main className="section"><h1>Inventory Management</h1><p>{msg}</p><a className="call" href="/admin">Administration Dashboard</a></main>;
 const commercial=["commercial","fleet"].includes(f.vehicle_type);
 return <main>
  <section className="hero" style={{paddingTop:36,paddingBottom:36}}><div className="heroText"><span>ROHILLA DRIVE • ADMINISTRATION</span><h1>Inventory Publishing</h1><p>Manage cars, two-wheelers, commercial vehicles, tractors and agriculture vehicles, EVs and fleet inventory through one controlled publishing workflow.</p></div></section>
  <section className="section" style={{paddingTop:24}}><div className="head"><div><h2>Create Vehicle Record</h2><p>Every vehicle begins as a draft. Public visibility is enabled only after the selected media has uploaded successfully.</p></div><a className="call" href="/admin">Administration Dashboard</a></div>
   <form className="adminForm" onSubmit={add}>
    <select required value={f.vehicle_type||"car"} onChange={e=>setF({...f,vehicle_type:e.target.value})}>{vehicleTypes.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select>
    <input required placeholder="Brand" value={f.brand||""} onChange={e=>setF({...f,brand:e.target.value})}/>
    <input required placeholder="Model" value={f.model||""} onChange={e=>setF({...f,model:e.target.value})}/>
    <input placeholder="Variant" value={f.variant||""} onChange={e=>setF({...f,variant:e.target.value})}/>
    <input type="number" min="1900" max="2100" placeholder="Year" value={f.year||""} onChange={e=>setF({...f,year:e.target.value})}/>
    <input type="number" min="0" placeholder="Odometer / running (km)" value={f.km||""} onChange={e=>setF({...f,km:e.target.value})}/>
    <input placeholder="Fuel / powertrain" value={f.fuel||""} onChange={e=>setF({...f,fuel:e.target.value})}/>
    <input placeholder="Transmission" value={f.transmission||""} onChange={e=>setF({...f,transmission:e.target.value})}/>
    <input placeholder="Body type" value={f.body_type||""} onChange={e=>setF({...f,body_type:e.target.value})}/>
    <input type="number" min="0" placeholder="Previous owners" value={f.owner_count||""} onChange={e=>setF({...f,owner_count:e.target.value})}/>
    <input type="number" min="0" step="1" placeholder="Asking price ₹" value={f.price||""} onChange={e=>setF({...f,price:e.target.value})}/>
    <input placeholder="City" value={f.city||""} onChange={e=>setF({...f,city:e.target.value})}/>
    <input placeholder="Registration class (private / commercial)" value={f.registration_class||""} onChange={e=>setF({...f,registration_class:e.target.value})}/>
    <input type="number" min="0" placeholder="Engine capacity (cc, if applicable)" value={f.engine_cc||""} onChange={e=>setF({...f,engine_cc:e.target.value})}/>
    <input type="number" min="0" placeholder="Seating capacity" value={f.seating_capacity||""} onChange={e=>setF({...f,seating_capacity:e.target.value})}/>
    {commercial&&<>
     <input type="number" min="0" placeholder="Payload (kg)" value={f.payload_kg||""} onChange={e=>setF({...f,payload_kg:e.target.value})}/>
     <input type="number" min="0" placeholder="Gross vehicle weight (kg)" value={f.gross_vehicle_weight_kg||""} onChange={e=>setF({...f,gross_vehicle_weight_kg:e.target.value})}/>
     <input type="number" min="0" placeholder="Axle count" value={f.axle_count||""} onChange={e=>setF({...f,axle_count:e.target.value})}/>
     <input placeholder="Permit type" value={f.permit_type||""} onChange={e=>setF({...f,permit_type:e.target.value})}/>
     <label>Fitness validity<input type="date" value={f.fitness_valid_till||""} onChange={e=>setF({...f,fitness_valid_till:e.target.value})}/></label>
    </>}
    {f.vehicle_type==="ev"&&<>
     <input type="number" min="0" step="0.1" placeholder="Battery capacity (kWh)" value={f.battery_kwh||""} onChange={e=>setF({...f,battery_kwh:e.target.value})}/>
     <input type="number" min="0" placeholder="Claimed / practical range (km)" value={f.range_km||""} onChange={e=>setF({...f,range_km:e.target.value})}/>
    </>}
    <textarea placeholder="Description, features and condition" value={f.notes||""} onChange={e=>setF({...f,notes:e.target.value})}/>
    <label className="upload">Vehicle media — add one or more photos<input required multiple accept="image/*" type="file" onChange={e=>setFiles(Array.from(e.target.files||[]))}/></label>
    <select value={f.status||"draft"} onChange={e=>setF({...f,status:e.target.value})}><option value="draft">Save as Draft</option><option value="published">Publish after successful media upload</option></select>
    <button disabled={busy}>{busy?"Saving…":f.status==="published"?"Publish Vehicle":"Save Draft"}</button>
   </form>
   {msg&&<div className="notice" style={{marginTop:12}}>{msg}</div>}
  </section>
  <section className="section dark"><div className="about"><h2>Publishing Controls</h2><p>Incomplete records are not published. The record is created as a draft, media is uploaded, and public visibility is enabled only after the selected publishing action completes successfully.</p></div></section>
 </main>
}
