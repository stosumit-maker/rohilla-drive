"use client";
import {usePathname,useRouter} from "next/navigation";

export default function PublicBackNavigation(){
 const path=usePathname();const router=useRouter();
 const hidden=path==="/"||path.startsWith("/admin")||path.startsWith("/dealer")||path.startsWith("/partner")||path.startsWith("/reset-password");
 if(hidden)return null;
 return <div data-no-translate style={{position:"sticky",top:0,zIndex:10020,display:"flex",gap:8,alignItems:"center",padding:"8px 12px",background:"rgba(255,255,255,.97)",borderBottom:"1px solid #e5e7eb",backdropFilter:"blur(10px)",boxShadow:"0 4px 14px rgba(0,0,0,.06)"}}>
  <button onClick={()=>router.back()} style={{border:"1px solid #d1d5db",background:"#fff",borderRadius:999,padding:"8px 12px",fontWeight:900}}>← Back</button>
  <a href="/" style={{border:"1px solid #111827",background:"#111827",color:"#fff",borderRadius:999,padding:"8px 12px",fontWeight:900,textDecoration:"none"}}>⌂ Customer Website</a>
 </div>
}
