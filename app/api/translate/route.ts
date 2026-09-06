import {NextResponse} from "next/server";
import {ROHILLA_LANGUAGES} from "../../lib/rohilla-languages";

export const runtime="nodejs";

function normalize(code:string){return ROHILLA_LANGUAGES.find(x=>x.code===code)?.translationCode||code.split("-")[0]||"en"}
function parseGatewayContent(data:any){const raw=data?.choices?.[0]?.message?.content;return typeof raw==="string"?raw:""}
function cleanJson(text:string){const s=text.trim().replace(/^```(?:json)?\s*/i,"").replace(/\s*```$/i,"");try{return JSON.parse(s)}catch{return null}}

async function googleTranslate(texts:string[],target:string,source?:string){
 const key=process.env.GOOGLE_TRANSLATE_API_KEY;if(!key)return null;
 const res=await fetch(`https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(key)}`,{method:"POST",headers:{"Content-Type":"application/json"},cache:"no-store",body:JSON.stringify({q:texts,target,format:"text",...(source?{source}:{})})});
 const data=await res.json();if(!res.ok)throw new Error(data?.error?.message||"Google translation provider error");
 return (data?.data?.translations||[]).map((x:any,i:number)=>x?.translatedText||texts[i]);
}

async function gatewayTranslate(texts:string[],target:string,source?:string){
 const token=process.env.AI_GATEWAY_API_KEY||process.env.VERCEL_OIDC_TOKEN;if(!token)return null;
 const model=process.env.ROHILLA_TRANSLATE_MODEL||"openai/gpt-5.6-sol";
 const res=await fetch("https://ai-gateway.vercel.sh/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},cache:"no-store",body:JSON.stringify({model,stream:false,response_format:{type:"json_object"},messages:[{role:"system",content:"You are Rohilla Drive's translation layer. Translate faithfully, preserve vehicle model names, prices, registration codes, phone numbers and meaning. Do not add commentary. Return JSON only as {\"translations\":[...]} with exactly one output for each input."},{role:"user",content:JSON.stringify({source:source||"auto",target,texts})}]})});
 const data=await res.json();if(!res.ok)throw new Error(data?.error?.message||"AI Gateway translation failed");
 const parsed=cleanJson(parseGatewayContent(data));const out=parsed?.translations;
 if(!Array.isArray(out)||out.length!==texts.length)throw new Error("AI Gateway returned an invalid translation array");
 return out.map((x:any,i:number)=>typeof x==="string"?x:texts[i]);
}

async function directOpenAITranslate(texts:string[],target:string,source?:string){
 const key=process.env.OPENAI_API_KEY||process.env.ROHILLA_AI_PROVIDER_KEY;if(!key)return null;
 const model=process.env.ROHILLA_DIRECT_TRANSLATE_MODEL||"gpt-5.6";
 const res=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},cache:"no-store",body:JSON.stringify({model,response_format:{type:"json_object"},messages:[{role:"system",content:"Translate faithfully. Preserve vehicle model names, prices, registration codes and phone numbers. Return JSON only as {\"translations\":[...]} with exactly one output per input."},{role:"user",content:JSON.stringify({source:source||"auto",target,texts})}]})});
 const data=await res.json();if(!res.ok)throw new Error(data?.error?.message||"Direct AI translation failed");
 const parsed=cleanJson(parseGatewayContent(data));const out=parsed?.translations;
 return Array.isArray(out)&&out.length===texts.length?out.map((x:any,i:number)=>typeof x==="string"?x:texts[i]):null;
}

export async function POST(req:Request){
 try{
  const body=await req.json();const raw=Array.isArray(body?.texts)?body.texts:[body?.text];
  const texts=raw.filter((x:any)=>typeof x==="string").map((x:string)=>x.slice(0,5000)).slice(0,60);
  const target=normalize(String(body?.target||"en-IN"));const source=body?.source&&body.source!=="auto"?normalize(String(body.source)):undefined;
  if(!texts.length)return NextResponse.json({translations:[],configured:true,provider:"none_needed"});
  if(source&&target===source)return NextResponse.json({translations:texts,configured:true,provider:"identity"});
  try{const out=await googleTranslate(texts,target,source);if(out)return NextResponse.json({translations:out,configured:true,provider:"google_cloud_translation"})}catch{}
  try{const out=await gatewayTranslate(texts,target,source);if(out)return NextResponse.json({translations:out,configured:true,provider:"vercel_ai_gateway"})}catch{}
  try{const out=await directOpenAITranslate(texts,target,source);if(out)return NextResponse.json({translations:out,configured:true,provider:"direct_ai"})}catch{}
  return NextResponse.json({translations:texts,configured:false,provider:"not_connected"});
 }catch(err:any){return NextResponse.json({error:err?.message||"Translation failed"},{status:500})}
}
