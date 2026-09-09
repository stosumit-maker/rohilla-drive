"use client";
import {useEffect} from "react";
import {usePathname} from "next/navigation";

const nav=[
 ["/dealer","Dealer Dashboard"],
 ["/dealer/new-opportunities","New Vehicle Leads"],
 ["/dealer/deals","Deal Management"],
 ["/dealer/finance","Vehicle Ledger & RC"],
 ["/dealer/growth","Marketing Operations"],
 ["/dealer/language","Language Operations"]
] as const;

export default function DealerLayout({children}:{children:React.ReactNode}){
 const path=usePathname();
 useEffect(()=>{
  const current=nav.find(([href])=>href===path)?.[1]||"Dealer Portal";
  document.title=`${current} | ROHILLA DRIVE`;
 },[path]);
 return <div className="rdPortal rdDealerPortal">
  <div className="portalShellTop" data-no-translate="true">
   <div className="portalShellInner">
    <div className="portalIdentity"><b>ROHILLA DRIVE</b><small>Dealer Network Portal</small></div>
    <nav className="portalNav" aria-label="Dealer portal navigation">
     {nav.map(([href,label])=><a key={href} href={href} data-active={path===href?"true":"false"}>{label}</a>)}
     <a href="/business-hub">Business Network</a>
     <a href="/inventory">Customer Inventory</a>
     <a href="/">Customer Website</a>
    </nav>
   </div>
  </div>
  {children}
 </div>;
}
