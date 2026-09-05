"use client";
import {useEffect,useState} from "react";
import {supabase} from "../../supabaseClient";

const needs:Record<string,string>={
 instagram:"Meta developer app + professional Instagram account + Facebook Page connection + approved publishing permissions/OAuth.",
 facebook:"Meta developer app + Facebook Page admin authorization + publishing/insights permissions/OAuth.",
 youtube:"Google Cloud project + YouTube Data API + OAuth client + channel authorization; public automated uploads may require API compliance/audit.",
 google_ads:"Google Ads account with billing + manager/customer ID + OAuth + Google Ads API developer token + controlled ad budget.",
 google_search_console:"Verified Search Console property + Google OAuth/API access for performance data and sitemap actions."
};
const realtimeNeeds=[
 ["translation","Google Cloud Translation","Website/page translation, multilingual messages, operator view and replies.","GOOGLE_TRANSLATE_API_KEY"],
 ["speech","Google Speech + TTS","Streaming speech-to-text and translated voice synthesis for live calls.","GOOGLE_CLOUD_SERVICE_ACCOUNT_JSON"],
 ["telephony","Exotel / Telephony Stream","Indian phone number/call routing plus bidirectional live audio stream to the Rohilla translation gateway.","EXOTEL account + API credentials + caller ID"],
 ["multimodal_ai","Rohilla Multimodal AI","Photo/RC understanding, number-plate privacy, creative generation, reasoning and autonomous tool actions.","ROHILLA_AI_PROVIDER_KEY"]
] as const;
export default function Connections(){
 const db=supabase();const [ready,setReady]=useState(false);const [rows,setRows]=useState<any[]>([]);const [runtime,setRuntime]=useState<Record<string,boolean>>({});const [msg,setMsg]=useState("");
 useEffect(()=>{(async()=>{const {data:{session}}=await db.auth.getSession();if(!session){setMsg("Admin login required.");return}const [{data:aal},{data:isAdmin}]=await Promise.all([db.auth.mfa.getAuthenticatorAssuranceLevel(),db.rpc("is_admin")]);if(aal?.currentLevel!=="aal2"||!isAdmin){setMsg("Admin + Authenticator verification required.");return}setReady(true);const [{data,error},statusRes]=await Promise.all([db.from("platform_connections").select("*").order("platform"),fetch("/api/connection-status",{cache:"no-store"})]);if(error){setMsg(error.message);return}setRows(data||[]);if(statusRes.ok)setRuntime(await statusRes.json())})()},[]);
 if(!ready)return <main><section className="section"><h1>Platform Connections</h1><p>{msg||"Checking secure access…"}</p><a href="/admin">Back to Admin</a></section></main>;
 return <main><header><div className="brand"><b>ROHILLA DRIVE ADMIN</b><small>External Platform Readiness</small></div><a className="call" href="/admin">Control Room</a></header><section className="section"><h1>Language / Voice / AI Connections</h1><p>Green means the required server-side configuration is present. Secrets are never shown in the browser.</p><div className="grid">{realtimeNeeds.map(([key,name,desc,requirement])=><article className="application" key={key}><label>{runtime[key]?"CONNECTED":"NOT CONNECTED"}</label><h2>{name}</h2><p>{desc}</p><small>Needs: {requirement}</small></article>)}</div></section><section className="section"><h1>Social / Google Connections</h1><p>This page stores connection readiness only — never raw platform passwords. OAuth/API secrets must stay server-side.</p><div className="grid">{rows.map(r=><article className="application" key={r.id}><label>{r.connection_status}</label><h2>{String(r.platform).replace(/_/g," ").toUpperCase()}</h2><p>{needs[r.platform]||"Official platform authorization required."}</p><small>Planned capabilities: {Array.isArray(r.capabilities)?r.capabilities.join(" • "):""}</small></article>)}</div></section><section className="section dark"><div className="about"><h2>Rohilla Intelligence connection order</h2><p>1) Translation → multilingual website/messages. 2) Speech + TTS → voice understanding. 3) Telephony stream → live translated calls. 4) Multimodal AI → photos/RC/creative reasoning. 5) Meta/YouTube/Google Ads → controlled publishing and growth automation. External publishing or ad spend stays permission-controlled.</p></div></section></main>
}
