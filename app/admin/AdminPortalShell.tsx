"use client";

import {useEffect,useRef,useState} from "react";
import {usePathname} from "next/navigation";
import {supabase} from "../supabaseClient";

const VAPID_PUBLIC_KEY="BCu-RuCf1vdiAr6eUOnZRKYTaBTqAdmknc0LtfXQO1kH4IGBM6lcw3VlwN2D26cTWPo2Iei7SyQUcLeWiR5cGXA";
type Counts={sales:number;services:number;dealers:number;partners:number;verification:number;dealerVehicles:number;dealRooms:number};
const emptyCounts:Counts={sales:0,services:0,dealers:0,partners:0,verification:0,dealerVehicles:0,dealRooms:0};
const navLinks=[
 {href:"/admin",label:"Dashboard"},
 {href:"/admin/add-vehicle",label:"Inventory"},
 {href:"/admin/revenue",label:"Revenue & Collections"},
 {href:"/admin/new-vehicles",label:"New Vehicle Leads"},
 {href:"/admin/deal-rooms",label:"Deal Management"},
 {href:"/admin/finance",label:"Transactions & RC"},
 {href:"/admin/poster-scan",label:"Listing Intake"},
 {href:"/admin/vehicle-ai",label:"Vehicle Intelligence"},
 {href:"/admin/verification",label:"Verification Operations"},
 {href:"/admin/growth",label:"Marketing Studio"},
 {href:"/admin/language",label:"Language Operations"},
 {href:"/admin/connections",label:"Integrations"}
];

function urlBase64ToUint8Array(base64String:string){
 const padding="=".repeat((4-base64String.length%4)%4);
 const base64=(base64String+padding).replace(/-/g,"+").replace(/_/g,"/");
 const raw=atob(base64);
 return Uint8Array.from([...raw].map(char=>char.charCodeAt(0)));
}

export default function AdminLayout({children}:{children:React.ReactNode}){
 const db=supabase();
 const path=usePathname();
 const [ready,setReady]=useState(false);
 const [counts,setCounts]=useState<Counts>(emptyCounts);
 const [pushEnabled,setPushEnabled]=useState(false);
 const [note,setNote]=useState("");
 const refreshRef=useRef<number|undefined>(undefined);
 const gateRef=useRef<number|undefined>(undefined);
 const current=navLinks.find(link=>link.href===path);
 const isInner=path!=="/admin";

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
   if(!("serviceWorker" in navigator)||!("PushManager" in window)||!("Notification" in window)){setNote("Browser notifications are not supported on this device.");return}
   const permission=await Notification.requestPermission();
   if(permission!=="granted"){setNote("Notification permission is blocked. Enable notifications in browser site settings and try again.");return}
   const reg=await navigator.serviceWorker.register("/admin-sw.js",{scope:"/"});
   await navigator.serviceWorker.ready;
   let sub=await reg.pushManager.getSubscription();
   if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:urlBase64ToUint8Array(VAPID_PUBLIC_KEY)});
   const json=sub.toJSON();
   const {data:{session}}=await db.auth.getSession();
   if(!session||!json.keys?.p256dh||!json.keys?.auth){setNote("Could not save the alert subscription.");return}
   const {error}=await db.from("admin_push_subscriptions").upsert({admin_user_id:session.user.id,endpoint:sub.endpoint,p256dh:json.keys.p256dh,auth:json.keys.auth,user_agent:navigator.userAgent,updated_at:new Date().toISOString()},{onConflict:"endpoint"});
   if(error){setNote(error.message);return}
   setPushEnabled(true);
   setNote("Admin alerts enabled. Sending a test notification…");
   const test=await db.rpc("test_rohilla_admin_push");
   setNote(test.error?`Alerts enabled; test failed: ${test.error.message}`:"Admin alerts enabled. Test notification sent.");
  }catch(err:any){setNote(err?.message||"Could not enable admin alerts.")}
 }

 async function testPush(){
  setNote("Sending test notification…");
  const {data,error}=await db.rpc("test_rohilla_admin_push");
  if(error){setNote(error.message);return}
  setNote(data?"Test notification sent.":"Test notification could not be sent.");
 }

 const total=Object.values(counts).reduce((sum,n)=>sum+n,0);
 const metrics=[
  ["Queue",total,"total"],["Customer Leads",counts.sales,""],["Service Requests",counts.services,""],["Dealer Reviews",counts.dealers,""],["Partner Reviews",counts.partners,""],["Verification",counts.verification,""],["Inventory Reviews",counts.dealerVehicles,""],["Active Deals",counts.dealRooms,""]
 ] as const;

 return <div className="rd-portal rd-admin-portal">
  {ready&&<div className="rdPortalTopbar" data-no-translate>
   <div className="rdPortalTopbarInner">
    <a className="rdPortalIdentity" href="/admin" aria-label="Administration dashboard">
     <span className="rdPortalMonogram">RD</span>
     <span className="rdPortalIdentityCopy"><b>ROHILLA DRIVE</b><small>Administration Console</small></span>
    </a>
    <nav className="rdPortalNav" aria-label="Administration navigation">
     {navLinks.map(link=><a key={link.href} href={link.href} className={path===link.href?"active":""} aria-current={path===link.href?"page":undefined}>{link.label}</a>)}
    </nav>
    <div className="rdPortalUtilities">
     <button onClick={loadCounts}>Refresh</button>
     <button className="premium" onClick={enablePush}>{pushEnabled?"Admin Alerts On":"Enable Admin Alerts"}</button>
     {pushEnabled&&<button onClick={testPush}>Test Alert</button>}
     <a href="/business-hub">Business Network</a>
     <a className="premium" href="/">Public Website</a>
    </div>
   </div>
   <div className="rdPortalOps"><div className="rdPortalOpsInner">
    {metrics.map(([label,value,kind])=><span key={label} className={`rdPortalMetric ${kind}`}><span>{label}</span><b>{value}</b></span>)}
    {note&&<span className="rdPortalMetric"><span>{note}</span></span>}
   </div></div>
  </div>}
  {ready&&isInner&&<div className="rdPortalContextBar" data-no-translate><a href="/admin" aria-label="Back to Administration Dashboard">← Back to Dashboard</a><span>{current?.label||"Administration Console"}</span></div>}
  {children}
 </div>;
}
