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
const navItemStyle={minHeight:40,display:"inline-flex",alignItems:"center"} as const;
const contextStyle={maxWidth:1340,margin:"0 auto",padding:"10px 22px 0",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap" as const};
const backStyle={display:"inline-flex",alignItems:"center",minHeight:40,padding:"8px 12px",border:"1px solid #98a2b3",borderRadius:999,background:"#fff",color:"#101828",fontSize:12,fontWeight:900,textDecoration:"none",boxShadow:"0 2px 8px rgba(15,23,42,.08)"};
const sectionStyle={fontSize:11,fontWeight:800,color:"#667085"};

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
     {links.map(link=><a key={link.href} href={link.href} style={navItemStyle} className={path===link.href?"active":""} aria-current={path===link.href?"page":undefined}>{link.label}</a>)}
    </nav>
    <div className="rdPortalUtilities"><a href="/business-hub">Business Hub</a><a className="premium" href="/">Public Website</a></div>
   </div>
  </div>
  {isInner&&<div className="rdPortalContextBar" data-no-translate style={contextStyle}><a href="/dealer" aria-label="Back to Dealer Dashboard" style={backStyle}>← Back to Dashboard</a><span style={sectionStyle}>Current section: {current?.label||"Dealer Workspace"}</span></div>}
  {children}
 </div>;
}
