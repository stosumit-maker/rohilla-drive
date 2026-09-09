"use client";

import {useEffect,useRef,useState} from "react";
import {supabase} from "../supabaseClient";
import PortalFrame from "../components/PortalFrame";

const VAPID_PUBLIC_KEY="BCu-RuCf1vdiAr6eUOnZRKYTaBTqAdmknc0LtfXQO1kH4IGBM6lcw3VlwN2D26cTWPo2Iei7SyQUcLeWiR5cGXA";
type Counts={sales:number;services:number;dealers:number;partners:number;verification:number;dealerVehicles:number;dealRooms:number};
const emptyCounts:Counts={sales:0,services:0,dealers:0,partners:0,verification:0,dealerVehicles:0,dealRooms:0};

const nav=[
 {href:"/admin",label:"Dashboard"},
 {href:"/admin/add-vehicle",label:"Inventory"},
 {href:"/admin/revenue",label:"Revenue"},
 {href:"/admin/new-vehicles",label:"New Vehicle Desk"},
 {href:"/admin/deal-rooms",label:"Deal Management"},
 {href:"/admin/finance",label:"Transactions & RC"},
 {href:"/admin/poster-scan",label:"Listing Intake"},
 {href:"/admin/vehicle-ai",label:"Vehicle Intelligence"},
 {href:"/admin/verification",label:"Verification"},
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
   if(!("serviceWorker" in navigator)||!("PushManager" in window)||!("Notification" in window)){setNote("Phone notifications are not supported in this browser.");return}
   const permission=await Notification.requestPermission();
   if(permission!=="granted"){setNote("Notification permission was not allowed. Enable notifications in Chrome Site Settings and try again.");return}
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
   setNote("Phone notifications enabled. Sending a test notification…");
   const test=await db.rpc("test_rohilla_admin_push");
   setNote(test.error?`Notifications enabled; test failed: ${test.error.message}`:"Phone notifications enabled. Test sent successfully.");
  }catch(err:any){setNote(err?.message||"Could not enable phone notifications.")}
 }

 async function testPush(){
  setNote("Sending test notification…");
  const {data,error}=await db.rpc("test_rohilla_admin_push");
  if(error){setNote(error.message);return}
  setNote(data?"Test notification sent successfully.":"Test notification could not be sent.");
 }

 const total=Object.values(counts).reduce((sum,n)=>sum+n,0);
 return <PortalFrame portal="admin" nav={nav}>
  {ready&&<div className="portal-ops-strip" data-no-translate="true">
   <strong>OPERATIONS SUMMARY</strong>
   <span className="portal-ops-chip">Open {total}</span>
   <span className="portal-ops-chip">Sales {counts.sales}</span>
   <span className="portal-ops-chip">Services {counts.services}</span>
   <span className="portal-ops-chip">Dealer Reviews {counts.dealers}</span>
   <span className="portal-ops-chip">Partner Reviews {counts.partners}</span>
   <span className="portal-ops-chip">Verification {counts.verification}</span>
   <span className="portal-ops-chip">Inventory Review {counts.dealerVehicles}</span>
   <span className="portal-ops-chip">Active Deals {counts.dealRooms}</span>
   <div className="portal-ops-actions">
    <button onClick={loadCounts}>Refresh</button>
    <button onClick={enablePush}>{pushEnabled?"Notifications On":"Enable Notifications"}</button>
    {pushEnabled&&<button onClick={testPush}>Send Test</button>}
   </div>
   {note&&<small style={{width:"100%",color:"#66758a"}}>{note}</small>}
  </div>}
  {children}
 </PortalFrame>;
}
