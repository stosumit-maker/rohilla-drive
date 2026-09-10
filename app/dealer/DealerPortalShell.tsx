"use client";
import {usePathname} from "next/navigation";

const links=[
 {href:"/dealer",label:"Dashboard"},
 {href:"/dealer/new-opportunities",label:"New Vehicle Leads"},
 {href:"/dealer/deals",label:"Deal Management"},
 {href:"/dealer/finance",label:"Vehicle Ledger & RC"},
 {href:"/dealer/growth",label:"Marketing Studio"},
 {href:"/dealer/language",label:"Language Operations"}
];

export default function DealerLayout({children}:{children:React.ReactNode}){
 const path=usePathname();
 const current=links.find(link=>link.href===path);
 const isInner=path!=="/dealer";
 return <div className="rd-portal rd-dealer-portal">
  <div className="rdPortalTopbar" data-no-translate>
   <div className="rdPortalTopbarInner">
    <a className="rdPortalIdentity" href="/dealer" aria-label="Dealer dashboard">
     <span className="rdPortalMonogram">RD</span>
     <span className="rdPortalIdentityCopy"><b>ROHILLA DRIVE</b><small>Dealer Workspace</small></span>
    </a>
    <nav className="rdPortalNav" aria-label="Dealer workspace navigation">
     {links.map(link=><a key={link.href} href={link.href} className={path===link.href?"active":""} aria-current={path===link.href?"page":undefined}>{link.label}</a>)}
    </nav>
    <div className="rdPortalUtilities"><a href="/business-hub">Business Network</a><a className="premium" href="/">Public Website</a></div>
   </div>
  </div>
  {isInner&&<div className="rdPortalContextBar" data-no-translate><a href="/dealer" aria-label="Back to Dealer Dashboard">← Back to Dashboard</a><span>{current?.label||"Dealer Workspace"}</span></div>}
  {children}
 </div>;
}
