"use client";
import {useRouter} from "next/navigation";

export default function CustomerBackBar({homeLabel="Customer Website"}:{homeLabel?:string}){
 const router=useRouter();
 return <div data-no-translate style={{position:"sticky",top:0,zIndex:10010,display:"flex",gap:8,alignItems:"center",padding:"8px 12px",background:"rgba(255,255,255,.96)",borderBottom:"1px solid #e5e7eb",backdropFilter:"blur(10px)"}}>
  <button onClick={()=>router.back()} style={{border:"1px solid #d1d5db",background:"#fff",borderRadius:999,padding:"8px 12px",fontWeight:800}}>← Back</button>
  <a href="/" style={{border:"1px solid #111827",background:"#111827",color:"#fff",borderRadius:999,padding:"8px 12px",fontWeight:800,textDecoration:"none"}}>⌂ {homeLabel}</a>
 </div>
}
