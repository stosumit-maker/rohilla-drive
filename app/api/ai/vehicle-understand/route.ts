import {NextResponse} from "next/server";
import {requirePortalActor} from "../../../lib/server-auth";

export const runtime="nodejs";

function responseText(data:any){
 if(typeof data?.output_text==="string")return data.output_text;
 const parts:string[]=[];
 for(const item of data?.output||[])for(const c of item?.content||[])if(typeof c?.text==="string")parts.push(c.text);
 return parts.join("\n");
}
function cleanJson(text:string){const s=text.trim().replace(/^```(?:json)?\s*/i,"").replace(/\s*```$/i,"");try{return JSON.parse(s)}catch{return null}}

export async function POST(req:Request){
 const auth=await requirePortalActor(req,["admin"]);if(auth.error)return auth.error;
 try{
  const body=await req.json();const prompt=String(body?.prompt||"Analyse these vehicle/listing images and extract only facts that are clearly visible.").slice(0,5000);
  const images=(Array.isArray(body?.images)?body.images:[]).filter((x:any)=>typeof x==="string"&&(x.startsWith("https://")||x.startsWith("data:image/"))).slice(0,6);
  if(!images.length)return NextResponse.json({error:"At least one image is required"},{status:400});
  const key=process.env.OPENAI_API_KEY||process.env.ROHILLA_AI_PROVIDER_KEY;
  if(!key)return NextResponse.json({configured:false,error:"Multimodal AI provider is not connected yet."},{status:200});
  const model=process.env.ROHILLA_AI_MODEL||"gpt-5.6";
  const content:any[]=[{type:"input_text",text:`${prompt}\n\nReturn ONE JSON object only with these keys when supported by visible evidence: brand, model, variant, year, km, fuel, transmission, owner_count, asking_price, city, registration_hint, features (array), notes, plate_visible (boolean), plate_text (only if clearly readable), confidence (0-1), uncertainties (array). Use null for unknown fields. Never invent price, ownership, mileage, RC status or registration. If an image appears to contain RC/document data, extract only clearly visible non-sensitive vehicle fields and put uncertainty in uncertainties.`}];
  images.forEach((image_url:string)=>content.push({type:"input_image",image_url,detail:"high"}));
  const res=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({model,instructions:"You are the secured Rohilla Drive vehicle-understanding layer. Be conservative, fact-grounded and privacy-aware. Never guess hidden text. Return valid JSON only.",input:[{role:"user",content}],max_output_tokens:1800}),cache:"no-store"});
  const data=await res.json();if(!res.ok)return NextResponse.json({configured:true,error:data?.error?.message||"AI provider request failed"},{status:502});
  const text=responseText(data);const parsed=cleanJson(text);
  return NextResponse.json({configured:true,model,result:parsed||{raw:text}});
 }catch(err:any){return NextResponse.json({error:err?.message||"Vehicle understanding failed"},{status:500})}
}
