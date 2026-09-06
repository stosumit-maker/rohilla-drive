"use client";

import { usePathname } from "next/navigation";

export default function OfficialIdentityStrip() {
  const pathname = usePathname();
  if (pathname !== "/") return null;

  return (
    <aside aria-label="Official Rohilla Drive identity" style={{background:"#f8fafc",borderBottom:"1px solid #e5e7eb",padding:"10px 16px",textAlign:"center",fontSize:13,lineHeight:1.5,color:"#334155"}}>
      <strong style={{color:"#0f172a"}}>Official ROHILLA DRIVE website:</strong>{" "}
      <a href="https://www.rohilladrive.com/" style={{fontWeight:800,color:"#0f766e",textDecoration:"none"}}>www.rohilladrive.com</a>{" "}
      <span>• by Rohilla Multibrand Cars • Ambala City, Haryana • Complete Vehicle &amp; Mobility Network</span>{" "}
      <a href="/about" style={{fontWeight:800,color:"#0f766e",textDecoration:"none",whiteSpace:"nowrap"}}>Official brand information →</a>
    </aside>
  );
}
