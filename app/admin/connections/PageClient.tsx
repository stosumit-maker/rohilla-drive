"use client";
import {useEffect,useState} from "react";
import {supabase} from "../../supabaseClient";

const needs:Record<string,string>={
 instagram:"Meta business authorization and approved publishing permissions.",
 facebook:"Facebook Page authorization and approved publishing permissions.",
 youtube:"Google account authorization for the connected YouTube channel.",
 google_ads:"Authorized Google Ads account, API access and an approved advertising budget.",
 google_search_console:"Verified Google Search Console property and authorized account access."
};
const realtimeNeeds=[
 ["translation","Website & Message Translation","Multilingual page content, messages and assisted replies.","Secure translation provider configuration"],
 ["realtime_translation","Live Interpretation","Browser-based speech interpretation for authorized portal users.","Authorized realtime language provider"],
 ["speech","Speech Services","Speech transcription and translated voice output.","Authorized speech provider"],
 ["telephony","Telephony Integration","Business call routing and supported live-audio workflows.","Authorized telephony provider and business number"],
 ["multimodal_ai","Vehicle Intelligence","Vehicle, poster and document understanding with privacy controls and human verification.","Authorized vehicle-intelligence provider"]
] as const;
export default function Connections(){
 const db=supabase();const [ready,setReady]=useState(false);const [rows,setRows]=useState<any[]>([]);const [runtime,setRuntime]=useState<Record<string,boolean>>({});const [msg,setMsg]=useState("");
 useEffect(()=>{(async()=>{const {data:{session}}=await db.auth.getSession();if(!session){setMsg("Admin login required.");return}const [{data:aal},{data:isAdmin}]=await Promise.all([db.auth.mfa.getAuthenticatorAssuranceLevel(),db.rpc("is_admin")]);if(aal?.currentLevel!=="aal2"||!isAdmin){setMsg("Administrator authentication is required.");return}setReady(true);const [{data,error},statusRes]=await Promise.all([db.from("platform_connections").select("*").order("platform"),fetch("/api/connection-status",{cache:"no-store"})]);if(error){setMsg(error.message);return}setRows(data||[]);if(statusRes.ok)setRuntime(await statusRes.json())})()},[]);
 if(!ready)return <main><section className="section"><h1>Integrations</h1><p>{msg||"Checking secure access…"}</p><a href="/admin">Back to Administration</a></section></main>;
 return <main><header><div className="brand"><b>ROHILLA DRIVE ADMIN</b><small>Integrations & Connection Status</small></div><a className="call" href="/admin">Administration</a></header><section className="section"><h1>Language, Voice & Vehicle Intelligence</h1><p>Connection status is shown without exposing credentials or private configuration details.</p><div className="grid">{realtimeNeeds.map(([key,name,desc,requirement])=><article className="application" key={key}><label>{runtime[key]?"CONNECTED":"NOT CONNECTED"}</label><h2>{name}</h2><p>{desc}</p><small>Requirement: {requirement}</small></article>)}</div></section><section className="section"><h1>Social & Google Services</h1><p>External services require their own authorization. Passwords and private credentials are never displayed in the portal.</p><div className="grid">{rows.map(r=><article className="application" key={r.id}><label>{r.connection_status}</label><h2>{String(r.platform).replace(/_/g," ").replace(/\b\w/g,x=>x.toUpperCase())}</h2><p>{needs[r.platform]||"Official service authorization is required."}</p><small>Planned capabilities: {Array.isArray(r.capabilities)?r.capabilities.join(" • "):""}</small></article>)}</div></section><section className="section dark"><div className="about"><h2>Integration policy</h2><p>External publishing, messaging, telephony, AI and advertising capabilities remain disabled until the relevant service is deliberately authorized and configured. No connection shown here grants permission to spend, publish or contact customers automatically.</p></div></section></main>
}
