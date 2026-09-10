import {NextResponse} from "next/server";
import {requirePortalActor} from "../../lib/server-auth";

export const runtime="nodejs";

export async function GET(req:Request){
 const auth=await requirePortalActor(req,["admin"]);if(auth.error)return auth.error;
 const aiGateway=Boolean(process.env.AI_GATEWAY_API_KEY||process.env.VERCEL_OIDC_TOKEN);
 const directAi=Boolean(process.env.OPENAI_API_KEY||process.env.ROHILLA_AI_PROVIDER_KEY);
 const googleTranslation=Boolean(process.env.GOOGLE_TRANSLATE_API_KEY);
 const status={
  ai_gateway:aiGateway,
  translation:googleTranslation||aiGateway||directAi,
  translation_provider:googleTranslation?"google_cloud_translation":aiGateway?"vercel_ai_gateway":directAi?"direct_ai":"not_connected",
  realtime_translation:directAi,
  speech:Boolean(process.env.GOOGLE_CLOUD_SERVICE_ACCOUNT_JSON)||directAi,
  telephony:Boolean(process.env.EXOTEL_ACCOUNT_SID&&process.env.EXOTEL_API_KEY&&process.env.EXOTEL_API_TOKEN&&process.env.EXOTEL_CALLER_ID),
  multimodal_ai:aiGateway||directAi,
  multimodal_provider:aiGateway?"vercel_ai_gateway":directAi?"direct_ai":"not_connected",
  meta:Boolean(process.env.META_ACCESS_TOKEN),
  youtube:Boolean(process.env.GOOGLE_YOUTUBE_REFRESH_TOKEN),
  google_ads:Boolean(process.env.GOOGLE_ADS_DEVELOPER_TOKEN&&process.env.GOOGLE_ADS_REFRESH_TOKEN)
 };
 return NextResponse.json(status,{headers:{"Cache-Control":"no-store"}});
}
