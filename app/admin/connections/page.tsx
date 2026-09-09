"use client";
import {useEffect,useState} from "react";
import {supabase} from "../../supabaseClient";

const needs:Record<string,string>={
 instagram:"Official Meta business connection and approved publishing permissions.",
 facebook:"Official Facebook Page authorisation and approved publishing permissions.",
 youtube:"Google account authorisation for the Rohilla Drive YouTube channel and approved upload access.",
 google_ads:"Google Ads account, billing, API access and an Admin-approved advertising budget.",
 google_search_console:"Verified Search Console property and authorised Google access for performance reporting."
};
const realtimeNeeds=[
 ["translation","Website & Message Translation","Page localization, multilingual messages and customer replies.","Approved translation service connection"],
 ["realtime_translation","Live Voice Interpretation","Browser-based speech interpretation for Admin, Dealer and Partner communication workspaces.","Approved realtime speech service connection"],
 ["speech","Speech Services","Speech transcription and translated voice output where enabled.","Approved speech service connection"],
 ["telephony","Telephone Interpretation","Business phone routing and live audio integration for translated calls.","Approved telephony account and media connection"],
 ["multimodal_ai","Vehicle Image Analysis","Vehicle, poster and document image analysis with privacy and uncertainty controls.","Approved image-analysis service connection"]
] as const;
export default function Connections(){
 const db=supabase();const [ready,setReady]=useState(false);const [rows,setRows]=useState<any[]>([]);const [runtime,setRuntime]=useState<Record<string,boolean>>({});const [msg,setMsg]=useState("");
 useEffect(()=>{(async()=>{const {data:{session}}=await db.auth.getSession();if(!session){setMsg("Admin login required.");return}const [{data:aal},{data:isAdmin}]=await Promise.all([db.auth.mfa.getAuthenticatorAssuranceLevel(),db.rpc("is_admin")]);if(aal?.currentLevel!=="aal2"||!isAdmin){setMsg("Admin Authenticator verification is required.");return}setReady(true);const [{data,error},statusRes]=await Promise.all([db.from("platform_connections").select("*").order("platform"),fetch("/api/connection-status",{cache:"no-store"})]);if(error){setMsg(error.message);return}setRows(data||[]);if(statusRes.ok)setRuntime(await statusRes.json())})()},[]);
 if(!ready)return <main><section className="section"><h1>Integrations</h1><p>{msg||"Checking secure access…"}</p><a href="/admin">Back to Operations</a></section></main>;
 return <main><header><div className="brand"><b>ROHILLA DRIVE</b><small>Admin Integrations</small></div><a className="call" href="/admin">Operations</a></header><section className="section"><h1>Communication & Analysis Integrations</h1><p>Connection status shows whether the required server-side configuration is available. Credentials and private tokens are never displayed in the browser.</p><div className="grid">{realtimeNeeds.map(([key,name,desc,requirement])=><article className="application" key={key}><label>{runtime[key]?"CONNECTED":"NOT CONFIGURED"}</label><h2>{name}</h2><p>{desc}</p><small>Required: {requirement}</small></article>)}</div></section><section className="section"><h1>Social & Google Integrations</h1><p>External publishing and advertising remain disabled until the relevant official account is authorised. This screen never stores or displays raw account passwords.</p><div className="grid">{rows.map(r=><article className="application" key={r.id}><label>{String(r.connection_status||"not configured").replace(/_/g," ")}</label><h2>{String(r.platform).replace(/_/g," ").replace(/\b\w/g,x=>x.toUpperCase())}</h2><p>{needs[r.platform]||"Official platform authorisation is required."}</p><small>Planned capabilities: {Array.isArray(r.capabilities)?r.capabilities.join(" • "):""}</small></article>)}</div></section><section className="section dark"><div className="about"><h2>Recommended Connection Order</h2><p>Start with services that directly support customer communication and operations. Paid advertising, automatic publishing, telephony and external AI services should remain disabled until the business is ready to activate and fund them.</p></div></section></main>
}
