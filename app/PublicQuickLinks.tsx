"use client";
import {usePathname} from "next/navigation";
import {useState} from "react";

const base={display:"block",padding:"10px 12px",borderRadius:12,fontWeight:900,textDecoration:"none",fontSize:13,textAlign:"left"} as const;
export default function PublicQuickLinks(){
 const path=usePathname();const [open,setOpen]=useState(false);const [shareNote,setShareNote]=useState("");
 if(path.startsWith("/admin")||path.startsWith("/dealer")||path.startsWith("/partner")||path.startsWith("/reset-password"))return null;
 async function share(){const url=window.location.href;const title=document.title||"ROHILLA DRIVE";const text=path.startsWith("/cars/")?"View this vehicle on ROHILLA DRIVE":"Explore cars and vehicle assistance on ROHILLA DRIVE.";try{if(navigator.share){await navigator.share({title,text,url});return}await navigator.clipboard.writeText(`${text}\n${url}`);setShareNote("Link copied.");window.setTimeout(()=>setShareNote(""),1800)}catch{}}
 function back(){setOpen(false);window.history.back()}
 return <div style={{position:"fixed",left:12,bottom:14,zIndex:9000,display:"flex",flexDirection:"column",gap:8,alignItems:"flex-start",maxWidth:"calc(100vw - 24px)"}}>
  {open&&<div style={{width:"min(320px,calc(100vw - 24px))",background:"rgba(255,255,255,.99)",border:"1px solid #d1d5db",borderRadius:18,padding:10,boxShadow:"0 18px 55px rgba(0,0,0,.24)",display:"grid",gap:8,maxHeight:"min(78vh,620px)",overflowY:"auto"}}>
   <small style={{padding:"5px 4px",color:"#374151",fontWeight:900,fontSize:11,lineHeight:1.35}}>ROHILLA DRIVE • Cars & Vehicle Assistance</small>
   {path!=="/"&&<button onClick={back} style={{...base,background:"#fff",color:"#111827",border:"1px solid #d1d5db"}}>← Previous Page</button>}
   {path.startsWith("/cars/")&&<button onClick={share} style={{...base,background:"#0b4a6f",color:"#fff",border:0}}>Share This Vehicle</button>}
   {!path.startsWith("/cars/")&&<button onClick={share} style={{...base,background:"#0b4a6f",color:"#fff",border:0}}>Share ROHILLA DRIVE</button>}
   {shareNote&&<small style={{color:"#166534",fontWeight:900}}>{shareNote}</small>}
   <a href="/inventory" style={{...base,background:"#0f172a",color:"#fff"}}>Browse Cars</a>
   <a href="/sell-car-ambala" style={{...base,background:"#7c2d12",color:"#fff"}}>Sell Your Car</a>
   <a href="/assistant" style={{...base,background:"#2a2110",color:"#f4d38a"}}>CarMentor</a>
   <button onClick={()=>{setOpen(false);window.dispatchEvent(new Event("rohilla-open-language"))}} style={{...base,background:"#312e81",color:"#eef2ff",border:0,width:"100%",cursor:"pointer"}}>Change Website Language</button>
   <a href="/new-cars/ambala" style={{...base,background:"#173326",color:"#f4d38a"}}>New Cars</a>
   <a href="/business-hub" style={{...base,background:"#111827",color:"#fff"}}>Business Hub</a>
   <a href="/dealer" style={{...base,background:"#fff",color:"#111827",border:"1px solid #d1d5db"}}>Dealer Sign In</a>
   <a href="/partner" style={{...base,background:"#fff",color:"#111827",border:"1px solid #d1d5db"}}>Partner Sign In</a>
   <button onClick={()=>setOpen(false)} style={{border:"1px solid #d1d5db",background:"#fff",color:"#111827",borderRadius:12,padding:"9px 12px",fontWeight:900}}>Close Menu</button>
  </div>}
  <button onClick={()=>setOpen(x=>!x)} aria-expanded={open} aria-label="ROHILLA DRIVE quick menu" style={{border:"1px solid #d7b56d",background:"#111827",color:"#f4d38a",borderRadius:999,padding:"11px 15px",fontWeight:900,boxShadow:"0 8px 24px rgba(0,0,0,.22)",fontSize:13}}>{open?"× Close":"Menu"}</button>
 </div>
}
