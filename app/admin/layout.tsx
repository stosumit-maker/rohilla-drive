"use client";

import {useEffect,useRef,useState} from "react";
import {usePathname} from "next/navigation";
import {supabase} from "../supabaseClient";

const VAPID_PUBLIC_KEY="BCu-RuCf1vdiAr6eUOnZRKYTaBTqAdmknc0LtfXQO1kH4IGBM6lcw3VlwN2D26cTWPo2Iei7SyQUcLeWiR5cGXA";
type Counts={sales:number;services:number;dealers:number;partners:number;verification:number;dealerVehicles:number;dealRooms:number};
const emptyCounts:Counts={sales:0,services:0,dealers:0,partners:0,verification:0,dealerVehicles:0,dealRooms:0};

const nav=[
 ["/admin","Executive Dashboard"],
 ["/admin/add-vehicle","Inventory Intake"],
 ["/admin/revenue","Revenue Management"],
 ["/admin/new-vehicles","New Vehicle Leads"],
 ["/admin/deal-rooms","Deal Management"],
 ["/admin/finance","Vehicle Ledger & RC"],
 ["/admin/poster-scan","Listing Intake"],
 ["/admin/vehicle-ai","Vehicle Intelligence"],
 ["/admin/verification","Verification Operations"],
 ["/admin/growth","Marketing Operations"],
 ["/admin/language","Language Operations"],
 ["/admin/connections","Integrations"]
] as const;

function urlBase64ToUint8Array(base64String:string){
 const padding="=".repeat((4-base64String.length%4)%4);
 const base64=(base64String+padding).replace(/-/g,"+").replace(/_/g,"/");
 const raw=atob(base64);
 return Uint8Array.from([...raw].map(char=>char.charCodeAt(0)));
}

export default function AdminLayout({children}:{children:React.ReactNode}){
 const path=usePathname();
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
  const current=nav.find(([href])=>href===path)?.[1]||"Administration";
  document.title=`${current} | ROHILLA DRIVE`;
 },[path]);

 useEffect(()=>{
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
   if(!("serviceWorker" in navigator)||!("PushManager" in window)||!("Notification" in window)){setNote("Push notifications are not supported in this browser.");return}
   const permission=await Notification.requestPermission();
   if(permission!=="granted"){setNote("Notification permission is disabled. Enable it in browser site settings and try again.");return}
   const reg=await navigator.serviceWorker.register("/admin-sw.js",{scope:"/"});
   await navigator.serviceWorker.ready;
   let sub=await reg.pushManager.getSubscription();
   if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:urlBase64ToUint8Array(VAPID_PUBLIC_KEY)});
   const json=sub.toJSON();
   const {data:{session}}=await db.auth.getSession();
   if(!session||!json.keys?.p256dh||!json.keys?.auth){setNote("The notification subscription could not be saved.");return}
   const {error}=await db.from("admin_push_subscriptions").upsert({admin_user_id:session.user.id,endpoint:sub.endpoint,p256dh:json.keys.p256dh,auth:json.keys.auth,user_agent:navigator.userAgent,updated_at:new Date().toISOString()},{onConflict:"endpoint"});
   if(error){setNote(error.message);return}
   setPushEnabled(true);
   const test=await db.rpc("test_rohilla_admin_push");
   setNote(test.error?`Notifications enabled; test delivery failed: ${test.error.message}`:"Notifications enabled. Test alert sent.");
  }catch(err:any){setNote(err?.message||"Notifications could not be enabled.")}
 }

 async function testPush(){
  setNote("Sending test notification…");
  const {data,error}=await db.rpc("test_rohilla_admin_push");
  if(error){setNote(error.message);return}
  setNote(data?"Test notification sent.":"Test notification could not be sent.");
 }

 const total=Object.values(counts).reduce((sum,n)=>sum+n,0);
 return <div className="rdPortal rdAdminPortal">
  {ready&&<div className="portalShellTop" data-no-translate="true">
   <div className="portalShellInner">
    <div className="portalIdentity"><b>ROHILLA DRIVE</b><small>Executive Operations Suite</small></div>
    <nav className="portalNav" aria-label="Administration navigation">
     {nav.map(([href,label])=><a key={href} href={href} data-active={path===href?"true":"false"}>{label}</a>)}
     <a href="/" target="_self">Customer Website</a>
    </nav>
    <div className="portalUtility">
     <button onClick={loadCounts}>Refresh</button>
     <button onClick={enablePush}>{pushEnabled?"Notifications On":"Enable Notifications"}</button>
     {pushEnabled&&<button onClick={testPush}>Test</button>}
    </div>
    <div className="portalMetrics" aria-label="Open work summary">
     <span className="portalMetric">Open work <strong>{total}</strong></span>
     <span className="portalMetric">Sales <strong>{counts.sales}</strong></span>
     <span className="portalMetric">Services <strong>{counts.services}</strong></span>
     <span className="portalMetric">Dealer applications <strong>{counts.dealers}</strong></span>
     <span className="portalMetric">Partner applications <strong>{counts.partners}</strong></span>
     <span className="portalMetric">Verification <strong>{counts.verification}</strong></span>
     <span className="portalMetric">Dealer inventory <strong>{counts.dealerVehicles}</strong></span>
     <span className="portalMetric">Active deals <strong>{counts.dealRooms}</strong></span>
    </div>
    {note&&<div className="portalNote">{note}</div>}
   </div>
  </div>}
  {children}
 </div>;
}
