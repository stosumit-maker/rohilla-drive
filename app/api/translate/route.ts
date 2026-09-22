import {NextResponse} from "next/server";
import {generateText} from "ai";
import {ROHILLA_LANGUAGES} from "../../lib/rohilla-languages";

export const runtime="nodejs";

function normalize(code:string){return ROHILLA_LANGUAGES.find(x=>x.code===code)?.translationCode||code.split("-")[0]||"en"}
function cleanJson(text:string){const s=text.trim().replace(/^```(?:json)?\s*/i,"").replace(/\s*```$/i,"");try{return JSON.parse(s)}catch{return null}}

async function googleTranslate(texts:string[],target:string,source?:string){
 const key=process.env.GOOGLE_TRANSLATE_API_KEY;if(!key)return null;
 const res=await fetch(`https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(key)}`,{method:"POST",headers:{"Content-Type":"application/json"},cache:"no-store",body:JSON.stringify({q:texts,target,format:"text",...(source?{source}:{})})});
 const data=await res.json();if(!res.ok)throw new Error(data?.error?.message||"Google translation provider error");
 return (data?.data?.translations||[]).map((x:any,i:number)=>x?.translatedText||texts[i]);
}

async function gatewayTranslate(texts:string[],target:string,source?:string){
 const preferred=process.env.ROHILLA_TRANSLATE_MODEL;
 const models=[preferred,"google/gemini-3.1-flash-lite","openai/gpt-5.4-mini"].filter((x,i,a):x is string=>Boolean(x)&&a.indexOf(x)===i);
 let lastError:unknown;
 for(const model of models){
  try{
   const {text}=await generateText({
    model,
    system:"You are Rohilla Drive's translation layer. Translate faithfully and naturally. Preserve brand names, vehicle model names, prices, registration codes, phone numbers and meaning. Do not add commentary. Return JSON only as {\"translations\":[...]} with exactly one output for each input.",
    prompt:JSON.stringify({source:source||"auto",target,texts}),
    providerOptions:{gateway:{tags:["rohilla-drive","translation"],disallowPromptTraining:true}}
   });
   const parsed=cleanJson(text);const out=parsed?.translations;
   if(!Array.isArray(out)||out.length!==texts.length)throw new Error("AI Gateway returned an invalid translation array");
   return {translations:out.map((x:any,i:number)=>typeof x==="string"?x:texts[i]),model};
  }catch(error){lastError=error}
 }
 throw lastError||new Error("No translation model available");
}

export async function POST(req:Request){
 const url=new URL(req.url);
 const origin=req.headers.get("origin");
 if(!origin||origin!==url.origin)return NextResponse.json({error:"Same-origin request required"},{status:403,headers:{"Cache-Control":"no-store"}});
 if(!(req.headers.get("content-type")||"").toLowerCase().includes("application/json"))return NextResponse.json({error:"JSON request required"},{status:415,headers:{"Cache-Control":"no-store"}});
 const declaredLength=Number(req.headers.get("content-length")||0);
 if(declaredLength>20000)return NextResponse.json({error:"Translation request is too large"},{status:413,headers:{"Cache-Control":"no-store"}});
 try{
  const body=await req.json();const raw=Array.isArray(body?.texts)?body.texts:[body?.text];
  if(raw.length>20)return NextResponse.json({error:"Too many translation items"},{status:413,headers:{"Cache-Control":"no-store"}});
  const texts=raw.filter((x:any)=>typeof x==="string").map((x:string)=>x.trim()).filter(Boolean);
  if(texts.some((x:string)=>x.length>2000)||texts.reduce((sum:number,x:string)=>sum+x.length,0)>6000)return NextResponse.json({error:"Translation request is too large"},{status:413,headers:{"Cache-Control":"no-store"}});
  const target=normalize(String(body?.target||"en-IN"));const source=body?.source&&body.source!=="auto"?normalize(String(body.source)):undefined;
  const headers={"Cache-Control":"no-store"};
  if(!texts.length)return NextResponse.json({translations:[],configured:true,provider:"none_needed"},{headers});
  if(source&&target===source)return NextResponse.json({translations:texts,configured:true,provider:"identity"},{headers});
  try{const out=await googleTranslate(texts,target,source);if(out)return NextResponse.json({translations:out,configured:true,provider:"google_cloud_translation"},{headers})}catch{}
  try{const out=await gatewayTranslate(texts,target,source);return NextResponse.json({translations:out.translations,configured:true,provider:"vercel_ai_gateway",model:out.model},{headers})}catch(error){
   console.error("Rohilla translation gateway unavailable",error);
   return NextResponse.json({translations:texts,configured:false,provider:"gateway_unavailable",error:"Translation service is temporarily unavailable."},{status:200,headers});
  }
 }catch{return NextResponse.json({error:"Translation request could not be processed"},{status:400,headers:{"Cache-Control":"no-store"}})}
}
