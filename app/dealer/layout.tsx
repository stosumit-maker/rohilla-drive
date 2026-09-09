"use client";
import "../portal-professional.css";
import {usePathname} from "next/navigation";
import {useState} from "react";

const pill={display:"block",padding:"9px 11px",borderRadius:11,background:"#111827",color:"#fff",textDecoration:"none",fontWeight:800,fontSize:12} as const;
export default function DealerLayout({children}:{children:React.ReactNode}){
 const path=usePathname();const [open,setOpen]=useState(false);
 function back(){setOpen(false);window.history.back()}
 return <div className="rd-private-portal">
  {children}
  <div data-no-translate style={{position:"fixed",left:12,bottom:14,zIndex:9998,display:"flex",flexDirection:"column",gap:8,alignItems:"flex-start",maxWidth:"calc(100vw - 24px)"}}>
   {open&&<div style={{width:"min(330px,calc(100vw - 24px))",maxHeight:"70vh",overflow:"auto",display:"grid",gap:7,padding:10,borderRadius:16,background:"rgba(255,255,255,.99)",border:"1px solid #d1d5db",boxShadow:"0 18px 55px rgba(0,0,0,.24)"}}>
    <small style={{color:"#374151",fontWeight:900,padding:"3px 2px"}}>ROHILLA DRIVE • Dealer Workspace</small>
    <button onClick={back} style={{...pill,background:"#fff",color:"#111827",border:"1px solid #d1d5db",textAlign:"left"}}>← Back</button>
    {path!=="/dealer"&&<a href="/dealer" style={pill}>Dealer Home</a>}
    {path!=="/dealer/new-opportunities"&&<a href="/dealer/new-opportunities" style={{...pill,background:"#172554",color:"#dbeafe"}}>New Vehicle Enquiries</a>}
    {path!=="/dealer/deals"&&<a href="/dealer/deals" style={{...pill,background:"#3b1f1f",color:"#fee2e2"}}>Deal Workspace</a>}
    {path!=="/dealer/finance"&&<a href="/dealer/finance" style={{...pill,background:"#173326",color:"#f4d38a"}}>Vehicle Ledger • Margin • RC</a>}
    {path!=="/dealer/growth"&&<a href="/dealer/growth" style={{...pill,background:"#2a2110",color:"#f4d38a"}}>Marketing Studio</a>}
    {path!=="/dealer/language"&&<a href="/dealer/language" style={{...pill,background:"#312e81",color:"#eef2ff"}}>Communication Centre</a>}
    <a href="/business-hub" style={pill}>Business Network</a>
    <a href="/inventory" style={pill}>Public Inventory</a>
    <a href="/" style={{...pill,background:"#fff",color:"#111827",border:"1px solid #111827"}}>Public Website</a>
    <button onClick={()=>setOpen(false)} style={{border:"1px solid #d1d5db",background:"#fff",color:"#111827",borderRadius:11,padding:"9px 11px",fontWeight:900}}>Close Menu</button>
   </div>}
   <button onClick={()=>setOpen(x=>!x)} aria-expanded={open} style={{border:"1px solid #d7b56d",background:"#111827",color:"#f4d38a",borderRadius:999,padding:"10px 14px",fontWeight:900,boxShadow:"0 8px 24px rgba(0,0,0,.22)"}}>{open?"× Close":"☰ Dealer Menu"}</button>
  </div>
 </div>;
}
