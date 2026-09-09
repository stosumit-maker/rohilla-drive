"use client";
import {useEffect,useState} from "react";
import {supabase} from "../../supabaseClient";

const needs:Record<string,string>={
 instagram:"Meta developer application, professional Instagram account, connected Facebook Page and approved OAuth publishing permissions.",
 facebook:"Meta developer application, Page administrator authorisation and approved publishing or insights permissions.",
 youtube:"Google Cloud project, YouTube Data API, OAuth client and authorised channel access; automated public uploads may require platform compliance review.",
 google_ads:"Google Ads account with billing, manager/customer ID, OAuth, Google Ads API developer token and an approved budget policy.",
 google_search_console:"Verified Search Console property and authorised Google API access for performance and sitemap operations."
};
const realtimeNeeds=[
 ["translation","Website & Message Translation","Public localisation, multilingual messages, operator views and customer responses.","Google Translate service configuration"],
 ["realtime_translation","Realtime Speech Interpretation","Secure browser speech interpretation for Administration, Dealer and Partner Language Operations.","Approved realtime AI provider connection"],
 ["speech","Speech Services","Speech transcription and translated voice output for supported workflows.","Approved speech provider connection"],
 ["telephony","Telephony Media Gateway","Phone routing and bidirectional media streaming for future translated call workflows.","Approved telephony account, credentials and gateway configuration"],
 ["multimodal_ai","Vehicle Intelligence","Vehicle, poster and document understanding with privacy flags and structured extraction.","Approved AI provider connection"]
] as const;
export default function Connections(){
 const db=supabase();const [ready,setReady]=useState(false);const [rows,setRows]=useState<any[]>([]);const [runtime,setRuntime]=useState<Record<string,boolean>>({});const [msg,setMsg]=useState("");
 useEffect(()=>{(async()=>{const {data:{session}}=await db.auth.getSession();if(!session){setMsg("Administration sign-in required.");return}const [{data:aal},{data:isAdmin}]=await Promise.all([db.auth.mfa.getAuthenticatorAssuranceLevel(),db.rpc("is_admin")]);if(aal?.currentLevel!=="aal2"||!isAdmin){setMsg("Administrator authentication and Authenticator verification are required.");return}setReady(true);const [{data,error},statusRes]=await Promise.all([db.from("platform_connections").select("*").order("platform"),fetch("/api/connection-status",{cache:"no-store"})]);if(error){setMsg(error.message);return}setRows(data||[]);if(statusRes.ok)setRuntime(await statusRes.json())})()},[]);
 if(!ready)return <main><section className="section"><h1>Integrations & Connections</h1><p>{msg||"Verifying secure access…"}</p><a href="/admin">Administration Dashboard</a></section></main>;
 return <main><header><div className="brand"><b>ROHILLA DRIVE • ADMINISTRATION</b><small>Integrations & Connections</small></div><a className="call" href="/admin">Administration Dashboard</a></header><section className="section"><h1>Language, Voice & Intelligence Services</h1><p>Connection status reflects server-side readiness only. Credentials and secrets are never displayed in the browser.</p><div className="grid">{realtimeNeeds.map(([key,name,desc,requirement])=><article className="application" key={key}><label>{runtime[key]?"CONNECTED":"NOT CONNECTED"}</label><h2>{name}</h2><p>{desc}</p><small>Requirement: {requirement}</small></article>)}</div></section><section className="section"><h1>Distribution & Google Services</h1><p>External platforms require their own authorised OAuth/API connection. ROHILLA DRIVE does not store raw platform passwords in this workspace.</p><div className="grid">{rows.map(r=><article className="application" key={r.id}><label>{r.connection_status}</label><h2>{String(r.platform).replace(/_/g," ").toUpperCase()}</h2><p>{needs[r.platform]||"Official platform authorisation is required."}</p><small>Planned capabilities: {Array.isArray(r.capabilities)?r.capabilities.join(" • "):""}</small></article>)}</div></section><section className="section dark"><div className="about"><h2>Connection Governance</h2><p>External publishing, paid media, messaging and telephony remain disabled until the relevant service is deliberately authorised and configured. Current zero-spend policy remains unchanged.</p></div></section></main>
}
