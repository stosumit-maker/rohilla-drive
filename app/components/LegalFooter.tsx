"use client";
import {usePathname} from "next/navigation";

export default function LegalFooter(){
  const path=usePathname();
  const privatePortal=path.startsWith("/admin")||path.startsWith("/dealer")||path.startsWith("/partner")||path.startsWith("/reset-password");
  if(privatePortal)return null;
  return <div data-no-translate="true" style={{borderTop:"1px solid #d9dee8",background:"#f8fafc",padding:"18px 16px",textAlign:"center",fontSize:13,lineHeight:1.6,color:"#475569"}}>
    <div style={{display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap",marginBottom:6}}>
      <a href="/terms" style={{fontWeight:800,color:"#0f172a"}}>Terms & Conditions</a>
      <a href="/privacy" style={{fontWeight:800,color:"#0f172a"}}>Privacy Notice</a>
      <a href="/disclaimer" style={{fontWeight:800,color:"#0f172a"}}>Platform Disclaimer</a>
    </div>
    <span>ROHILLA DRIVE • Rohilla Multibrand Cars • Ambala City, Haryana • +91 70152 60003</span>
  </div>;
}
