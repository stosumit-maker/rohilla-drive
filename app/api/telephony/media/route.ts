import {experimental_upgradeWebSocket,type WebSocketData} from "@vercel/functions";
import ClientWebSocket from "ws";

export const runtime="nodejs";
export const dynamic="force-dynamic";

const MODEL=process.env.ROHILLA_REALTIME_TRANSLATE_MODEL||"gpt-realtime-translate";
const CODEC=process.env.TELEPHONY_AUDIO_CODEC||"mulaw-8000";
function clamp16(v:number){return Math.max(-32768,Math.min(32767,Math.round(v)))}
function mulawDecodeByte(u:number){u=(~u)&255;const sign=u&0x80,exponent=(u>>4)&7,mantissa=u&15;let sample=((mantissa<<3)+0x84)<<exponent;sample-=0x84;return sign?-sample:sample}
function mulawEncodeSample(sample:number){let pcm=clamp16(sample);const sign=pcm<0?0x80:0;if(pcm<0)pcm=-pcm;pcm=Math.min(32635,pcm)+0x84;let exponent=7;for(let mask=0x4000;(pcm&mask)===0&&exponent>0;mask>>=1)exponent--;const mantissa=(pcm>>(exponent+3))&15;return (~(sign|(exponent<<4)|mantissa))&255}
function resample(input:Int16Array,fromRate:number,toRate:number){if(fromRate===toRate)return input;const len=Math.max(1,Math.round(input.length*toRate/fromRate)),out=new Int16Array(len),scale=(input.length-1)/Math.max(1,len-1);for(let i=0;i<len;i++){const p=i*scale,a=Math.floor(p),b=Math.min(input.length-1,a+1),f=p-a;out[i]=clamp16(input[a]*(1-f)+input[b]*f)}return out}
function int16ToBuffer(samples:Int16Array){const b=Buffer.alloc(samples.length*2);for(let i=0;i<samples.length;i++)b.writeInt16LE(clamp16(samples[i]),i*2);return b}
function bufferToInt16(b:Buffer){const out=new Int16Array(Math.floor(b.length/2));for(let i=0;i<out.length;i++)out[i]=b.readInt16LE(i*2);return out}
function toOpenAI(base64:string){const raw=Buffer.from(base64,"base64");if(CODEC==="pcm16-24000")return raw.toString("base64");if(CODEC==="mulaw-8000"){const pcm=new Int16Array(raw.length);for(let i=0;i<raw.length;i++)pcm[i]=mulawDecodeByte(raw[i]);return int16ToBuffer(resample(pcm,8000,24000)).toString("base64")}throw new Error(`Unsupported TELEPHONY_AUDIO_CODEC ${CODEC}`)}
function fromOpenAI(base64:string){const raw=Buffer.from(base64,"base64");if(CODEC==="pcm16-24000")return raw.toString("base64");if(CODEC==="mulaw-8000"){const pcm=resample(bufferToInt16(raw),24000,8000),out=Buffer.alloc(pcm.length);for(let i=0;i<pcm.length;i++)out[i]=mulawEncodeSample(pcm[i]);return out.toString("base64")}throw new Error(`Unsupported TELEPHONY_AUDIO_CODEC ${CODEC}`)}
function asText(data:WebSocketData){if(typeof data==="string")return data;if(data instanceof ArrayBuffer)return Buffer.from(data).toString("utf8");if(ArrayBuffer.isView(data))return Buffer.from(data.buffer,data.byteOffset,data.byteLength).toString("utf8");return String(data)}
function streamId(m:any){return m?.stream_sid||m?.streamSid||m?.start?.stream_sid||m?.start?.streamSid||m?.start?.stream_id||m?.start?.streamId||null}
function payload(m:any){return m?.media?.payload||m?.media?.chunk||m?.payload||null}
function track(m:any){return m?.media?.track||m?.track||"inbound"}

export async function GET(req:Request){
 const key=process.env.OPENAI_API_KEY||process.env.ROHILLA_AI_PROVIDER_KEY;const secret=process.env.EXOTEL_STREAM_SECRET;
 if(!key||!secret)return Response.json({error:"Telephony realtime gateway is not configured"},{status:503});
 const url=new URL(req.url);if(url.searchParams.get("token")!==secret)return Response.json({error:"Invalid stream token"},{status:401});
 const target=url.searchParams.get("target")||process.env.ROHILLA_CALL_TARGET_LANGUAGE||"hi";const acceptedTrack=url.searchParams.get("source_track")||"inbound";
 return experimental_upgradeWebSocket((tel:any)=>{
  let id:string|null=null;let stopped=false;
  const ai=new ClientWebSocket(`wss://api.openai.com/v1/realtime/translations?model=${encodeURIComponent(MODEL)}`,{headers:{Authorization:`Bearer ${key}`,"OpenAI-Safety-Identifier":`rohilla-call-${Date.now().toString(36)}`}});
  ai.on("open",()=>ai.send(JSON.stringify({type:"session.update",session:{audio:{output:{language:target}}}})));
  ai.on("message",raw=>{try{const event=JSON.parse(String(raw));if(event.type==="session.output_audio.delta"&&id&&!stopped)tel.send(JSON.stringify({event:"media",stream_sid:id,media:{track:"outbound",payload:fromOpenAI(event.delta)}}));if(event.type==="error")console.error("Rohilla telephony translation error",event.error||event)}catch(err){console.error("Rohilla OpenAI media event error",err)}});
  ai.on("error",err=>{console.error("Rohilla OpenAI WebSocket error",err);try{tel.close(1011,"Translation provider error")}catch{}});
  tel.on("message",(data:WebSocketData)=>{try{const m=JSON.parse(asText(data));id=id||streamId(m);if((m.event==="media"||m.type==="media")&&track(m)===acceptedTrack){const p=payload(m);if(p&&ai.readyState===ClientWebSocket.OPEN)ai.send(JSON.stringify({type:"session.input_audio_buffer.append",audio:toOpenAI(p)}))}if(m.event==="stop"||m.type==="stop"){stopped=true;try{tel.close(1000,"Call ended")}catch{}}}catch(err){console.error("Rohilla telephony input error",err)}});
  tel.on("close",()=>{stopped=true;if(ai.readyState===ClientWebSocket.OPEN||ai.readyState===ClientWebSocket.CONNECTING)ai.close()});
 },{maxPayload:256*1024});
}
