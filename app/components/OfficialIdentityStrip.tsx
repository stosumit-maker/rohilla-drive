"use client";
import {usePathname} from "next/navigation";
export default function OfficialIdentityStrip(){
  const pathname=usePathname();
  if(pathname!=="/")return null;
  return <aside aria-label="Rohilla Drive identity" style={{background:"#f8fafc",borderBottom:"1px solid #e5e7eb",padding:"8px 14px",textAlign:"center",fontSize:12,lineHeight:1.4,color:"#475569"}}>
    <strong style={{color:"#0f172a"}}>ROHILLA DRIVE</strong> • Rohilla Multibrand Cars • Ambala City
  </aside>;
}
