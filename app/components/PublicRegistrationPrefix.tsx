"use client";

import {useEffect,useState} from "react";
import {createPortal} from "react-dom";
import {usePathname} from "next/navigation";
import {supabase} from "../supabaseClient";

function safePrefix(value:unknown){
 const normalized=String(value||"").toUpperCase().replace(/[^A-Z0-9]/g,"");
 const match=normalized.match(/^([A-Z]{2})(\d{2})/);
 return match?match[1]+match[2]:"";
}

export default function PublicRegistrationPrefix(){
 const path=usePathname();
 const [prefix,setPrefix]=useState("");
 const [target,setTarget]=useState<Element|null>(null);
 useEffect(()=>{
  setPrefix("");setTarget(null);
  const match=path.match(/^\/cars\/([^/?#]+)$/);if(!match)return;
  let cancelled=false;let tries=0;let timer:number|undefined;
  const findTarget=()=>{if(cancelled)return;const el=document.querySelector(".carPage .specs");if(el){setTarget(el);return}if(tries++<30)timer=window.setTimeout(findTarget,100)};findTarget();
  (async()=>{const {data}=await supabase().from("vehicles").select("registration_prefix").eq("id",decodeURIComponent(match[1])).eq("status","published").maybeSingle();if(!cancelled)setPrefix(safePrefix(data?.registration_prefix))})();
  return()=>{cancelled=true;if(timer)window.clearTimeout(timer)};
 },[path]);
 if(!prefix||!target)return null;
 return createPortal(<span data-no-translate>Registration: {prefix}</span>,target);
}
