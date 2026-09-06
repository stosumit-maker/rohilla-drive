import {NextResponse} from "next/server";
import {generateText} from "ai";
import {requirePortalActor} from "../../../lib/server-auth";

export const runtime="nodejs";

function cleanJson(text:string){const s=text.trim().replace(/^```(?:json)?\s*/i,"").replace(/\s*```$/i,"");try{return JSON.parse(s)}catch{return null}}
const instruction="You are the secured Rohilla Drive vehicle-understanding layer. Be conservative, fact-grounded and privacy-aware. Never guess hidden text. Return ONE valid JSON object only with keys: brand, model, variant, year, km, fuel, transmission, owner_count, asking_price, city, registration_hint, features, notes, plate_visible, plate_text, confidence, uncertainties. Use null for unknown values. Never invent price, ownership, mileage, RC status or registration. If an image contains RC/document data, extract only clearly visible non-sensitive vehicle facts and note uncertainty.";

async function viaGateway(prompt:string,images:string[]){
 const model=process.env.ROHILLA_AI_GATEWAY_MODEL||"openai/gpt-5.6-sol";
 const content:any[]=[{type:"text",text:prompt},...images.map(image=>({type:"image",image}))];
 const {text}=await generateText({
  model,
  system:instruction,
  messages:[{role:"user",content}],
  providerOptions:{gateway:{tags:["rohilla-drive","vehicle-ai"],disallowPromptTraining:true}}
 });
 return {provider:"vercel_ai_gateway",model,result:cleanJson(text)||{raw:text}};
}

async function viaDirect(prompt:string,images:string[]){
 const key=process.env.OPENAI_API_KEY||process.env.ROHILLA_AI_PROVIDER_KEY;if(!key)return null;
 const model=process.env.ROHILLA_AI_MODEL||"gpt-5.6";
 const content:any[]=[{type:"input_text",text:`${prompt}\n\n${instruction}`}];images.forEach(image_url=>content.push({type:"input_image",image_url,detail:"high"}));
 const res=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({model,input:[{role:"user",content}],max_output_tokens:1800}),cache:"no-store"});
 const data=await res.json();if(!res.ok)throw new Error(data?.error?.message||"Direct AI vehicle analysis failed");
 const parts:string[]=[];if(typeof data?.output_text==="string")parts.push(data.output_text);for(const item of data?.output||[])for(const c of item?.content||[])if(typeof c?.text==="string")parts.push(c.text);
 const text=parts.join("\n");return {provider:"direct_ai",model,result:cleanJson(text)||{raw:text}};
}

export async function POST(req:Request){
 const auth=await requirePortalActor(req,["admin"]);if(auth.error)return auth.error;
 try{
  const body=await req.json();const prompt=String(body?.prompt||"Analyse these vehicle/listing images and extract only facts that are clearly visible.").slice(0,5000);
  const images=(Array.isArray(body?.images)?body.images:[]).filter((x:any)=>typeof x==="string"&&(x.startsWith("https://")||x.startsWith("data:image/"))).slice(0,6);
  if(!images.length)return NextResponse.json({error:"At least one image is required"},{status:400});
  try{const x=await viaGateway(prompt,images);return NextResponse.json({configured:true,...x})}catch(gatewayError:any){
   try{const direct=await viaDirect(prompt,images);if(direct)return NextResponse.json({configured:true,...direct})}catch(directError:any){return NextResponse.json({configured:true,error:directError?.message||gatewayError?.message||"AI request failed"},{status:502})}
   return NextResponse.json({configured:false,error:gatewayError?.message||"Multimodal AI is not available yet."},{status:200});
  }
 }catch(err:any){return NextResponse.json({error:err?.message||"Vehicle understanding failed"},{status:500})}
}
