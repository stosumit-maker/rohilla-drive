"use client";
import {usePathname} from "next/navigation";
import {useEffect,useState} from "react";

const pill={display:"block",padding:"10px 11px",borderRadius:9,background:"#111827",color:"#fff",textDecoration:"none",fontWeight:700,fontSize:12} as const;
export default function DealerLayout({children}:{children:React.ReactNode}){
 const path=usePathname();const [open,setOpen]=useState(false);
 useEffect(()=>{document.title="Dealer Portal | ROHILLA DRIVE"},[path]);
 function back(){setOpen(false);window.history.back()}
 return <>
  <style jsx global>{`
   body{background:#f5f7fb}.auth{max-width:500px!important;margin:64px auto!important;padding:28px!important;border:1px solid #d8dee9!important;border-radius:18px!important;background:#fff!important;box-shadow:0 18px 50px rgba(15,23,42,.08)!important}.auth h1,.section h1,.section h2{letter-spacing:-.02em}.auth .notice{font-size:13px!important;line-height:1.55!important}.auth button,.adminForm button{min-height:44px}header{border-bottom:1px solid #e2e8f0}.brand small{opacity:.78}.section{max-width:1180px;margin-left:auto;margin-right:auto}
  `}</style>
  {children}
  <div data-no-translate style={{position:"fixed",left:12,bottom:14,zIndex:9998,display:"flex",flexDirection:"column",gap:8,alignItems:"flex-start",maxWidth:"calc(100vw - 24px)"}}>
   {open&&<div style={{width:"min(330px,calc(100vw - 24px))",maxHeight:"70vh",overflow:"auto",display:"grid",gap:7,padding:12,borderRadius:14,background:"rgba(255,255,255,.99)",border:"1px solid #d1d5db",boxShadow:"0 18px 55px rgba(0,0,0,.18)"}}>
    <div style={{padding:"2px 2px 7px",borderBottom:"1px solid #e5e7eb"}}><strong style={{fontSize:13,color:"#111827"}}>ROHILLA DRIVE Dealer Portal</strong><div style={{fontSize:11,color:"#64748b",marginTop:2}}>Inventory, deals, transactions and business support</div></div>
    <button onClick={back} style={{...pill,background:"#fff",color:"#111827",border:"1px solid #d1d5db",textAlign:"left"}}>Previous Page</button>
    {path!=="/dealer"&&<a href="/dealer" style={pill}>Dashboard</a>}
    {path!=="/dealer/new-opportunities"&&<a href="/dealer/new-opportunities" style={pill}>New Vehicle Opportunities</a>}
    {path!=="/dealer/deals"&&<a href="/dealer/deals" style={pill}>Deal Management</a>}
    {path!=="/dealer/finance"&&<a href="/dealer/finance" style={pill}>Transactions, Margin & RC</a>}
    {path!=="/dealer/growth"&&<a href="/dealer/growth" style={pill}>Marketing Tools</a>}
    {path!=="/dealer/language"&&<a href="/dealer/language" style={pill}>Language Support</a>}
    <a href="/business-hub" style={pill}>Business Network</a>
    <a href="/inventory" style={pill}>Public Inventory</a>
    <a href="/" style={{...pill,background:"#fff",color:"#111827",border:"1px solid #111827"}}>Customer Website</a>
    <button onClick={()=>setOpen(false)} style={{border:"1px solid #d1d5db",background:"#fff",color:"#111827",borderRadius:9,padding:"10px 11px",fontWeight:800}}>Close Menu</button>
   </div>}
   <button onClick={()=>setOpen(x=>!x)} aria-expanded={open} style={{border:"1px solid #475569",background:"#0f172a",color:"#fff",borderRadius:10,padding:"10px 14px",fontWeight:800,boxShadow:"0 8px 24px rgba(0,0,0,.18)"}}>{open?"Close":"Dealer Menu"}</button>
  </div>
 </>;
}
