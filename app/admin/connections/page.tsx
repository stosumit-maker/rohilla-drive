"use client";
import {useEffect,useState} from "react";
import {supabase} from "../../supabaseClient";

const needs:Record<string,string>={
 instagram:"Official Meta business authorization and approved publishing permissions.",
 facebook:"Official Facebook Page authorization and approved publishing/insights permissions.",
 youtube:"Official Google/YouTube authorization for the Rohilla Drive channel and required API permissions.",
 google_ads:"Approved Google Ads account access, controlled budget approval and official API authorization.",
 google_search_console:"Verified Search Console property with authorised performance and sitemap access."
};
const realtimeNeeds=[
 ["translation","Website & Message Translation","Public localization, multilingual messages, operator views and customer replies.","Authorised translation-provider connection"],
 ["realtime_translation","Realtime Speech Interpretation","Secure browser speech interpretation for Administration, Dealer and Partner language operations.","Authorised realtime AI provider connection"],
 ["speech","Speech Services","Speech transcription and translated voice output for approved workflows.","Authorised speech-provider connection"],
 ["telephony","Telephony Integration","Phone routing and live media connectivity for approved translated-call workflows.","Approved telephony account and secure media gateway"],
 ["multimodal_ai","Vehicle Intelligence","Vehicle, poster and document understanding with privacy and structured-data safeguards.","Authorised multimodal AI provider connection"]
] as const;
export default function Connections(){
 const db=supabase();const [ready,setReady]=useState(false);const [rows,setRows]=useState<any[]>([]);const [runtime,setRuntime]=useState<Record<string,boolean>>({});const [msg,setMsg]=useState("");
 useEffect(()=>{(async()=>{const {data:{session}}=await db.auth.getSession();if(!session){setMsg("Administrator login required.");return}const [{data:aal},{data:isAdmin}]=await Promise.all([db.auth.mfa.getAuthenticatorAssuranceLevel(),db.rpc("is_admin")]);if(aal?.currentLevel!=="aal2"||!isAdmin){setMsg("Administrator access and Authenticator verification are required.");return}setReady(true);const [{data,error},statusRes]=await Promise.all([db.from("platform_connections").select("*").order("platform"),fetch("/api/connection-status",{cache:"no-store"})]);if(error){setMsg(error.message);return}setRows(data||[]);if(statusRes.ok)setRuntime(await statusRes.json())})()},[]);
 if(!ready)return <main><section className="section"><div className="portalSectionLabel">Platform Integrations</div><h1>Integrations & Readiness</h1><p>{msg||"Verifying administrator access…"}</p><a href="/admin">Administration Console</a></section></main>;
 return <main><header><div className="brand"><b>ROHILLA DRIVE</b><small>Integrations & Platform Readiness</small></div><a className="call" href="/admin">Executive Dashboard</a></header><section className="section"><div className="portalSectionLabel">Core Integrations</div><h1>Language, Voice & Vehicle Intelligence</h1><p>Connection status reflects server-side readiness only. Provider credentials and security material are never displayed in the portal.</p><div className="grid">{realtimeNeeds.map(([key,name,desc,requirement])=><article className="application" key={key}><label>{runtime[key]?"CONNECTED":"NOT CONNECTED"}</label><h2>{name}</h2><p>{desc}</p><small>Required: {requirement}</small></article>)}</div></section><section className="section"><div className="portalSectionLabel">Distribution & Search</div><h1>Social, Advertising & Search Integrations</h1><p>Only official account authorizations are supported. Passwords and provider secrets remain outside the browser and are never stored on this page.</p><div className="grid">{rows.map(r=><article className="application" key={r.id}><label>{r.connection_status}</label><h2>{String(r.platform).replace(/_/g," ").toUpperCase()}</h2><p>{needs[r.platform]||"Official platform authorization required."}</p><small>Planned capabilities: {Array.isArray(r.capabilities)?r.capabilities.join(" • "):""}</small></article>)}</div></section><section className="section dark"><div className="about"><h2>Activation Governance</h2><p>External publishing, paid advertising, realtime AI and telephony remain disabled until the required official provider connection and explicit business approval are in place. The website, inventory, organic marketing and existing operational workflows remain independent of those paid services.</p></div></section></main>
}
