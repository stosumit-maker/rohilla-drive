"use client";
import {usePathname} from "next/navigation";

const links=[
 {href:"/partner",label:"Dashboard"},
 {href:"/partner/deals",label:"Deal Management"},
 {href:"/partner/growth",label:"Marketing Studio"},
 {href:"/partner/language",label:"Language Operations"}
];

export default function PartnerLayout({children}:{children:React.ReactNode}){
 const path=usePathname();
 const current=links.find(link=>link.href===path);
 const isInner=path!=="/partner";
 return <div className="rd-portal rd-partner-portal">
  <div className="rdPortalTopbar" data-no-translate>
   <div className="rdPortalTopbarInner">
    <a className="rdPortalIdentity" href="/partner" aria-label="Partner dashboard">
     <span className="rdPortalMonogram">RD</span>
     <span className="rdPortalIdentityCopy"><b>ROHILLA DRIVE</b><small>Partner Workspace</small></span>
    </a>
    <nav className="rdPortalNav" aria-label="Partner workspace navigation">
     {links.map(link=><a key={link.href} href={link.href} className={path===link.href?"active":""} aria-current={path===link.href?"page":undefined}>{link.label}</a>)}
    </nav>
    <div className="rdPortalUtilities"><a href="/business-hub">Business Network</a><a className="premium" href="/">Public Website</a></div>
   </div>
  </div>
  {isInner&&<div className="rdPortalContextBar" data-no-translate><a href="/partner" aria-label="Back to Partner Dashboard">← Back to Dashboard</a><span>{current?.label||"Partner Workspace"}</span></div>}
  {children}
 </div>;
}
