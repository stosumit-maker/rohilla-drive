"use client";
import {usePathname} from "next/navigation";
import {useState} from "react";

export default function PartnerLayout({children}:{children:React.ReactNode}){
 const path=usePathname();
 const [open,setOpen]=useState(false);
 function back(){setOpen(false);window.history.back()}
 return <div className="rdPortalScope rdPartnerPortal">
  {children}
  <div className="rdWorkspaceNav" data-no-translate>
   {open&&<div className="rdWorkspaceMenu">
    <div className="rdWorkspaceMenuTitle">Partner Workspace • ROHILLA DRIVE Business Suite</div>
    <button onClick={back}>Previous Page</button>
    {path!=="/partner"&&<a className="rdWorkspaceLink rdPrimaryLink" href="/partner">Partner Overview</a>}
    {path!=="/partner/deals"&&<a className="rdWorkspaceLink" href="/partner/deals">Deal Management</a>}
    {path!=="/partner/growth"&&<a className="rdWorkspaceLink" href="/partner/growth">Marketing Centre</a>}
    {path!=="/partner/language"&&<a className="rdWorkspaceLink" href="/partner/language">Language Support</a>}
    <a className="rdWorkspaceLink" href="/business-hub">Business Partner Network</a>
    <a className="rdWorkspaceLink" href="/inventory">Public Vehicle Inventory</a>
    <a className="rdWorkspaceLink" href="/">Public Website</a>
    <button onClick={()=>setOpen(false)}>Close Navigation</button>
   </div>}
   <button className="rdWorkspaceToggle" onClick={()=>setOpen(x=>!x)} aria-expanded={open}>{open?"Close Workspace":"Partner Workspace"}</button>
  </div>
 </div>;
}
