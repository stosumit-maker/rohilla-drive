import {NextResponse} from "next/server";

export const runtime="nodejs";

export async function GET(){
 const status={
  translation:Boolean(process.env.GOOGLE_TRANSLATE_API_KEY),
  speech:Boolean(process.env.GOOGLE_CLOUD_SERVICE_ACCOUNT_JSON),
  telephony:Boolean(process.env.EXOTEL_ACCOUNT_SID&&process.env.EXOTEL_API_KEY&&process.env.EXOTEL_API_TOKEN&&process.env.EXOTEL_CALLER_ID),
  multimodal_ai:Boolean(process.env.ROHILLA_AI_PROVIDER_KEY),
  meta:Boolean(process.env.META_ACCESS_TOKEN),
  youtube:Boolean(process.env.GOOGLE_YOUTUBE_REFRESH_TOKEN),
  google_ads:Boolean(process.env.GOOGLE_ADS_DEVELOPER_TOKEN&&process.env.GOOGLE_ADS_REFRESH_TOKEN)
 };
 return NextResponse.json(status,{headers:{"Cache-Control":"no-store"}});
}
