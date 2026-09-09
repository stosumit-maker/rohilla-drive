"use client";
import {usePathname} from "next/navigation";
import {useEffect,useState} from "react";

const pill={display:"block",padding:"10px 11px",borderRadius:9,background:"#fff",color:"#15253a",border:"1px solid transparent",textDecoration:"none",fontWeight:720,fontSize:12} as const;
export default function PartnerLayout({children}:{children:React.ReactNode}){
 const path=usePathname();const [open,setOpen]=useState(false);
 useEffect(()=>{document.title="Partner Workspace | ROHILLA DRIVE"},[]);
 function back(){setOpen(false);window.history.back()}
 return <div className="rd-private rd-partner">
  {children}
  <div data-no-translate className="portal-floating">
   {open&&<div className="portal-menu">
    <div className="portal-menu-title">ROHILLA DRIVE • PARTNER WORKSPACE</div>
    <button onClick={back} style={pill}>Previous Page</button>
    {path!=="/partner"&&<a href="/partner" style={pill}>Dashboard</a>}
    {path!=="/partner/deals"&&<a href="/partner/deals" className="portal-accent" style={pill}>Deal Management</a>}
    {path!=="/partner/growth"&&<a href="/partner/growth" style={pill}>Marketing Studio</a>}
    {path!=="/partner/language"&&<a href="/partner/language" style={pill}>Language & Communications</a>}
    <a href="/business-hub" className="portal-public" style={pill}>Business Network</a>
    <a href="/inventory" className="portal-public" style={pill}>Public Inventory</a>
    <a href="/" className="portal-public" style={pill}>Public Website</a>
    <button onClick={()=>setOpen(false)} style={pill}>Close Menu</button>
   </div>}
   <button className="portal-trigger" onClick={()=>setOpen(x=>!x)} aria-expanded={open}>{open?"Close":"Partner Menu"}</button>
  </div>
 </div>;
}
