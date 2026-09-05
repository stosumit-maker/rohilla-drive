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
export default function Connections(){
 const db=supabase();const [ready,setReady]=useState(false);const [rows,setRows]=useState<any[]>([]);const [msg,setMsg]=useState("");
 useEffect(()=>{(async()=>{const {data:{session}}=await db.auth.getSession();if(!session){setMsg("Admin login required.");return}const [{data:aal},{data:isAdmin}]=await Promise.all([db.auth.mfa.getAuthenticatorAssuranceLevel(),db.rpc("is_admin")]);if(aal?.currentLevel!=="aal2"||!isAdmin){setMsg("Admin + Authenticator verification required.");return}setReady(true);const {data,error}=await db.from("platform_connections").select("*").order("platform");if(error){setMsg(error.message);return}setRows(data||[])})()},[]);
 if(!ready)return <main><section className="section"><h1>Platform Connections</h1><p>{msg||"Checking secure access…"}</p><a href="/admin">Back to Admin</a></section></main>;
 return <main><header><div className="brand"><b>ROHILLA DRIVE ADMIN</b><small>External Platform Readiness</small></div><a className="call" href="/admin">Control Room</a></header><section className="section"><h1>AI / Social / Google Connections</h1><p>This page stores connection readiness only — never raw platform passwords. OAuth/API secrets must stay server-side.</p><div className="grid">{rows.map(r=><article className="application" key={r.id}><label>{r.connection_status}</label><h2>{String(r.platform).replace(/_/g," ").toUpperCase()}</h2><p>{needs[r.platform]||"Official platform authorization required."}</p><small>Planned capabilities: {Array.isArray(r.capabilities)?r.capabilities.join(" • "):""}</small></article>)}</div></section><section className="section dark"><div className="about"><h2>AI provider</h2><p>For real photo understanding, number-plate masking, image/poster generation, captions, reasoning and voice-to-action, Rohilla Drive still needs one secured multimodal AI provider connected through a server-side key. The current command bus and permissions layer are already prepared for that connection.</p></div></section></main>
}
