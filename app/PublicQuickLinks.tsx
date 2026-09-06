"use client";
import {usePathname} from "next/navigation";
import {useState} from "react";

const base={display:"block",padding:"10px 12px",borderRadius:12,fontWeight:900,textDecoration:"none",fontSize:13,textAlign:"left"} as const;
export default function PublicQuickLinks(){
 const path=usePathname();const [open,setOpen]=useState(false);const [shareNote,setShareNote]=useState("");
 if(path.startsWith("/admin")||path.startsWith("/dealer")||path.startsWith("/partner")||path.startsWith("/reset-password"))return null;
 async function share(){const url=window.location.href;const title=document.title||"ROHILLA DRIVE";const text=path.startsWith("/cars/")?"Check this vehicle on ROHILLA DRIVE":"Check ROHILLA DRIVE — One network. Every vehicle. Every language.";try{if(navigator.share){await navigator.share({title,text,url});return}await navigator.clipboard.writeText(`${text}\n${url}`);setShareNote("Link copied ✓");window.setTimeout(()=>setShareNote(""),1800)}catch{}}
 return <div data-no-translate style={{position:"fixed",left:12,bottom:14,zIndex:9000,display:"flex",flexDirection:"column",gap:8,alignItems:"flex-start",maxWidth:"calc(100vw - 24px)"}}>
  {open&&<div style={{width:"min(320px,calc(100vw - 24px))",background:"rgba(255,255,255,.99)",border:"1px solid #d1d5db",borderRadius:18,padding:10,boxShadow:"0 18px 55px rgba(0,0,0,.24)",display:"grid",gap:8}}>
   <small style={{padding:"5px 4px",color:"#374151",fontWeight:900,fontSize:11,lineHeight:1.35}}>ROHILLA HUB • One network. Every vehicle. Every language.</small>
   {path.startsWith("/cars/")&&<button onClick={share} style={{...base,background:"#0b4a6f",color:"#fff",border:0}}>📤 Share This Vehicle</button>}
   {!path.startsWith("/cars/")&&<button onClick={share} style={{...base,background:"#0b4a6f",color:"#fff",border:0}}>📤 Share Rohilla Drive</button>}
   {shareNote&&<small style={{color:"#166534",fontWeight:900}}>{shareNote}</small>}
   <a href="/inventory" style={{...base,background:"#0f172a",color:"#fff"}}>🚘 Browse Full Inventory</a>
   <a href="/sell" style={{...base,background:"#7c2d12",color:"#fff"}}>🏷️ Sell / List My Vehicle</a>
   <a href="/assistant" style={{...base,background:"#2a2110",color:"#f4d38a"}}>🎙️ Rohilla Assistant</a>
   <a href="/language-assist" style={{...base,background:"#312e81",color:"#eef2ff"}}>🌐 Language Bridge</a>
   <a href="/new-vehicles" style={{...base,background:"#173326",color:"#f4d38a"}}>✨ New Vehicle Assistance</a>
   <a href="/business-hub" style={{...base,background:"#111827",color:"#fff"}}>🤝 Dealer / Service / Business Hub</a>
   <button onClick={()=>setOpen(false)} style={{border:"1px solid #d1d5db",background:"#fff",color:"#111827",borderRadius:12,padding:"9px 12px",fontWeight:900}}>Close Menu</button>
  </div>}
  <button onClick={()=>setOpen(x=>!x)} aria-expanded={open} aria-label="Rohilla Hub" style={{border:"1px solid #d7b56d",background:"#111827",color:"#f4d38a",borderRadius:999,padding:"11px 15px",fontWeight:900,boxShadow:"0 8px 24px rgba(0,0,0,.22)",fontSize:13}}>{open?"× Close":"☰ Rohilla Hub"}</button>
 </div>
}
