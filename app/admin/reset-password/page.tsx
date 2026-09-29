"use client";

import {useEffect,useState} from "react";
import {supabase} from "../../supabaseClient";

export default function AdminResetPassword(){
 const db=supabase();
 const [factor,setFactor]=useState<any>(null);
 const [code,setCode]=useState("");
 const [verified,setVerified]=useState(false);
 const [password,setPassword]=useState("");
 const [confirm,setConfirm]=useState("");
 const [busy,setBusy]=useState(false);
 const [msg,setMsg]=useState("Checking secure recovery session…");

 useEffect(()=>{(async()=>{
  const {data:{session}}=await db.auth.getSession();
  if(!session){setMsg("Open the latest password-reset link from your email on this device.");return}
  const {data:isAdmin}=await db.rpc("is_admin_identity");
  if(!isAdmin){setMsg("This recovery session is not authorised for Admin.");return}
  const {data,error}=await db.auth.mfa.listFactors();
  if(error){setMsg(error.message);return}
  const verifiedFactor=(data?.totp||[]).find((x:any)=>x.status==="verified");
  if(!verifiedFactor){setMsg("Google Authenticator recovery is not configured for this Admin account.");return}
  setFactor(verifiedFactor);
  setMsg("Enter the 6-digit Google Authenticator code.");
 })()},[]);

 async function verifyAuthenticator(){
  if(!factor?.id||code.length!==6)return;
  setBusy(true);setMsg("Verifying Google Authenticator…");
  const {error}=await db.auth.mfa.challengeAndVerify({factorId:factor.id,code});
  setBusy(false);
  if(error){setMsg(error.message);return}
  setVerified(true);setCode("");setMsg("Verified. Set your new password.");
 }

 async function savePassword(e:React.FormEvent){
  e.preventDefault();
  if(password.length<10){setMsg("Use at least 10 characters for the password.");return}
  if(password!==confirm){setMsg("Passwords do not match.");return}
  setBusy(true);setMsg("Saving new password…");
  const {error}=await db.auth.updateUser({password});
  if(error){setBusy(false);setMsg(error.message);return}
  await db.auth.signOut();
  location.href="/admin";
 }

 return <main><div className="auth">
  <h1>ROHILLA DRIVE</h1>
  <h2>{verified?"Set New Password":"Password Recovery"}</h2>
  {!verified&&<><p>Recovery requires your Google Authenticator code.</p><input autoFocus inputMode="numeric" maxLength={6} placeholder="6-digit Authenticator code" value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,"").slice(0,6))}/><button disabled={busy||code.length!==6} onClick={verifyAuthenticator}>{busy?"Verifying…":"Verify Authenticator"}</button></>}
  {verified&&<form onSubmit={savePassword}><input type="password" placeholder="New password" value={password} onChange={e=>setPassword(e.target.value)} minLength={10} required/><input type="password" placeholder="Confirm new password" value={confirm} onChange={e=>setConfirm(e.target.value)} minLength={10} required/><button disabled={busy}>{busy?"Saving…":"Save New Password"}</button></form>}
  <p>{msg}</p>
  <a className="call" href="/admin">Back to Admin Sign In</a>
 </div></main>;
}
