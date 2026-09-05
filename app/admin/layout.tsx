"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../supabaseClient";

const VAPID_PUBLIC_KEY="BCu-RuCf1vdiAr6eUOnZRKYTaBTqAdmknc0LtfXQO1kH4IGBM6lcw3VlwN2D26cTWPo2Iei7SyQUcLeWiR5cGXA";
type Counts={sales:number;services:number;dealers:number;partners:number;verification:number;dealerVehicles:number};
const emptyCounts:Counts={sales:0,services:0,dealers:0,partners:0,verification:0,dealerVehicles:0};

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
  const [sales,services,dealers,partners,verification,dealerVehicles]=await Promise.all([
   countQuery(db.from("leads").select("id",{count:"exact",head:true}).in("status",["new","contacted","qualified"])),
   countQuery(db.from("service_requests").select("id",{count:"exact",head:true}).in("status",["new","assigned","accepted","in_progress"])),
   countQuery(db.from("dealer_applications").select("id",{count:"exact",head:true}).in("status",["new","reviewing"])),
   countQuery(db.from("collaboration_requests").select("id",{count:"exact",head:true}).in("status",["new","reviewing"])),
   countQuery(db.from("vehicle_verification_orders").select("id",{count:"exact",head:true}).in("status",["submitted","pending","processing","in_progress"])),
   countQuery(db.from("vehicles").select("id",{count:"exact",head:true}).eq("status","draft").not("partner_id","is",null))
  ]);
  setCounts({sales,services,dealers,partners,verification,dealerVehicles});
 }

 async function checkPush(){
  if(!("serviceWorker" in navigator)||!("PushManager" in window)||!("Notification" in window))return;
  if(Notification.permission!=="granted"){setPushEnabled(false);return}
  const reg=await navigator.serviceWorker.register("/admin-sw.js",{scope:"/"});
  const sub=await reg.pushManager.getSubscription();
  setPushEnabled(Boolean(sub));
 }

 useEffect(()=>{
  let cancelled=false;
  async function gate(){
   const {data:{session}}=await db.auth.getSession();
   if(!session||cancelled)return;
   const {data:aal}=await db.auth.mfa.getAuthenticatorAssuranceLevel();
   if(aal?.currentLevel!=="aal2"){
    gateRef.current=window.setTimeout(gate,2500);
    return;
   }
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
   if(!("serviceWorker" in navigator)||!("PushManager" in window)||!("Notification" in window)){setNote("Phone push is not supported in this browser.");return}
   const permission=await Notification.requestPermission();
   if(permission!=="granted"){setNote("Notification permission was not allowed. Chrome Site settings में Notifications allow करके दोबारा try करें.");return}
   const reg=await navigator.serviceWorker.register("/admin-sw.js",{scope:"/"});
   await navigator.serviceWorker.ready;
   let sub=await reg.pushManager.getSubscription();
   if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:urlBase64ToUint8Array(VAPID_PUBLIC_KEY)});
   const json=sub.toJSON();
   const {data:{session}}=await db.auth.getSession();
   if(!session||!json.keys?.p256dh||!json.keys?.auth){setNote("Could not save phone alert subscription.");return}
   const {error}=await db.from("admin_push_subscriptions").upsert({admin_user_id:session.user.id,endpoint:sub.endpoint,p256dh:json.keys.p256dh,auth:json.keys.auth,user_agent:navigator.userAgent,updated_at:new Date().toISOString()},{onConflict:"endpoint"});
   if(error){setNote(error.message);return}
   setPushEnabled(true);
   setNote("Phone alerts enabled ✓ Sending test…");
   const test=await db.rpc("test_rohilla_admin_push");
   setNote(test.error?`Phone alerts enabled, test failed: ${test.error.message}`:"Phone alerts enabled ✓ Test notification sent.");
  }catch(err:any){setNote(err?.message||"Could not enable phone alerts.")}
 }

 async function testPush(){
  setNote("Sending test alert…");
  const {data,error}=await db.rpc("test_rohilla_admin_push");
  if(error){setNote(error.message);return}
  setNote(data?"Test notification sent ✓":"Test notification could not be sent.");
 }

 const total=Object.values(counts).reduce((sum,n)=>sum+n,0);
 const navStyle={padding:"7px 10px",borderRadius:999,border:"1px solid #475569",background:"#111827",color:"#fff",fontWeight:700,textDecoration:"none",fontSize:12} as const;
 return <>
  {ready&&<div style={{position:"sticky",top:0,zIndex:9999,background:"linear-gradient(135deg,#0b1322,#1d2738)",color:"#fff",borderBottom:"1px solid rgba(215,181,109,.7)",boxShadow:"0 8px 24px rgba(0,0,0,.15)",padding:"9px 12px"}}>
   <div style={{maxWidth:1200,margin:"0 auto",display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
    <strong style={{color:"#f4d38a",letterSpacing:.5}}>PENDING TASKS: {total}</strong>
    <span style={{fontSize:12}}>Sales {counts.sales}</span><span style={{fontSize:12}}>Services {counts.services}</span><span style={{fontSize:12}}>Dealer Apps {counts.dealers}</span><span style={{fontSize:12}}>Partner Apps {counts.partners}</span><span style={{fontSize:12}}>Verify {counts.verification}</span><span style={{fontSize:12}}>Dealer Vehicles {counts.dealerVehicles}</span>
    <div style={{width:"100%",display:"flex",gap:6,flexWrap:"wrap"}}><a href="/admin" style={navStyle}>Control Room</a><a href="/admin/finance" style={navStyle}>Purchase / Sale / Margin / RC</a><a href="/admin/poster-scan" style={navStyle}>Smart Poster Scan</a><a href="/admin/verification" style={navStyle}>Verification Desk</a></div>
    <div style={{marginLeft:"auto",display:"flex",gap:6,flexWrap:"wrap"}}>
     <button onClick={loadCounts} style={{padding:"7px 10px",borderRadius:999,border:"1px solid #475569",background:"#111827",color:"#fff",fontWeight:700}}>Refresh</button>
     <button onClick={enablePush} style={{padding:"7px 10px",borderRadius:999,border:"1px solid #d7b56d",background:pushEnabled?"#173326":"#2a2110",color:"#f4d38a",fontWeight:800}}>{pushEnabled?"🔔 Phone Alerts ON":"🔔 Enable Phone Alerts"}</button>
     {pushEnabled&&<button onClick={testPush} style={{padding:"7px 10px",borderRadius:999,border:"1px solid #475569",background:"#111827",color:"#fff",fontWeight:700}}>Test Alert</button>}
    </div>
    {note&&<small style={{width:"100%",color:"#cbd5e1"}}>{note}</small>}
   </div>
  </div>}
  {children}
 </>;
}
