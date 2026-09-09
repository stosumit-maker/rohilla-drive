"use client";
import {useEffect} from "react";
import {usePathname} from "next/navigation";

const nav=[
 ["/partner","Partner Dashboard"],
 ["/partner/deals","Deal Management"],
 ["/partner/growth","Marketing Operations"],
 ["/partner/language","Language Operations"]
] as const;

export default function PartnerLayout({children}:{children:React.ReactNode}){
 const path=usePathname();
 useEffect(()=>{
  const current=nav.find(([href])=>href===path)?.[1]||"Partner Portal";
  document.title=`${current} | ROHILLA DRIVE`;
 },[path]);
 return <div className="rdPortal rdPartnerPortal">
  <div className="portalShellTop" data-no-translate="true">
   <div className="portalShellInner">
    <div className="portalIdentity"><b>ROHILLA DRIVE</b><small>Service Partner Network</small></div>
    <nav className="portalNav" aria-label="Partner portal navigation">
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
