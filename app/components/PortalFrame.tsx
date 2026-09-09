"use client";

import Link from "next/link";
import {usePathname,useRouter} from "next/navigation";
import {useEffect} from "react";

type PortalKind="admin"|"dealer"|"partner";
type NavItem={href:string;label:string};
type Props={portal:PortalKind;nav:NavItem[];children:React.ReactNode};

const portalNames:Record<PortalKind,string>={admin:"Administration",dealer:"Dealer Workspace",partner:"Partner Workspace"};
const routeTitles:Record<string,string>={
 "/admin":"Executive Dashboard","/admin/add-vehicle":"Inventory Publishing","/admin/connections":"Integrations & Connections","/admin/deal-rooms":"Deal Management","/admin/finance":"Transactions, Margin & RC","/admin/growth":"Marketing Studio","/admin/language":"Language Operations","/admin/new-vehicles":"New Vehicle Desk","/admin/poster-scan":"Listing Intake","/admin/revenue":"Revenue Intelligence","/admin/vehicle-ai":"Vehicle Intelligence","/admin/verification":"Verification Operations",
 "/dealer":"Dealer Dashboard","/dealer/deals":"Deal Management","/dealer/finance":"Vehicle Ledger & RC","/dealer/growth":"Marketing Studio","/dealer/language":"Language Operations","/dealer/new-opportunities":"New Vehicle Opportunities",
 "/partner":"Partner Dashboard","/partner/deals":"Deal Management","/partner/growth":"Marketing Studio","/partner/language":"Language Operations"
};

export default function PortalFrame({portal,nav,children}:Props){
 const pathname=usePathname();
 const router=useRouter();
 const title=routeTitles[pathname]||portalNames[portal];
 useEffect(()=>{
  document.body.classList.add("portal-mode",`portal-${portal}`);
  document.title=`${title} | ROHILLA DRIVE`;
  return()=>document.body.classList.remove("portal-mode",`portal-${portal}`);
 },[portal,title]);
 return <div className="rdPortal portal-frame">
  <div className="portal-suite-bar" data-no-translate="true">
   <div className="portal-suite-top">
    <div className="portal-suite-identity">
     <img src="/rohilla-drive-logo-light.svg" alt="ROHILLA DRIVE"/>
     <div><span>{portalNames[portal]}</span><strong>{title}</strong></div>
    </div>
    <div className="portal-suite-actions">
     <span className="portal-secure">SECURE WORKSPACE</span>
     <button type="button" className="portal-ghost" onClick={()=>router.back()}>Back</button>
     <Link className="portal-ghost" href="/">Customer Site</Link>
    </div>
   </div>
   <nav className="portal-suite-nav" aria-label={`${portalNames[portal]} navigation`}>
    {nav.map(item=><Link key={item.href} href={item.href} className={pathname===item.href?"active":""}>{item.label}</Link>)}
   </nav>
  </div>
  <div className="portal-page-context" data-no-translate="true"><div><span>ROHILLA DRIVE BUSINESS SUITE</span><h1>{title}</h1></div><span className="portal-context-role">{portalNames[portal]}</span></div>
  {children}
 </div>
}
