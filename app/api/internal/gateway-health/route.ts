import {generateText} from "ai";

export const runtime="nodejs";

export async function GET(){
  if(process.env.VERCEL_ENV==="production") return new Response(null,{status:404});
  try{
    const {text}=await generateText({
      model:"openai/gpt-5.6-sol",
      prompt:"Reply with exactly: ROHILLA_GATEWAY_OK",
      providerOptions:{gateway:{tags:["rohilla-drive","health-check"],disallowPromptTraining:true}}
    });
    return Response.json({ok:text.trim()==="ROHILLA_GATEWAY_OK",text:text.trim(),runtime:"vercel-ai-gateway"},{headers:{"Cache-Control":"no-store"}});
  }catch(error:any){
    return Response.json({ok:false,error:error?.message||"Gateway health check failed"},{status:500,headers:{"Cache-Control":"no-store"}});
  }
}
