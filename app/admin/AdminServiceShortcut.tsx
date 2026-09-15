"use client";
import {useEffect,useState} from "react";
import {supabase} from "../supabaseClient";

export default function AdminServiceShortcut(){
 const db=supabase();
 const [show,setShow]=useState(false);
 useEffect(()=>{(async()=>{
  const {data:{session}}=await db.auth.getSession();if(!session)return;
  const [{data:aal},{data:isAdmin}]=await Promise.all([db.auth.mfa.getAuthenticatorAssuranceLevel(),db.rpc("is_admin")]);
  if(aal?.currentLevel==="aal2"&&isAdmin)setShow(true);
 })()},[]);
 if(!show)return null;
 return <section className="section" style={{paddingTop:8,paddingBottom:0}}><div className="notice"><b>Service Operations:</b> Review partner quotes, record confirmed customer approval and monitor appointment/work/completion proof. <a href="/admin/service-operations">Open Service Operations →</a></div></section>;
}
