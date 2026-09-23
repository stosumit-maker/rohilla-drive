"use client";

import {useRef,useState,type TouchEvent} from "react";
import VehicleEnquiryModal from "../../components/VehicleEnquiryModal";
import {track} from "@vercel/analytics";

export default function CarDetailClient({initialCar}:{initialCar:any}){
 const c=initialCar;
 const [active,setActive]=useState(0),[fullscreen,setFullscreen]=useState(false),[zoom,setZoom]=useState(1),[enquire,setEnquire]=useState(false),[mediaView,setMediaView]=useState<any>(null),[mediaIndex,setMediaIndex]=useState(0);
 const touchStart=useRef<{x:number;y:number}|null>(null);
 const photos=[...(c.vehicle_photos||[])].sort((a:any,b:any)=>(a.sort_order||0)-(b.sort_order||0));
 const currentPhoto=photos[active]?.url;
 const vehicleMedia=[...(c.vehicle_media||[])].sort((a:any,b:any)=>(a.sort_order||0)-(b.sort_order||0));
 const mediaLabels:Record<string,string>={interior:"Interior",dashboard:"Dashboard",engine:"Bonnet / Engine",boot:"Boot / Dicky",driver_door:"Driver Door",passenger_door:"Passenger Door",rear_left_door:"Rear Left Door",rear_right_door:"Rear Right Door",walkaround:"Walkaround Video",interior_video:"Interior Video",engine_video:"Engine Video",boot_video:"Boot Video",spin_360:"360 View"};
 const availableCategories=Object.keys(mediaLabels).filter(key=>vehicleMedia.some((m:any)=>m.media_category===key));
 const selectedMedia=mediaView?vehicleMedia.filter((m:any)=>m.media_category===mediaView):[];
 const activeMedia=selectedMedia[Math.min(mediaIndex,Math.max(selectedMedia.length-1,0))];
 function previous(){if(!photos.length)return;setZoom(1);setActive((old)=>(old-1+photos.length)%photos.length)}
 function next(){if(!photos.length)return;setZoom(1);setActive((old)=>(old+1)%photos.length)}
 function touchBegin(e:TouchEvent<HTMLDivElement>){if(e.touches.length===1)touchStart.current={x:e.touches[0].clientX,y:e.touches[0].clientY}}
 function touchEnd(e:TouchEvent<HTMLDivElement>){if(!touchStart.current||e.changedTouches.length!==1)return;const dx=e.changedTouches[0].clientX-touchStart.current.x;touchStart.current=null;if(Math.abs(dx)>60)(dx<0?next:previous)()}
 async function shareVehicle(){const shareUrl=new URL(window.location.href);shareUrl.searchParams.set("utm_source","share");shareUrl.searchParams.set("utm_medium","vehicle_link");shareUrl.searchParams.set("utm_campaign","organic_share");const url=shareUrl.toString();track("Vehicle Share",{brand:c.brand,model:c.model});const text=`${c.year||""} ${c.brand} ${c.model} ${c.variant||""} • ₹${Number(c.asking_price||0).toLocaleString("en-IN")} • ROHILLA DRIVE`;try{if(navigator.share){await navigator.share({title:`${c.brand} ${c.model} | ROHILLA DRIVE`,text,url});return}await navigator.clipboard.writeText(`${text}\n${url}`);alert("Vehicle link copied")}catch{}}
 return <main className="carPage">
  <header className="carHeader"><div className="brand"><b>ROHILLA DRIVE</b><small>by Rohilla Multibrand Cars</small></div><div className="row"><a href="/inventory">← Back to Inventory</a><button className="secondary" onClick={shareVehicle}>Share</button></div></header>
  <section className="carDetail">
   <div className="photoColumn">
    <div className="detailViewer" onTouchStart={touchBegin} onTouchEnd={touchEnd}>
     {currentPhoto?<><button type="button" className="photoArrow left" onClick={previous} aria-label="Previous photo">‹</button><img src={currentPhoto} alt={`${c.year||""} ${c.brand} ${c.model} used car`} onClick={()=>{setZoom(1);setFullscreen(true)}} draggable={false}/><button type="button" className="photoArrow right" onClick={next} aria-label="Next photo">›</button><button type="button" className="zoomButton" onClick={()=>{setZoom(1);setFullscreen(true)}}>⛶ Fullscreen</button><div className="photoCounter">{active+1} / {photos.length}</div></>:<span>Vehicle photo unavailable</span>}
    </div>
    {photos.length>1&&<div className="detailThumbs">{photos.map((photo:any,index:number)=><button type="button" key={photo.url||index} className={index===active?"thumb active":"thumb"} onClick={()=>{setZoom(1);setActive(index)}}><img src={photo.url} alt={`${c.brand} ${c.model} photo ${index+1}`} draggable={false}/></button>)}</div>}
    {photos.length>1&&<p className="swipeHint">← Swipe photos • Tap photo to enlarge →</p>}{availableCategories.length>0&&<div className="vehicleInteractivePanel"><div><b>Explore this vehicle</b><small>Only real uploaded views are shown.</small></div><div className="vehicleViewButtons">{availableCategories.map(category=><button type="button" key={category} className={mediaView===category?"active":""} onClick={()=>{setMediaView(category);setMediaIndex(0)}}>{mediaLabels[category]}</button>)}</div>{activeMedia&&<div className="vehicleMediaStage">{activeMedia.media_kind==="video"?<video src={activeMedia.url} controls playsInline preload="metadata"/>:<img src={activeMedia.url} alt={mediaLabels[activeMedia.media_category]||"Vehicle view"}/>} {selectedMedia.length>1&&<div className="vehicleMediaPager"><button type="button" onClick={()=>setMediaIndex(i=>(i-1+selectedMedia.length)%selectedMedia.length)}>‹</button><span>{mediaIndex+1} / {selectedMedia.length}</span><button type="button" onClick={()=>setMediaIndex(i=>(i+1)%selectedMedia.length)}>›</button></div>}</div>}</div>}
   </div>
   <div className="carInfo">
    <label>ROHILLA DRIVE</label><h1>{c.brand} {c.model} {c.variant}</h1>
    <div className="specs"><span>{c.year}</span><span>{Number(c.km||0).toLocaleString("en-IN")} km</span><span>{c.fuel}</span>{c.transmission&&<span>{c.transmission}</span>}{c.owner_count&&<span>{c.owner_count} Owner</span>}{c.city&&<span>{c.city}</span>}</div>
    <h2>₹{Number(c.asking_price||0).toLocaleString("en-IN")}</h2>
    {c.public_notes&&<p>{c.public_notes}</p>}
    <button type="button" className="primary" onClick={()=>{track("Enquiry Open",{surface:"vehicle_detail",brand:c.brand,model:c.model});setEnquire(true)}}>Enquire / Continue on WhatsApp</button>
    <a className="call big" href="tel:7015260003" onClick={()=>track("Call Click",{surface:"vehicle_detail",brand:c.brand,model:c.model})}>Call 7015260003</a>
    <div className="notice" style={{marginTop:18}}><b>Looking for a similar car?</b> <a href="/find-car-ambala">Send your model and budget requirement →</a></div>
   </div>
  </section>
  {fullscreen&&currentPhoto&&<div className="overlay" role="dialog" aria-modal="true" aria-label="Vehicle photo viewer"><div className="modal" style={{maxWidth:"min(1100px,96vw)",width:"96vw"}}><button className="x" onClick={()=>{setFullscreen(false);setZoom(1)}} aria-label="Close photo viewer">×</button><div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:10}}><button className="secondary" onClick={()=>setZoom(z=>Math.max(1,z-.5))}>−</button><button className="secondary" onClick={()=>setZoom(1)}>100%</button><button className="secondary" onClick={()=>setZoom(z=>Math.min(4,z+.5))}>+</button></div><div onTouchStart={touchBegin} onTouchEnd={touchEnd} style={{overflow:"auto",textAlign:"center",maxHeight:"78vh"}}><img src={currentPhoto} alt={`${c.brand} ${c.model} enlarged`} draggable={false} style={{maxWidth:"100%",transform:`scale(${zoom})`,transformOrigin:"center center",transition:"transform .12s ease"}}/></div>{photos.length>1&&<div className="row" style={{justifyContent:"center",marginTop:12}}><button onClick={previous}>Previous</button><span>{active+1} / {photos.length}</span><button onClick={next}>Next</button></div>}</div></div>}
  {enquire&&<VehicleEnquiryModal vehicle={c} source="vehicle_detail_page" onClose={()=>setEnquire(false)}/>}
 </main>;
}
