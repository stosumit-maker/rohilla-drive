"use client";
import {usePathname} from "next/navigation";

const base={padding:"9px 12px",borderRadius:999,fontWeight:800,textDecoration:"none",boxShadow:"0 8px 24px rgba(0,0,0,.18)",fontSize:12} as const;
export default function PublicQuickLinks(){
 const path=usePathname();
 if(path.startsWith("/admin")||path.startsWith("/dealer")||path.startsWith("/partner")||path.startsWith("/reset-password"))return null;
 return <div style={{position:"fixed",right:12,bottom:72,zIndex:9000,display:"flex",flexDirection:"column",gap:8,alignItems:"flex-end"}}>
  <small style={{padding:"5px 9px",borderRadius:999,background:"rgba(17,24,39,.94)",color:"#f4d38a",fontWeight:800,fontSize:10}}>One network. Every vehicle. Every language.</small>
  <a href="/assistant" style={{...base,background:"#2a2110",color:"#f4d38a",border:"1px solid #d7b56d"}}>🎙️ Ask Rohilla AI</a>
  <a href="/language-assist" style={{...base,background:"#312e81",color:"#eef2ff",border:"1px solid #818cf8"}}>🌐 Language Bridge</a>
  <a href="/new-vehicles" style={{...base,background:"#173326",color:"#f4d38a",border:"1px solid #d7b56d"}}>✨ New Vehicle Assist</a>
  <a href="/business-hub" style={{...base,background:"#111827",color:"#fff",border:"1px solid #475569"}}>🤝 Business Hub</a>
 </div>
}
