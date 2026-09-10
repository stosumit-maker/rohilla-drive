"use client";
import {usePathname,useRouter} from "next/navigation";

export default function PublicBackNavigation(){
 const path=usePathname();const router=useRouter();
 const hidden=path==="/"||path.startsWith("/admin")||path.startsWith("/dealer")||path.startsWith("/partner")||path.startsWith("/reset-password");
 if(hidden)return null;
 return <div data-no-translate style={{position:"sticky",top:0,zIndex:10020,display:"flex",gap:8,alignItems:"center",padding:"8px 12px",background:"rgba(255,255,255,.97)",borderBottom:"1px solid #e5e7eb",backdropFilter:"blur(10px)",boxShadow:"0 4px 14px rgba(0,0,0,.06)"}}>
  <button aria-label="Go back" onClick={()=>router.back()} style={{border:"1px solid #9ca3af",background:"#fff",color:"#111827",borderRadius:999,padding:"8px 12px",fontWeight:900,boxShadow:"0 2px 8px rgba(15,23,42,.10)",minWidth:78}}>← Back</button>
  <a href="/" style={{border:"1px solid #111827",background:"#111827",color:"#fff",borderRadius:999,padding:"8px 12px",fontWeight:900,textDecoration:"none"}}>Public Website</a>
 </div>
}
