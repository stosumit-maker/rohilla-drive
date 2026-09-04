"use client";
import {useEffect,useState} from "react";
import {supabase} from "../supabaseClient";

export default function ResetPassword(){
 const db=supabase();
 const [ready,setReady]=useState(false),[password,setPassword]=useState(""),[confirm,setConfirm]=useState(""),[msg,setMsg]=useState("");
 useEffect(()=>{db.auth.getSession().then(({data})=>{setReady(!!data.session);if(!data.session)setMsg("This reset link is invalid or has expired. Please request a new one.")})},[]);
 async function save(e:React.FormEvent){e.preventDefault();if(password.length<6){setMsg("Password must be at least 6 characters.");return}if(password!==confirm){setMsg("Passwords do not match.");return}setMsg("Updating password…");const {error}=await db.auth.updateUser({password});if(error){setMsg(error.message);return}setMsg("Password updated ✓ You can now login with your new password.");setPassword("");setConfirm("");}
 return <main><div className="auth"><h1>ROHILLA DRIVE</h1><p>Set a new password</p>{ready?<form onSubmit={save}><input type="password" minLength={6} required placeholder="New password" value={password} onChange={e=>setPassword(e.target.value)}/><input type="password" minLength={6} required placeholder="Confirm new password" value={confirm} onChange={e=>setConfirm(e.target.value)}/><button>Update Password</button></form>:null}<p>{msg}</p><a href="/dealer">← Dealer Login</a><br/><a href="/partner">← Service Provider Login</a></div></main>
}
