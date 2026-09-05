"use client";
import {usePathname} from "next/navigation";

export default function DealerLayout({children}:{children:React.ReactNode}){
 const path=usePathname();
 return <>
  {children}
  <div style={{position:"fixed",left:12,bottom:14,zIndex:9998,display:"flex",gap:8,flexWrap:"wrap"}}>
   {path!=="/dealer"&&<a href="/dealer" style={{padding:"9px 12px",borderRadius:999,background:"#111827",color:"#fff",textDecoration:"none",fontWeight:800,boxShadow:"0 8px 24px rgba(0,0,0,.2)"}}>Dealer Home</a>}
   {path!=="/dealer/finance"&&<a href="/dealer/finance" style={{padding:"9px 12px",borderRadius:999,background:"#173326",color:"#f4d38a",border:"1px solid #d7b56d",textDecoration:"none",fontWeight:800,boxShadow:"0 8px 24px rgba(0,0,0,.2)"}}>Finance • Margin • RC</a>}
  </div>
 </>;
}
