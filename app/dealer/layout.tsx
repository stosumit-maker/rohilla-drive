"use client";
import {usePathname} from "next/navigation";
import {useState} from "react";

export default function DealerLayout({children}:{children:React.ReactNode}){
 const path=usePathname();
 const [open,setOpen]=useState(false);
 function back(){setOpen(false);window.history.back()}
 return <div className="rdPortalScope rdDealerPortal">
  {children}
  <div className="rdWorkspaceNav" data-no-translate>
   {open&&<div className="rdWorkspaceMenu">
    <div className="rdWorkspaceMenuTitle">Dealer Workspace • ROHILLA DRIVE Business Suite</div>
    <button onClick={back}>Previous Page</button>
    {path!=="/dealer"&&<a className="rdWorkspaceLink rdPrimaryLink" href="/dealer">Dealer Overview</a>}
    {path!=="/dealer/new-opportunities"&&<a className="rdWorkspaceLink" href="/dealer/new-opportunities">New Vehicle Opportunities</a>}
    {path!=="/dealer/deals"&&<a className="rdWorkspaceLink" href="/dealer/deals">Deal Management</a>}
    {path!=="/dealer/finance"&&<a className="rdWorkspaceLink" href="/dealer/finance">Transactions, Margin & RC</a>}
    {path!=="/dealer/growth"&&<a className="rdWorkspaceLink" href="/dealer/growth">Marketing Centre</a>}
    {path!=="/dealer/language"&&<a className="rdWorkspaceLink" href="/dealer/language">Language Support</a>}
    <a className="rdWorkspaceLink" href="/business-hub">Business Partner Network</a>
    <a className="rdWorkspaceLink" href="/inventory">Public Vehicle Inventory</a>
    <a className="rdWorkspaceLink" href="/">Public Website</a>
    <button onClick={()=>setOpen(false)}>Close Navigation</button>
   </div>}
   <button className="rdWorkspaceToggle" onClick={()=>setOpen(x=>!x)} aria-expanded={open}>{open?"Close Workspace":"Dealer Workspace"}</button>
  </div>
 </div>;
}
