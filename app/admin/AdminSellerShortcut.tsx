"use client";
import {useEffect,useState} from "react";
import {supabase} from "../supabaseClient";

export default function AdminSellerShortcut(){
 const db=supabase();
 const [show,setShow]=useState(false);
 useEffect(()=>{(async()=>{
  const {data:{session}}=await db.auth.getSession();if(!session)return;
  const [{data:aal},{data:isAdmin}]=await Promise.all([db.auth.mfa.getAuthenticatorAssuranceLevel(),db.rpc("is_admin")]);
  if(aal?.currentLevel==="aal2"&&isAdmin)setShow(true);
 })()},[]);
 if(!show)return null;
 return <section className="section" style={{paddingTop:18,paddingBottom:0}}><div className="notice"><b>Seller Intake:</b> Review private customer vehicle photos and seller requests before creating any public listing. <a href="/admin/seller-submissions">Open Seller Submissions →</a></div></section>;
}
