import http from "node:http";
import {WebSocket,WebSocketServer} from "ws";

const PORT=Number(process.env.PORT||8080);
const OPENAI_API_KEY=process.env.OPENAI_API_KEY||process.env.ROHILLA_AI_PROVIDER_KEY||"";
const MODEL=process.env.ROHILLA_REALTIME_TRANSLATE_MODEL||"gpt-realtime-translate";
const DEFAULT_TARGET=process.env.ROHILLA_CALL_TARGET_LANGUAGE||"hi";
const CODEC=process.env.TELEPHONY_AUDIO_CODEC||"mulaw-8000";

function clamp16(v){return Math.max(-32768,Math.min(32767,Math.round(v)))}
function mulawDecodeByte(u){u=(~u)&255;const sign=u&0x80;const exponent=(u>>4)&7;const mantissa=u&15;let sample=((mantissa<<3)+0x84)<<exponent;sample-=0x84;return sign?-sample:sample}
function mulawEncodeSample(sample){let pcm=clamp16(sample);const sign=pcm<0?0x80:0;if(pcm<0)pcm=-pcm;pcm=Math.min(32635,pcm)+0x84;let exponent=7;for(let mask=0x4000;(pcm&mask)===0&&exponent>0;mask>>=1)exponent--;const mantissa=(pcm>>(exponent+3))&0x0f;return (~(sign|(exponent<<4)|mantissa))&255}
function bufferToInt16LE(buf){const out=new Int16Array(Math.floor(buf.length/2));for(let i=0;i<out.length;i++)out[i]=buf.readInt16LE(i*2);return out}
function int16ToBufferLE(samples){const b=Buffer.alloc(samples.length*2);for(let i=0;i<samples.length;i++)b.writeInt16LE(clamp16(samples[i]),i*2);return b}
function resampleLinear(input,fromRate,toRate){if(fromRate===toRate)return input;const outLen=Math.max(1,Math.round(input.length*toRate/fromRate));const out=new Int16Array(outLen);const scale=(input.length-1)/Math.max(1,outLen-1);for(let i=0;i<outLen;i++){const p=i*scale,a=Math.floor(p),b=Math.min(input.length-1,a+1),f=p-a;out[i]=clamp16(input[a]*(1-f)+input[b]*f)}return out}
function telephonyToOpenAI(base64){const raw=Buffer.from(base64,"base64");if(CODEC==="pcm16-24000")return raw.toString("base64");if(CODEC==="mulaw-8000"){const pcm=new Int16Array(raw.length);for(let i=0;i<raw.length;i++)pcm[i]=mulawDecodeByte(raw[i]);return int16ToBufferLE(resampleLinear(pcm,8000,24000)).toString("base64")}throw new Error(`Unsupported TELEPHONY_AUDIO_CODEC: ${CODEC}`)}
function openAIToTelephony(base64){const raw=Buffer.from(base64,"base64");if(CODEC==="pcm16-24000")return raw.toString("base64");if(CODEC==="mulaw-8000"){const pcm=resampleLinear(bufferToInt16LE(raw),24000,8000);const out=Buffer.alloc(pcm.length);for(let i=0;i<pcm.length;i++)out[i]=mulawEncodeSample(pcm[i]);return out.toString("base64")}throw new Error(`Unsupported TELEPHONY_AUDIO_CODEC: ${CODEC}`)}
function streamId(msg){return msg?.stream_sid||msg?.streamSid||msg?.start?.stream_sid||msg?.start?.streamSid||msg?.start?.stream_id||msg?.start?.streamId||null}
function mediaPayload(msg){return msg?.media?.payload||msg?.media?.chunk||msg?.payload||null}
function mediaTrack(msg){return msg?.media?.track||msg?.track||"inbound"}
function outgoingMedia(id,payload,track="outbound"){return JSON.stringify({event:"media",stream_sid:id,media:{track,payload}})}

function openTranslation(target,safetyId){
 if(!OPENAI_API_KEY)throw new Error("OPENAI_API_KEY is missing");
 const url=`wss://api.openai.com/v1/realtime/translations?model=${encodeURIComponent(MODEL)}`;
 const ws=new WebSocket(url,{headers:{Authorization:`Bearer ${OPENAI_API_KEY}`,"OpenAI-Safety-Identifier":safetyId}});
 ws.on("open",()=>ws.send(JSON.stringify({type:"session.update",session:{audio:{output:{language:target}}}})));
 return ws;
}

const server=http.createServer((req,res)=>{
 if(req.url==="/health"){res.writeHead(200,{"content-type":"application/json"});res.end(JSON.stringify({ok:true,openai:Boolean(OPENAI_API_KEY),codec:CODEC,model:MODEL}));return}
 res.writeHead(404);res.end("Not found");
});
const wss=new WebSocketServer({server,path:"/media"});

wss.on("connection",(tel,req)=>{
 const url=new URL(req.url||"/media","http://localhost");const target=url.searchParams.get("target")||DEFAULT_TARGET;const safetyId=`rohilla-call-${Date.now().toString(36)}`;let id=null;let ai;
 try{ai=openTranslation(target,safetyId)}catch(err){tel.close(1011,String(err?.message||err));return}
 ai.on("message",raw=>{try{const event=JSON.parse(String(raw));if(event.type==="session.output_audio.delta"&&id&&tel.readyState===WebSocket.OPEN)tel.send(outgoingMedia(id,openAIToTelephony(event.delta)));if(event.type==="session.input_transcript.delta")console.log(JSON.stringify({type:"source_transcript",stream:id,delta:event.delta||""}));if(event.type==="session.output_transcript.delta")console.log(JSON.stringify({type:"translated_transcript",stream:id,target,delta:event.delta||""}));if(event.type==="error")console.error("OpenAI realtime error",event.error||event)}catch(err){console.error("OpenAI event error",err)}});
 ai.on("error",err=>{console.error("OpenAI socket error",err);if(tel.readyState===WebSocket.OPEN)tel.close(1011,"Translation provider error")});
 tel.on("message",raw=>{try{const msg=JSON.parse(String(raw));id=id||streamId(msg);if(msg.event==="media"||msg.type==="media"){const payload=mediaPayload(msg);const track=mediaTrack(msg);if(payload&&track!=="outbound"&&ai.readyState===WebSocket.OPEN)ai.send(JSON.stringify({type:"session.input_audio_buffer.append",audio:telephonyToOpenAI(payload)}))}if(msg.event==="stop"||msg.type==="stop")tel.close(1000,"Call stream ended")}catch(err){console.error("Telephony media error",err)}});
 tel.on("close",()=>{if(ai.readyState===WebSocket.OPEN||ai.readyState===WebSocket.CONNECTING)ai.close()});
});

server.listen(PORT,()=>console.log(`Rohilla realtime gateway listening on :${PORT}/media`));
