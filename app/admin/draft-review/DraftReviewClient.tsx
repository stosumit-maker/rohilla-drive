"use client";
import {useEffect,useState} from "react";
import {supabase} from "../../supabaseClient";

type Photo={id:string;url:string;path:string|null;storage_bucket:string;sort_order:number;preview?:string};
type Vehicle={id:string;brand:string;model:string;variant?:string|null;year?:number|null;km?:number|null;fuel?:string|null;asking_price?:number|null;city?:string|null;partner_id?:string|null;registration_prefix?:string|null;status:string;vehicle_photos:Photo[]};

export default function DraftReviewClient(){
 const db=supabase();
 const [ready,setReady]=useState(false),[cars,setCars]=useState<Vehicle[]>([]),[busyId,setBusyId]=useState(""),[msg,setMsg]=useState("Checking administrator access…");
 useEffect(()=>{gate()},[]);
 async function gate(){
  const {data:{session}}=await db.auth.getSession();if(!session){setMsg("Administrator sign-in is required.");return}
  const [{data:aal},{data:isAdmin}]=await Promise.all([db.auth.mfa.getAuthenticatorAssuranceLevel(),db.rpc("is_admin")]);
  if(aal?.currentLevel!=="aal2"||!isAdmin){setMsg("Administrator authentication is required.");return}
  setReady(true);await load();
 }
 async function load(){
  setMsg("Loading private drafts…");
  const {data,error}=await db.from("vehicles").select("id,brand,model,variant,year,km,fuel,asking_price,city,partner_id,registration_prefix,status,vehicle_photos(id,url,path,storage_bucket,sort_order)").eq("status","draft").order("created_at",{ascending:false});
  if(error){setMsg(error.message);return}
  const hydrated=await Promise.all((data||[]).map(async(row:any)=>{
   const photos=await Promise.all((row.vehicle_photos||[]).map(async(p:any)=>{
    if(p.storage_bucket==="vehicle-draft-photos"&&p.path){const signed=await db.storage.from("vehicle-draft-photos").createSignedUrl(p.path,1800);return {...p,preview:signed.data?.signedUrl||""}}
    return {...p,preview:p.url||""};
   }));return {...row,vehicle_photos:photos};
  }));
  setCars(hydrated as Vehicle[]);setMsg(hydrated.length?"Review each draft before publication.":"No vehicle drafts are waiting for review.");
 }
 async function promotePhoto(vehicleId:string,p:Photo){
  if(p.storage_bucket!=="vehicle-draft-photos"||!p.path)return null;
  const dl=await db.storage.from("vehicle-draft-photos").download(p.path);if(dl.error||!dl.data)throw new Error(dl.error?.message||"Private draft photo could not be read.");
  const base=(p.path.split("/").pop()||`${p.id}.jpg`).replace(/[^a-zA-Z0-9._-]/g,"");
  const publicPath=`${vehicleId}/published-${Date.now()}-${p.id}-${base}`;
  const up=await db.storage.from("vehicle-photos").upload(publicPath,dl.data,{upsert:false,contentType:dl.data.type||undefined});if(up.error)throw new Error(up.error.message);
  const publicUrl=db.storage.from("vehicle-photos").getPublicUrl(publicPath).data.publicUrl;
  const upd=await db.from("vehicle_photos").update({url:publicUrl,path:publicPath,storage_bucket:"vehicle-photos"}).eq("id",p.id);
  if(upd.error){await db.storage.from("vehicle-photos").remove([publicPath]);throw new Error(upd.error.message)}
  return {photoId:p.id,privatePath:p.path,publicPath};
 }
 async function rollbackPromoted(items:{photoId:string;privatePath:string;publicPath:string}[]){
  for(const x of items.slice().reverse()){
   await db.from("vehicle_photos").update({url:"",path:x.privatePath,storage_bucket:"vehicle-draft-photos"}).eq("id",x.photoId);
   await db.storage.from("vehicle-photos").remove([x.publicPath]);
  }
 }
 async function publish(car:Vehicle){
  if(!confirm(`Publish ${car.brand} ${car.model}${car.variant?` ${car.variant}`:""}? Private draft media will become public inventory media.`))return;
  setBusyId(car.id);setMsg("Promoting reviewed media and publishing vehicle…");const promoted:{photoId:string;privatePath:string;publicPath:string}[]=[];
  try{
   if(!car.vehicle_photos?.length)throw new Error("Add at least one vehicle photo before publication.");
   for(const p of [...car.vehicle_photos].sort((a,b)=>(a.sort_order||0)-(b.sort_order||0))){const x=await promotePhoto(car.id,p);if(x)promoted.push(x)}
   const changed=await db.from("vehicles").update({status:"published"}).eq("id",car.id);if(changed.error){await rollbackPromoted(promoted);throw new Error(changed.error.message)}
   for(const x of promoted)await db.storage.from("vehicle-draft-photos").remove([x.privatePath]);
   const media=(await db.from("vehicle_photos").select("url").eq("vehicle_id",car.id).order("sort_order")).data?.map((x:any)=>x.url).filter(Boolean)||[];
   const existing=await db.from("social_posts").select("id",{count:"exact",head:true}).eq("vehicle_id",car.id);
   if(!existing.count)await db.from("social_posts").insert(["instagram","facebook","youtube"].map(platform=>({vehicle_id:car.id,platform,caption:`${car.brand} ${car.model} ${car.variant||""} | ₹${car.asking_price||""}`,media_urls:media,status:"queued"})));
   await db.from("vehicle_events").insert({vehicle_id:car.id,event_type:"draft_media_promoted_and_published",event_data:{promoted_photo_count:promoted.length,registration_prefix:car.registration_prefix||null}});
   setMsg(`${car.brand} ${car.model} published successfully. Reviewed media is now public.`);await load();
  }catch(err:any){setMsg(err?.message||"Draft could not be published. The vehicle remains a draft.")}
  finally{setBusyId("")}
 }
 if(!ready)return <main><section className="section"><h1>Draft Review</h1><p>{msg}</p><a href="/admin">Back to Dashboard</a></section></main>;
 return <main>
  <section className="hero" style={{paddingTop:36,paddingBottom:36}}><div className="heroText"><span>PRIVATE DRAFT → REVIEW → PUBLIC INVENTORY</span><h1>Draft Review</h1><p>Review unpublished vehicle media before it is promoted to the public inventory bucket.</p></div></section>
  <section className="section" style={{paddingTop:24}}><div className="head"><div><h2>Vehicle Drafts ({cars.length})</h2><p>{msg}</p></div><div className="row"><button onClick={load} disabled={Boolean(busyId)}>Refresh</button><a className="call" href="/admin/photo-listing">Photo-First Listing</a><a className="call" href="/admin/add-vehicle">Inventory</a></div></div>
   {cars.length===0?<div className="notice">No drafts require review right now.</div>:<div className="grid">{cars.map(car=><article className="card" key={car.id}><div className="photo real swipeGallery">{(car.vehicle_photos||[]).length?(car.vehicle_photos||[]).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0)).map((p,i)=><img key={p.id} src={p.preview||p.url} alt={`${car.brand} ${car.model} draft photo ${i+1}`}/>):<span>No photo</span>}</div><div className="body"><label>{car.partner_id?"Dealer Submission":"Administration Draft"}</label><h3>{car.brand} {car.model} {car.variant||""}</h3><small>{car.year||"Year pending"} • {car.km!=null?`${Number(car.km).toLocaleString("en-IN")} km`:"KM pending"} • {car.fuel||"Fuel pending"}{car.city?` • ${car.city}`:""}</small>{car.registration_prefix&&<p><b>Public registration:</b> {car.registration_prefix}</p>}<strong>{car.asking_price!=null?`₹${Number(car.asking_price).toLocaleString("en-IN")}`:"Price pending"}</strong><p>{car.vehicle_photos?.filter(p=>p.storage_bucket==="vehicle-draft-photos").length||0} private draft photo(s) • {car.vehicle_photos?.filter(p=>p.storage_bucket==="vehicle-photos").length||0} public/legacy photo(s)</p><button disabled={busyId===car.id||!car.vehicle_photos?.length} onClick={()=>publish(car)}>{busyId===car.id?"Publishing…":"Approve Media & Publish"}</button></div></article>)}</div>}
  </section>
  <section className="section dark"><div className="about"><h2>Privacy Guard</h2><p>ROHILLA DRIVE blocks a vehicle from changing to published status while any linked photo is still stored in the private draft bucket. Draft Review promotes the reviewed media first and only then publishes the vehicle.</p></div></section>
 </main>
}
