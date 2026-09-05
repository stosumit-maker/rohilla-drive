import {NextResponse} from "next/server";
import {requirePortalActor} from "../../../lib/server-auth";
import {ROHILLA_LANGUAGES} from "../../../lib/rohilla-languages";

export const runtime="nodejs";
function language(code:string){return ROHILLA_LANGUAGES.find(x=>x.code===code)?.translationCode||code.split("-")[0]||"en"}

export async function POST(req:Request){
 const auth=await requirePortalActor(req,["admin","dealer","partner"]);if(auth.error)return auth.error;
 try{
  const body=await req.json();const target=language(String(body?.target_language||"hi-IN"));
  const key=process.env.OPENAI_API_KEY||process.env.ROHILLA_AI_PROVIDER_KEY;
  if(!key)return NextResponse.json({configured:false,error:"Realtime translation provider is not connected yet."},{status:200});
  const requestBody={session:{model:process.env.ROHILLA_REALTIME_TRANSLATE_MODEL||"gpt-realtime-translate",audio:{input:{noise_reduction:{type:"near_field"},transcription:{model:process.env.ROHILLA_REALTIME_TRANSCRIBE_MODEL||"gpt-live-transcribe"}},output:{language:target}}},expires_after:{anchor:"created_at",seconds:120}};
  const r=await fetch("https://api.openai.com/v1/realtime/translations/client_secrets",{method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify(requestBody),cache:"no-store"});
  const data=await r.json();if(!r.ok)return NextResponse.json({configured:true,error:data?.error?.message||"Realtime translation secret request failed"},{status:502});
  return NextResponse.json({configured:true,target_language:target,client_secret:data});
 }catch(err:any){return NextResponse.json({error:err?.message||"Could not create realtime translation session"},{status:500})}
}
