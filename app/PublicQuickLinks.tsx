"use client";
import {usePathname} from "next/navigation";
import {useState} from "react";

const base={display:"block",padding:"10px 12px",borderRadius:12,fontWeight:800,textDecoration:"none",fontSize:12,textAlign:"left"} as const;
export default function PublicQuickLinks(){
 const path=usePathname();const [open,setOpen]=useState(false);
 if(path.startsWith("/admin")||path.startsWith("/dealer")||path.startsWith("/partner")||path.startsWith("/reset-password"))return null;
 return <div data-no-translate style={{position:"fixed",right:12,bottom:14,zIndex:9000,display:"flex",flexDirection:"column",gap:8,alignItems:"flex-end",maxWidth:"calc(100vw - 24px)"}}>
  {open&&<div style={{width:"min(290px,calc(100vw - 24px))",background:"rgba(255,255,255,.98)",border:"1px solid #d1d5db",borderRadius:18,padding:10,boxShadow:"0 18px 55px rgba(0,0,0,.24)",display:"grid",gap:8}}>
   <small style={{padding:"5px 4px",color:"#4b5563",fontWeight:800,fontSize:10}}>One network. Every vehicle. Every language.</small>
   <a href="/assistant" style={{...base,background:"#2a2110",color:"#f4d38a"}}>🎙️ Ask Rohilla AI</a>
   <a href="/language-assist" style={{...base,background:"#312e81",color:"#eef2ff"}}>🌐 Language Bridge</a>
   <a href="/new-vehicles" style={{...base,background:"#173326",color:"#f4d38a"}}>✨ New Vehicle Assist</a>
   <a href="/business-hub" style={{...base,background:"#111827",color:"#fff"}}>🤝 Business Hub</a>
   <button onClick={()=>setOpen(false)} style={{border:"1px solid #d1d5db",background:"#fff",borderRadius:12,padding:"9px 12px",fontWeight:800}}>Close</button>
  </div>}
  <button onClick={()=>setOpen(x=>!x)} aria-expanded={open} aria-label="Rohilla Drive quick actions" style={{border:"1px solid #d7b56d",background:"#111827",color:"#f4d38a",borderRadius:999,padding:"10px 14px",fontWeight:900,boxShadow:"0 8px 24px rgba(0,0,0,.2)"}}>{open?"× Close":"☰ Quick Actions"}</button>
 </div>
}
