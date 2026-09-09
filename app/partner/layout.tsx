"use client";
import "../portal-professional.css";
import {usePathname} from "next/navigation";
import {useState} from "react";

const pill={display:"block",padding:"9px 11px",borderRadius:11,background:"#111827",color:"#fff",textDecoration:"none",fontWeight:800,fontSize:12} as const;
export default function PartnerLayout({children}:{children:React.ReactNode}){
 const path=usePathname();const [open,setOpen]=useState(false);
 function back(){setOpen(false);window.history.back()}
 return <div className="rd-private-portal">
  {children}
  <div data-no-translate style={{position:"fixed",left:12,bottom:14,zIndex:9998,display:"flex",flexDirection:"column",gap:8,alignItems:"flex-start",maxWidth:"calc(100vw - 24px)"}}>
   {open&&<div style={{width:"min(330px,calc(100vw - 24px))",maxHeight:"70vh",overflow:"auto",display:"grid",gap:7,padding:10,borderRadius:16,background:"rgba(255,255,255,.99)",border:"1px solid #d1d5db",boxShadow:"0 18px 55px rgba(0,0,0,.24)"}}>
    <small style={{color:"#374151",fontWeight:900,padding:"3px 2px"}}>ROHILLA DRIVE • Partner Workspace</small>
    <button onClick={back} style={{...pill,background:"#fff",color:"#111827",border:"1px solid #d1d5db",textAlign:"left"}}>← Back</button>
    {path!=="/partner"&&<a href="/partner" style={pill}>Partner Home</a>}
    {path!=="/partner/deals"&&<a href="/partner/deals" style={{...pill,background:"#3b1f1f",color:"#fee2e2"}}>Deal Workspace</a>}
    {path!=="/partner/growth"&&<a href="/partner/growth" style={{...pill,background:"#2a2110",color:"#f4d38a"}}>Marketing Studio</a>}
    {path!=="/partner/language"&&<a href="/partner/language" style={{...pill,background:"#312e81",color:"#eef2ff"}}>Communication Centre</a>}
    <a href="/business-hub" style={pill}>Business Network</a>
    <a href="/inventory" style={pill}>Public Inventory</a>
    <a href="/" style={{...pill,background:"#fff",color:"#111827",border:"1px solid #111827"}}>Public Website</a>
    <button onClick={()=>setOpen(false)} style={{border:"1px solid #d1d5db",background:"#fff",color:"#111827",borderRadius:11,padding:"9px 11px",fontWeight:900}}>Close Menu</button>
   </div>}
   <button onClick={()=>setOpen(x=>!x)} aria-expanded={open} style={{border:"1px solid #d7b56d",background:"#111827",color:"#f4d38a",borderRadius:999,padding:"10px 14px",fontWeight:900,boxShadow:"0 8px 24px rgba(0,0,0,.22)"}}>{open?"× Close":"☰ Partner Menu"}</button>
  </div>
 </div>;
}
