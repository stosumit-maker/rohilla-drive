"use client";
import {useRef,useState} from "react";
import {supabase} from "../supabaseClient";
import {languageByCode} from "../lib/rohilla-languages";

export default function RealtimeInterpreter({targetLanguage,label}:{targetLanguage:string;label:string}){
 const db=supabase();const pcRef=useRef<RTCPeerConnection|null>(null);const streamRef=useRef<MediaStream|null>(null);const audioRef=useRef<HTMLAudioElement|null>(null);const [active,setActive]=useState(false);const [source,setSource]=useState("");const [translated,setTranslated]=useState("");const [note,setNote]=useState("");
 async function start(){
  try{
   setNote("Establishing secure interpretation session…");setSource("");setTranslated("");
   const {data:{session}}=await db.auth.getSession();if(!session){setNote("Secure portal login is required.");return}
   const secretRes=await fetch("/api/realtime/translation-secret",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${session.access_token}`},body:JSON.stringify({target_language:targetLanguage})});const secretJson=await secretRes.json();
   const clientSecret=secretJson?.client_secret?.value;if(!secretJson?.configured||!clientSecret){setNote(secretJson?.error||"Realtime interpretation service is not connected.");return}
   const sourceStream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});streamRef.current=sourceStream;
   const pc=new RTCPeerConnection();pcRef.current=pc;pc.addTrack(sourceStream.getAudioTracks()[0],sourceStream);
   const translatedAudio=new Audio();translatedAudio.autoplay=true;audioRef.current=translatedAudio;pc.ontrack=({streams})=>{translatedAudio.srcObject=streams[0]};
   const events=pc.createDataChannel("oai-events");events.onmessage=({data})=>{try{const event=JSON.parse(data);if(event.type==="session.input_transcript.delta")setSource(x=>x+(event.delta||""));if(event.type==="session.output_transcript.delta")setTranslated(x=>x+(event.delta||""));if(event.type==="error")setNote(event.error?.message||"Realtime interpretation error") }catch{}};
   const offer=await pc.createOffer();await pc.setLocalDescription(offer);
   const sdpResponse=await fetch("https://api.openai.com/v1/realtime/translations/calls",{method:"POST",headers:{Authorization:`Bearer ${clientSecret}`,"Content-Type":"application/sdp"},body:offer.sdp||""});if(!sdpResponse.ok)throw new Error(await sdpResponse.text());
   await pc.setRemoteDescription({type:"answer",sdp:await sdpResponse.text()});setActive(true);setNote(`Live interpretation to ${languageByCode(targetLanguage).name} is active.`)
  }catch(err:any){stop();setNote(err?.message||"Could not start the interpretation session.")}
 }
 function stop(){pcRef.current?.close();pcRef.current=null;streamRef.current?.getTracks().forEach(t=>t.stop());streamRef.current=null;if(audioRef.current)audioRef.current.srcObject=null;setActive(false)}
 return <article className="application"><label>LIVE INTERPRETATION • {languageByCode(targetLanguage).nativeName}</label><h3>{label}</h3><p>Microphone audio is processed continuously during an active session, with translated audio returned to this device.</p><div className="row">{active?<button onClick={stop}>Stop Session</button>:<button onClick={start}>Start Interpretation</button>}<button className="secondary" onClick={()=>{setSource("");setTranslated("")}}>Clear Transcript</button></div>{note&&<div className="notice">{note}</div>}<p><b>Source transcript</b><br/>{source||"—"}</p><p><b>Translated transcript</b><br/>{translated||"—"}</p></article>
}
