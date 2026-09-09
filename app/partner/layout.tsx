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
 return <div className="rd-portal rd-partner-portal">
  <div className="rdPortalTopbar" data-no-translate>
   <div className="rdPortalTopbarInner">
    <a className="rdPortalIdentity" href="/partner">
     <span className="rdPortalMonogram">RD</span>
     <span className="rdPortalIdentityCopy"><b>ROHILLA DRIVE</b><small>Partner Workspace</small></span>
    </a>
    <nav className="rdPortalNav" aria-label="Partner workspace navigation">
     {links.map(link=><a key={link.href} href={link.href} className={path===link.href?"active":""}>{link.label}</a>)}
    </nav>
    <div className="rdPortalUtilities"><a href="/business-hub">Business Network</a><a className="premium" href="/">Public Website</a></div>
   </div>
  </div>
  {children}
 </div>;
}
