"use client";
import {useEffect,useState} from "react";
import {supabase} from "../supabaseClient";

export default function AdminKycShortcut(){
 const db=supabase();const [show,setShow]=useState(false);
 useEffect(()=>{(async()=>{const {data:{session}}=await db.auth.getSession();if(!session)return;const [{data:aal},{data:isAdmin}]=await Promise.all([db.auth.mfa.getAuthenticatorAssuranceLevel(),db.rpc("is_admin")]);if(aal?.currentLevel==="aal2"&&isAdmin)setShow(true)})()},[]);
 if(!show)return null;
 return <section className="section" style={{paddingTop:8,paddingBottom:0}}><div className="notice"><b>Partner KYC:</b> Review private business documents before approving a service partner. <a href="/admin/partner-kyc">Open Partner KYC Review →</a></div></section>;
}
