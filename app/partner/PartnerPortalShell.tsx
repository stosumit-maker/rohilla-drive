"use client";
import {usePathname} from "next/navigation";

const links=[
 {href:"/partner",label:"Dashboard"},
 {href:"/partner/deals",label:"Deal Management"},
 {href:"/partner/growth",label:"Marketing Studio"},
 {href:"/partner/language",label:"Language Operations"}
];
const navItemStyle={minHeight:40,display:"inline-flex",alignItems:"center"} as const;
const contextStyle={maxWidth:1340,margin:"0 auto",padding:"10px 22px 0",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap" as const};
const backStyle={display:"inline-flex",alignItems:"center",minHeight:40,padding:"8px 12px",border:"1px solid #98a2b3",borderRadius:999,background:"#fff",color:"#101828",fontSize:12,fontWeight:900,textDecoration:"none",boxShadow:"0 2px 8px rgba(15,23,42,.08)"};
const sectionStyle={fontSize:11,fontWeight:800,color:"#667085"};

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
     {links.map(link=><a key={link.href} href={link.href} style={navItemStyle} className={path===link.href?"active":""} aria-current={path===link.href?"page":undefined}>{link.label}</a>)}
    </nav>
    <div className="rdPortalUtilities"><a href="/business-hub">Business Hub</a><a className="premium" href="/">Public Website</a></div>
   </div>
  </div>
  {isInner&&<div className="rdPortalContextBar" data-no-translate style={contextStyle}><a href="/partner" aria-label="Back to Partner Dashboard" style={backStyle}>← Back to Dashboard</a><span style={sectionStyle}>Current section: {current?.label||"Partner Workspace"}</span></div>}
  {children}
 </div>;
}
