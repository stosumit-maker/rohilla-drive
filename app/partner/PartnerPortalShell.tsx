"use client";
import {useEffect,useState} from "react";
import {usePathname} from "next/navigation";
import {supabase} from "../supabaseClient";

const links=[
 {href:"/partner",label:"Dashboard"},
 {href:"/partner/kyc",label:"KYC & Documents"},
 {href:"/partner/deals",label:"Deal Management"},
 {href:"/partner/growth",label:"Marketing Studio"},
 {href:"/partner/language",label:"Language Operations"}
];
const navItemStyle={minHeight:40,display:"inline-flex",alignItems:"center"} as const;
const contextStyle={maxWidth:1340,margin:"0 auto",padding:"10px 22px 0",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap" as const};
const backStyle={display:"inline-flex",alignItems:"center",minHeight:40,padding:"8px 12px",border:"1px solid #98a2b3",borderRadius:999,background:"#fff",color:"#101828",fontSize:12,fontWeight:900,textDecoration:"none",boxShadow:"0 2px 8px rgba(15,23,42,.08)"};
const sectionStyle={fontSize:11,fontWeight:800,color:"#667085"};

export default function PartnerLayout({children}:{children:React.ReactNode}){
 const db=supabase();
 const path=usePathname();
 const [partnerRole,setPartnerRole]=useState(false);
 const [ready,setReady]=useState(false);
 const [checked,setChecked]=useState(false);
 const current=links.find(link=>link.href===path);
 const isInner=path!=="/partner";
 const isKyc=path==="/partner/kyc";

 useEffect(()=>{
  let cancelled=false;
  async function gate(nextSession?:any){
   let session=nextSession;
   if(session===undefined){
    const {data}=await db.auth.getSession();
    session=data.session;
   }
   if(cancelled)return;
   if(!session){setPartnerRole(false);setReady(false);setChecked(true);return}
   const {data:profile}=await db.from("profiles").select("role,active").eq("id",session.user.id).single();
   if(cancelled)return;
   const isPartner=profile?.role==="partner";
   setPartnerRole(Boolean(isPartner));
   setReady(Boolean(isPartner&&profile?.active));
   setChecked(true);
  }
  void gate();
  const {data:{subscription}}=db.auth.onAuthStateChange((_event,session)=>{
   window.setTimeout(()=>{void gate(session)},0);
  });
  return()=>{cancelled=true;subscription.unsubscribe()};
 },[]);

 const signOut=()=>db.auth.signOut().then(()=>{location.href="/partner"});
 const visibleLinks=ready?links:links.filter(link=>link.href==="/partner"||link.href==="/partner/kyc");
 const protectedContent=!checked
  ?<main className="section"><h2>Checking Partner Workspace access…</h2></main>
  :isKyc&&partnerRole
   ?children
   :ready
    ?children
    :partnerRole
     ?<main className="section"><div className="auth"><h1>ROHILLA DRIVE</h1><h2>Partner Approval Required</h2><p>Complete KYC and wait for approval before opening operational Partner Workspace sections.</p><a className="call" href="/partner/kyc">Open KYC & Documents</a><a href="/partner">Partner Dashboard</a></div></main>
     :<main className="section"><div className="auth"><h1>ROHILLA DRIVE</h1><h2>Partner Authentication Required</h2><p>Sign in with a partner account before opening this section.</p><a className="call" href="/partner">Go to Partner Sign In</a><a href="/business-hub">Create / Apply for Partner Account</a></div></main>;

 return <div className="rd-portal rd-partner-portal">
  {partnerRole&&<div className="rdPortalTopbar" data-no-translate>
   <div className="rdPortalTopbarInner">
    <a className="rdPortalIdentity" href="/partner" aria-label="Partner dashboard">
     <span className="rdPortalMonogram">RD</span>
     <span className="rdPortalIdentityCopy"><b>ROHILLA DRIVE</b><small>Partner Workspace</small></span>
    </a>
    <nav className="rdPortalNav" aria-label="Partner workspace navigation">
     {visibleLinks.map(link=><a key={link.href} href={link.href} style={navItemStyle} className={path===link.href?"active":""} aria-current={path===link.href?"page":undefined}>{link.label}</a>)}
    </nav>
    <div className="rdPortalUtilities"><a href="/business-hub">Business Hub</a><a className="premium" href="/">Public Website</a><button onClick={signOut}>Sign Out</button></div>
   </div>
  </div>}
  {partnerRole&&isInner&&(ready||isKyc)&&<div className="rdPortalContextBar" data-no-translate style={contextStyle}><a href="/partner" aria-label="Back to Partner Dashboard" style={backStyle}>← Back to Dashboard</a><span style={sectionStyle}>Current section: {current?.label||"Partner Workspace"}</span></div>}
  {isInner?protectedContent:children}
 </div>;
}
