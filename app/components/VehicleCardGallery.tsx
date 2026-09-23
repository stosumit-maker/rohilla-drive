"use client";

import {useEffect,useMemo,useRef,useState} from "react";

type Photo={url:string;sort_order?:number};

export default function VehicleCardGallery({photos,title}:{photos:Photo[];title:string}){
 const ordered=useMemo(()=>[...(photos||[])].filter(p=>p?.url).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0)),[photos]);
 const [active,setActive]=useState(0);
 const [open,setOpen]=useState(false);
 const [zoom,setZoom]=useState(1);
 const touchX=useRef<number|null>(null);
 const pinchStart=useRef<number|null>(null);
 const pinchZoomStart=useRef(1);
 const count=ordered.length;
 const current=count?ordered[Math.min(active,count-1)]:null;

 function move(delta:number){
  if(count<2)return;
  setZoom(1);
  setActive(i=>(i+delta+count)%count);
 }
 function touchStart(e:React.TouchEvent){touchX.current=e.changedTouches[0]?.clientX??null}
 function touchEnd(e:React.TouchEvent){
  if(touchX.current===null)return;
  const dx=(e.changedTouches[0]?.clientX??touchX.current)-touchX.current;
  touchX.current=null;
  if(Math.abs(dx)>42)move(dx<0?1:-1);
 }
 function pinchDistance(e:React.TouchEvent){
  if(e.touches.length<2)return 0;
  const a=e.touches[0],b=e.touches[1];
  return Math.hypot(b.clientX-a.clientX,b.clientY-a.clientY);
 }
 function lightboxTouchStart(e:React.TouchEvent){
  if(e.touches.length===2){
   pinchStart.current=pinchDistance(e);
   pinchZoomStart.current=zoom;
   touchX.current=null;
   return;
  }
  if(zoom===1)touchX.current=e.touches[0]?.clientX??null;
 }
 function lightboxTouchMove(e:React.TouchEvent){
  if(e.touches.length!==2||pinchStart.current===null)return;
  e.preventDefault();
  const distance=pinchDistance(e);
  if(!distance)return;
  setZoom(Math.max(1,Math.min(4,pinchZoomStart.current*(distance/pinchStart.current))));
 }
 function lightboxTouchEnd(e:React.TouchEvent){
  if(e.touches.length<2)pinchStart.current=null;
  if(zoom>1){touchX.current=null;return}
  touchEnd(e);
 }
 useEffect(()=>{
  if(!open)return;
  const old=document.body.style.overflow;
  document.body.style.overflow="hidden";
  const onKey=(e:KeyboardEvent)=>{if(e.key==="Escape")setOpen(false);if(e.key==="ArrowRight")move(1);if(e.key==="ArrowLeft")move(-1)};
  window.addEventListener("keydown",onKey);
  return()=>{document.body.style.overflow=old;window.removeEventListener("keydown",onKey)};
 },[open,count]);

 if(!current)return <div className="premiumVehicleMedia premiumVehicleMediaEmpty"><span>Vehicle photo unavailable</span></div>;

 return <>
  <div className="premiumVehicleMedia" onTouchStart={touchStart} onTouchEnd={touchEnd}>
   <button type="button" className="premiumVehiclePhotoButton" onClick={()=>{setZoom(1);setOpen(true)}} aria-label={`Open ${title} photo ${active+1} of ${count}`}>
    <img className="premiumVehicleMain" src={current.url} alt={`${title} photo ${active+1}`}/>
    <span className="premiumVehicleExpand">View photo</span>
   </button>
   {count>1&&<>
    <button type="button" className="premiumMediaArrow left" onClick={e=>{e.stopPropagation();move(-1)}} aria-label="Previous photo">‹</button>
    <button type="button" className="premiumMediaArrow right" onClick={e=>{e.stopPropagation();move(1)}} aria-label="Next photo">›</button>
    <span className="premiumMediaCounter">{active+1}/{count}</span>
   </>}
  </div>
  {open&&<div className="vehicleLightbox" role="dialog" aria-modal="true" aria-label={title+" photo gallery"} onClick={()=>{setZoom(1);setOpen(false)}}>
   <div className="vehicleLightboxPanel" onClick={e=>e.stopPropagation()} onTouchStart={lightboxTouchStart} onTouchMove={lightboxTouchMove} onTouchEnd={lightboxTouchEnd}>
    <button type="button" className="vehicleLightboxClose" onClick={()=>{setZoom(1);setOpen(false)}} aria-label="Close photo">×</button>
    <img className="vehicleLightboxImage" src={current.url} alt={`${title} photo ${active+1}`} style={{transform:`scale(${zoom})`,transformOrigin:"center center"}}/>
    {count>1&&<>
     <button type="button" className="vehicleLightboxArrow left" onClick={()=>move(-1)} aria-label="Previous photo">‹</button>
     <button type="button" className="vehicleLightboxArrow right" onClick={()=>move(1)} aria-label="Next photo">›</button>
     <span className="vehicleLightboxCounter">{active+1} / {count}</span>
    </>}
   </div>
  </div>}
 </>;
}
