"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../supabaseClient";

const VAPID_PUBLIC_KEY="BCu-RuCf1vdiAr6eUOnZRKYTaBTqAdmknc0LtfXQO1kH4IGBM6lcw3VlwN2D26cTWPo2Iei7SyQUcLeWiR5cGXA";
type Counts={sales:number;services:number;dealers:number;partners:number;verification:number;dealerVehicles:number;dealRooms:number};
const emptyCounts:Counts={sales:0,services:0,dealers:0,partners:0,verification:0,dealerVehicles:0,dealRooms:0};

function urlBase64ToUint8Array(base64String:string){
 const padding="=".repeat((4-base64String.length%4)%4);
 const base64=(base64String+padding).replace(/-/g,"+").replace(/_/g,"/");
 const raw=atob(base64);
 return Uint8Array.from([...raw].map(char=>char.charCodeAt(0)));
}

export default function AdminLayout({children}:{children:React.ReactNode}){
 const db=supabase();
 const [ready,setReady]=useState(false);
 const [counts,setCounts]=useState<Counts>(emptyCounts);
 const [pushEnabled,setPushEnabled]=useState(false);
 const [note,setNote]=useState("");
 const refreshRef=useRef<number|undefined>(undefined);
 const gateRef=useRef<number|undefined>(undefined);

 async function countQuery(query:any){const {count}=await query;return count||0}
 async function loadCounts(){
  const [sales,services,dealers,partners,verification,dealerVehicles,dealRooms]=await Promise.all([
   countQuery(db.from("leads").select("id",{count:"exact",head:true}).in("status",["new","contacted","qualified"])),
   countQuery(db.from("service_requests").select("id",{count:"exact",head:true}).in("status",["new","assigned","accepted","in_progress"])),
   countQuery(db.from("dealer_applications").select("id",{count:"exact",head:true}).in("status",["new","reviewing"])),
   countQuery(db.from("collaboration_requests").select("id",{count:"exact",head:true}).in("status",["new","reviewing"])),
   countQuery(db.from("vehicle_verification_orders").select("id",{count:"exact",head:true}).in("status",["submitted","pending","processing","in_progress"])),
   countQuery(db.from("vehicles").select("id",{count:"exact",head:true}).eq("status","draft").not("partner_id","is",null)),
   countQuery(db.from("deal_rooms").select("id",{count:"exact",head:true}).not("status","in",'("closed","cancelled")'))
  ]);
  setCounts({sales,services,dealers,partners,verification,dealerVehicles,dealRooms});
 }

 async function checkPush(){
  if(!("serviceWorker" in navigator)||!("PushManager" in window)||!("Notification" in window))return;
  if(Notification.permission!=="granted"){setPushEnabled(false);return}
  const reg=await navigator.serviceWorker.register("/admin-sw.js",{scope:"/"});
  const sub=await reg.pushManager.getSubscription();
  setPushEnabled(Boolean(sub));
 }

 useEffect(()=>{
  document.title="Administration Console | ROHILLA DRIVE";
  let cancelled=false;
  async function gate(){
   const {data:{session}}=await db.auth.getSession();
   if(!session||cancelled)return;
   const {data:aal}=await db.auth.mfa.getAuthenticatorAssuranceLevel();
   if(aal?.currentLevel!=="aal2"){gateRef.current=window.setTimeout(gate,2500);return}
   const {data:isAdmin}=await db.rpc("is_admin");
   if(!isAdmin||cancelled)return;
   setReady(true);
   await Promise.all([loadCounts(),checkPush()]);
   refreshRef.current=window.setInterval(loadCounts,30000);
  }
  gate();
  return()=>{cancelled=true;if(gateRef.current)window.clearTimeout(gateRef.current);if(refreshRef.current)window.clearInterval(refreshRef.current)};
 },[]);

 async function enablePush(){
  try{
   setNote("");
   if(!("serviceWorker" in navigator)||!("PushManager" in window)||!("Notification" in window)){setNote("Notifications are not supported in this browser.");return}
   const permission=await Notification.requestPermission();
   if(permission!=="granted"){setNote("Notification permission is disabled. Enable it in browser site settings and try again.");return}
   const reg=await navigator.serviceWorker.register("/admin-sw.js",{scope:"/"});
   await navigator.serviceWorker.ready;
   let sub=await reg.pushManager.getSubscription();
   if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:urlBase64ToUint8Array(VAPID_PUBLIC_KEY)});
   const json=sub.toJSON();
   const {data:{session}}=await db.auth.getSession();
   if(!session||!json.keys?.p256dh||!json.keys?.auth){setNote("Could not save the notification subscription.");return}
   const {error}=await db.from("admin_push_subscriptions").upsert({admin_user_id:session.user.id,endpoint:sub.endpoint,p256dh:json.keys.p256dh,auth:json.keys.auth,user_agent:navigator.userAgent,updated_at:new Date().toISOString()},{onConflict:"endpoint"});
   if(error){setNote(error.message);return}
   setPushEnabled(true);
   setNote("Notifications enabled. Sending a test alert…");
   const test=await db.rpc("test_rohilla_admin_push");
   setNote(test.error?`Notifications enabled; test alert failed: ${test.error.message}`:"Notifications enabled. Test alert sent successfully.");
  }catch(err:any){setNote(err?.message||"Could not enable notifications.")}
 }

 async function testPush(){setNote("Sending test alert…");const {data,error}=await db.rpc("test_rohilla_admin_push");if(error){setNote(error.message);return}setNote(data?"Test alert sent successfully.":"Test alert could not be sent.")}

 const total=Object.values(counts).reduce((sum,n)=>sum+n,0);
 const navStyle={padding:"8px 11px",borderRadius:8,border:"1px solid #475569",background:"#111827",color:"#fff",fontWeight:700,textDecoration:"none",fontSize:12} as const;
 return <>
  <style jsx global>{`
   body{background:#f5f7fb}.auth{max-width:460px!important;margin:72px auto!important;padding:28px!important;border:1px solid #d8dee9!important;border-radius:18px!important;background:#fff!important;box-shadow:0 18px 50px rgba(15,23,42,.08)!important}.auth h1{letter-spacing:-.02em}.auth button,.adminForm button{min-height:44px}.section{max-width:1200px;margin-left:auto;margin-right:auto}.section h1,.section h2{letter-spacing:-.02em}header{border-bottom:1px solid #e2e8f0}.brand small{opacity:.78}
  `}</style>
  {!ready&&<div data-no-translate style={{padding:"12px 18px",background:"#0f172a",color:"#fff",borderBottom:"1px solid #334155"}}><div style={{maxWidth:1200,margin:"0 auto",display:"flex",justifyContent:"space-between",gap:16,alignItems:"center"}}><div><strong style={{letterSpacing:.6}}>ROHILLA DRIVE</strong><div style={{fontSize:12,color:"#cbd5e1"}}>Administration Console</div></div><span style={{fontSize:12,color:"#cbd5e1"}}>Restricted access</span></div></div>}
  {ready&&<div data-no-translate style={{position:"sticky",top:0,zIndex:9999,background:"#0f172a",color:"#fff",borderBottom:"1px solid #334155",boxShadow:"0 8px 24px rgba(15,23,42,.12)",padding:"10px 12px"}}>
   <div style={{maxWidth:1200,margin:"0 auto",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
    <div style={{marginRight:8}}><strong style={{letterSpacing:.5}}>ROHILLA DRIVE</strong><div style={{fontSize:11,color:"#cbd5e1"}}>Administration Console</div></div>
    <span style={{fontSize:12,fontWeight:800,color:"#f8fafc"}}>Open items: {total}</span>
    <span style={{fontSize:12,color:"#cbd5e1"}}>Sales {counts.sales}</span><span style={{fontSize:12,color:"#cbd5e1"}}>Services {counts.services}</span><span style={{fontSize:12,color:"#cbd5e1"}}>Dealer applications {counts.dealers}</span><span style={{fontSize:12,color:"#cbd5e1"}}>Partner applications {counts.partners}</span><span style={{fontSize:12,color:"#cbd5e1"}}>Verification {counts.verification}</span><span style={{fontSize:12,color:"#cbd5e1"}}>Draft inventory {counts.dealerVehicles}</span><span style={{fontSize:12,color:"#cbd5e1"}}>Active deals {counts.dealRooms}</span>
    <div style={{width:"100%",display:"flex",gap:6,flexWrap:"wrap"}}>
     <a href="/admin" style={navStyle}>Dashboard</a><a href="/admin/add-vehicle" style={navStyle}>Inventory Management</a><a href="/admin/revenue" style={navStyle}>Revenue</a><a href="/admin/new-vehicles" style={navStyle}>New Vehicle Leads</a><a href="/admin/deal-rooms" style={navStyle}>Deal Management</a><a href="/admin/finance" style={navStyle}>Transactions & RC</a><a href="/admin/poster-scan" style={navStyle}>Listing Assistant</a><a href="/admin/vehicle-ai" style={navStyle}>Vehicle Intelligence</a><a href="/admin/verification" style={navStyle}>Verification</a><a href="/admin/growth" style={navStyle}>Marketing</a><a href="/admin/language" style={navStyle}>Language Support</a><a href="/admin/connections" style={navStyle}>Integrations</a><a href="/business-hub" style={navStyle}>Business Network</a><a href="/inventory" style={navStyle}>Public Inventory</a><a href="/new-vehicles" style={navStyle}>Public New Vehicles</a><a href="/" style={{...navStyle,background:"#fff",color:"#0f172a",border:"1px solid #e2e8f0"}}>Customer Website</a>
    </div>
    <div style={{marginLeft:"auto",display:"flex",gap:6,flexWrap:"wrap"}}><button onClick={loadCounts} style={{padding:"8px 11px",borderRadius:8,border:"1px solid #475569",background:"#111827",color:"#fff",fontWeight:700}}>Refresh</button><button onClick={enablePush} style={{padding:"8px 11px",borderRadius:8,border:"1px solid #64748b",background:pushEnabled?"#173326":"#111827",color:"#fff",fontWeight:700}}>{pushEnabled?"Notifications On":"Enable Notifications"}</button>{pushEnabled&&<button onClick={testPush} style={{padding:"8px 11px",borderRadius:8,border:"1px solid #475569",background:"#111827",color:"#fff",fontWeight:700}}>Test Alert</button>}</div>
    {note&&<small style={{width:"100%",color:"#cbd5e1"}}>{note}</small>}
   </div>
  </div>}
  {children}
 </>;
}
