"use client";
import {useEffect,useState} from "react";
import {usePathname} from "next/navigation";
import {supabase} from "../supabaseClient";

const links=[
 {href:"/dealer",label:"Dashboard"},
 {href:"/dealer/new-opportunities",label:"New Vehicle Leads"},
 {href:"/dealer/deals",label:"Deal Management"},
 {href:"/dealer/finance",label:"Vehicle Ledger & RC"},
 {href:"/dealer/growth",label:"Marketing Studio"}
];
const navItemStyle={minHeight:40,display:"inline-flex",alignItems:"center"} as const;
const contextStyle={maxWidth:1340,margin:"0 auto",padding:"10px 22px 0",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap" as const};
const backStyle={display:"inline-flex",alignItems:"center",minHeight:40,padding:"8px 12px",border:"1px solid #98a2b3",borderRadius:999,background:"#fff",color:"#101828",fontSize:12,fontWeight:900,textDecoration:"none",boxShadow:"0 2px 8px rgba(15,23,42,.08)"};
const sectionStyle={fontSize:11,fontWeight:800,color:"#667085"};

export default function DealerLayout({children}:{children:React.ReactNode}){
 const db=supabase();
 const path=usePathname();
 const [ready,setReady]=useState(false);
 const [checked,setChecked]=useState(false);
 const current=links.find(link=>link.href===path);
 const isInner=path!=="/dealer";

 useEffect(()=>{
  let cancelled=false;
  async function gate(nextSession?:any){
   let session=nextSession;
   if(session===undefined){
    const {data}=await db.auth.getSession();
    session=data.session;
   }
   if(cancelled)return;
   if(!session){setReady(false);setChecked(true);return}
   const {data:profile}=await db.from("profiles").select("role,active").eq("id",session.user.id).single();
   if(cancelled)return;
   setReady(Boolean(profile?.role==="dealer"&&profile?.active));
   setChecked(true);
  }
  void gate();
  const {data:{subscription}}=db.auth.onAuthStateChange((_event,session)=>{
   window.setTimeout(()=>{void gate(session)},0);
  });
  return()=>{cancelled=true;subscription.unsubscribe()};
 },[]);

 const signOut=()=>db.auth.signOut().then(()=>{location.href="/dealer"});
 const protectedContent=!checked
  ?<main className="section"><h2>Checking Dealer Workspace access…</h2></main>
  :ready
   ?children
   :<main className="section"><div className="auth"><h1>ROHILLA DRIVE</h1><h2>Dealer Authentication Required</h2><p>Sign in with an approved and active dealer account before opening this section.</p><a className="call" href="/dealer">Go to Dealer Sign In</a><a href="/business-hub">Create / Apply for Dealer Account</a></div></main>;

 return <div className="rd-portal rd-dealer-portal">
  {ready&&<div className="rdPortalTopbar" data-no-translate>
   <div className="rdPortalTopbarInner">
    <a className="rdPortalIdentity" href="/dealer" aria-label="Dealer dashboard">
     <span className="rdPortalMonogram">RD</span>
     <span className="rdPortalIdentityCopy"><b>ROHILLA DRIVE</b><small>Dealer Workspace</small></span>
    </a>
    <nav className="rdPortalNav" aria-label="Dealer workspace navigation">
     {links.map(link=><a key={link.href} href={link.href} style={navItemStyle} className={path===link.href?"active":""} aria-current={path===link.href?"page":undefined}>{link.label}</a>)}
    </nav>
    <div className="rdPortalUtilities"><a href="/business-hub">Business Hub</a><a className="premium" href="/">Home</a><button onClick={signOut}>Sign Out</button></div>
   </div>
  </div>}
  {ready&&isInner&&<div className="rdPortalContextBar" data-no-translate style={contextStyle}><a href="/dealer" aria-label="Back to Dealer Dashboard" style={backStyle}>← Back to Dashboard</a><span style={sectionStyle}>Current section: {current?.label||"Dealer Workspace"}</span></div>}
  {isInner?protectedContent:children}
 </div>;
}
