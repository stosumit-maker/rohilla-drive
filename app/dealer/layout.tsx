"use client";
import {useEffect,usePathname} from "next/navigation";
import {useState} from "react";

const pill={display:"block",padding:"10px 11px",borderRadius:9,background:"#fff",color:"#15253a",border:"1px solid transparent",textDecoration:"none",fontWeight:720,fontSize:12} as const;
export default function DealerLayout({children}:{children:React.ReactNode}){
 const path=usePathname();const [open,setOpen]=useState(false);
 useEffect(()=>{document.title="Dealer Workspace | ROHILLA DRIVE"},[]);
 function back(){setOpen(false);window.history.back()}
 return <div className="rd-private rd-dealer">
  {children}
  <div data-no-translate className="portal-floating">
   {open&&<div className="portal-menu">
    <div className="portal-menu-title">ROHILLA DRIVE • DEALER WORKSPACE</div>
    <button onClick={back} style={pill}>Previous Page</button>
    {path!=="/dealer"&&<a href="/dealer" style={pill}>Dashboard</a>}
    {path!=="/dealer/new-opportunities"&&<a href="/dealer/new-opportunities" className="portal-accent" style={pill}>New Vehicle Leads</a>}
    {path!=="/dealer/deals"&&<a href="/dealer/deals" style={pill}>Deal Management</a>}
    {path!=="/dealer/finance"&&<a href="/dealer/finance" style={pill}>Transactions & RC</a>}
    {path!=="/dealer/growth"&&<a href="/dealer/growth" style={pill}>Marketing Studio</a>}
    {path!=="/dealer/language"&&<a href="/dealer/language" style={pill}>Language & Communications</a>}
    <a href="/business-hub" className="portal-public" style={pill}>Business Network</a>
    <a href="/inventory" className="portal-public" style={pill}>Public Inventory</a>
    <a href="/" className="portal-public" style={pill}>Public Website</a>
    <button onClick={()=>setOpen(false)} style={pill}>Close Menu</button>
   </div>}
   <button className="portal-trigger" onClick={()=>setOpen(x=>!x)} aria-expanded={open}>{open?"Close":"Dealer Menu"}</button>
  </div>
 </div>;
}
