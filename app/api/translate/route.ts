import {NextResponse} from "next/server";
import {ROHILLA_LANGUAGES} from "../../lib/rohilla-languages";

export const runtime="nodejs";

function normalizeTarget(code:string){return ROHILLA_LANGUAGES.find(x=>x.code===code)?.translationCode||code.split("-")[0]||"en"}

export async function POST(req:Request){
 try{
  const body=await req.json();
  const raw=Array.isArray(body?.texts)?body.texts:[body?.text];
  const texts=raw.filter((x:any)=>typeof x==="string").map((x:string)=>x.slice(0,5000)).slice(0,60);
  const target=normalizeTarget(String(body?.target||"en-IN"));
  const source=body?.source&&body.source!=="auto"?normalizeTarget(String(body.source)):undefined;
  if(!texts.length)return NextResponse.json({translations:[],configured:Boolean(process.env.GOOGLE_TRANSLATE_API_KEY)});
  if(target==="en"&&source==="en")return NextResponse.json({translations:texts,configured:true,provider:"identity"});
  const key=process.env.GOOGLE_TRANSLATE_API_KEY;
  if(!key)return NextResponse.json({translations:texts,configured:false,provider:"not_connected"},{status:200});
  const res=await fetch(`https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(key)}`,{
   method:"POST",headers:{"Content-Type":"application/json"},cache:"no-store",
   body:JSON.stringify({q:texts,target,format:"text",...(source?{source}:{})})
  });
  const data=await res.json();
  if(!res.ok)throw new Error(data?.error?.message||"Translation provider error");
  const translations=(data?.data?.translations||[]).map((x:any,i:number)=>x?.translatedText||texts[i]);
  return NextResponse.json({translations,configured:true,provider:"google_cloud_translation"});
 }catch(err:any){return NextResponse.json({error:err?.message||"Translation failed"},{status:500})}
}
