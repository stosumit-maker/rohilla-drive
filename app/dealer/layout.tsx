"use client";
import {usePathname} from "next/navigation";

const pill={padding:"9px 12px",borderRadius:999,background:"#111827",color:"#fff",textDecoration:"none",fontWeight:800,boxShadow:"0 8px 24px rgba(0,0,0,.2)"} as const;
export default function DealerLayout({children}:{children:React.ReactNode}){
 const path=usePathname();
 return <>
  {children}
  <div style={{position:"fixed",left:12,bottom:14,zIndex:9998,display:"flex",gap:8,flexWrap:"wrap",maxWidth:"calc(100vw - 24px)"}}>
   {path!=="/dealer"&&<a href="/dealer" style={pill}>Dealer Home</a>}
   {path!=="/dealer/new-opportunities"&&<a href="/dealer/new-opportunities" style={{...pill,background:"#172554",color:"#dbeafe",border:"1px solid #60a5fa"}}>✨ New Vehicle Leads</a>}
   {path!=="/dealer/finance"&&<a href="/dealer/finance" style={{...pill,background:"#173326",color:"#f4d38a",border:"1px solid #d7b56d"}}>Finance • Margin • RC</a>}
   {path!=="/dealer/growth"&&<a href="/dealer/growth" style={{...pill,background:"#2a2110",color:"#f4d38a",border:"1px solid #d7b56d"}}>✨ Growth / AI</a>}
   <a href="/business-hub" style={pill}>Business Hub</a>
  </div>
 </>;
}
