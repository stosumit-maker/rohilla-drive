"use client";
import {usePathname} from "next/navigation";

export default function PublicQuickLinks(){
 const path=usePathname();
 if(path.startsWith("/admin")||path.startsWith("/dealer")||path.startsWith("/partner")||path.startsWith("/reset-password"))return null;
 return <div style={{position:"fixed",right:12,bottom:72,zIndex:9000,display:"flex",flexDirection:"column",gap:8,alignItems:"flex-end"}}>
  <a href="/new-vehicles" style={{padding:"9px 12px",borderRadius:999,background:"#173326",color:"#f4d38a",border:"1px solid #d7b56d",fontWeight:800,textDecoration:"none",boxShadow:"0 8px 24px rgba(0,0,0,.18)",fontSize:12}}>✨ New Vehicle Assist</a>
  <a href="/business-hub" style={{padding:"9px 12px",borderRadius:999,background:"#111827",color:"#fff",border:"1px solid #475569",fontWeight:800,textDecoration:"none",boxShadow:"0 8px 24px rgba(0,0,0,.18)",fontSize:12}}>🤝 Business Hub</a>
 </div>
}
