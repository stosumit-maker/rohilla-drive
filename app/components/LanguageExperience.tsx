"use client";
import {useEffect,useMemo,useRef,useState} from "react";
import {LANGUAGE_STORAGE_KEY,ROHILLA_LANGUAGES,languageByCode} from "../lib/rohilla-languages";

const originals=new WeakMap<Text,string>();
const attrOriginals=new WeakMap<Element,Record<string,string>>();

function eligibleText(node:Text){
 const p=node.parentElement;if(!p)return false;
 if(p.closest("script,style,noscript,[data-no-translate]"))return false;
 const text=node.data.trim();
 return text.length>1&&!/^[-–—•|₹0-9.,:+()%/]+$/.test(text);
}

export default function LanguageExperience(){
 const [code,setCode]=useState("en-IN");const [show,setShow]=useState(false);const [note,setNote]=useState("");const busy=useRef(false);const language=useMemo(()=>languageByCode(code),[code]);
 useEffect(()=>{const saved=localStorage.getItem(LANGUAGE_STORAGE_KEY);if(saved){setCode(saved)}else setShow(true)},[]);
 useEffect(()=>{document.documentElement.lang=language.translationCode;window.dispatchEvent(new CustomEvent("rohilla-language-change",{detail:language}));if(code!=="en-IN")translateVisiblePage(code)},[code]);
 async function translateBatch(texts:string[],target:string){const r=await fetch("/api/translate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({texts,target,source:"en-IN"})});const j=await r.json();return j}
 async function translateVisiblePage(target:string){
  if(busy.current)return;busy.current=true;setNote("Translating…");
  try{
   const root=document.querySelector("main")||document.body;
   const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const nodes:Text[]=[];let n:Node|null;
   while((n=walker.nextNode())){const t=n as Text;if(!eligibleText(t))continue;if(!originals.has(t))originals.set(t,t.data);if(t.data!==originals.get(t))continue;nodes.push(t);if(nodes.length>=240)break}
   const elements=[...root.querySelectorAll("input[placeholder],textarea[placeholder],[title],[aria-label]")].filter(el=>!el.closest("[data-no-translate]"));
   const items:{kind:"text"|"attr";node:Text|Element;attr?:string;value:string}[]=[];
   nodes.forEach(node=>items.push({kind:"text",node,value:originals.get(node)||node.data}));
   elements.forEach(el=>{const attrs=["placeholder","title","aria-label"];let map=attrOriginals.get(el)||{};attrs.forEach(attr=>{const v=el.getAttribute(attr);if(v&&v.length>1){if(!map[attr])map[attr]=v;items.push({kind:"attr",node:el,attr,value:map[attr]})}});attrOriginals.set(el,map)});
   let configured=true;
   for(let i=0;i<items.length;i+=40){const part=items.slice(i,i+40);const j=await translateBatch(part.map(x=>x.value),target);if(!j.configured){configured=false;break}const out=j.translations||[];part.forEach((item,k)=>{const value=out[k]||item.value;if(item.kind==="text")(item.node as Text).data=value;else (item.node as Element).setAttribute(item.attr!,value)})}
   setNote(configured?`${language.nativeName} ✓`:"Translation provider connection pending — language preference saved.");
  }catch{setNote("Language preference saved. Translation service is temporarily unavailable.")}finally{busy.current=false}
 }
 function choose(next:string){localStorage.setItem(LANGUAGE_STORAGE_KEY,next);setCode(next);setShow(false)}
 return <>
  <button onClick={()=>setShow(true)} aria-label="Choose language" style={{position:"fixed",right:12,top:72,zIndex:10020,border:"1px solid #d7b56d",background:"#111827",color:"#f4d38a",borderRadius:999,padding:"8px 11px",fontWeight:800,boxShadow:"0 6px 20px rgba(0,0,0,.2)"}}>🌐 {language.nativeName}</button>
  {note&&code!=="en-IN"&&<div style={{position:"fixed",right:12,top:112,zIndex:10019,maxWidth:260,fontSize:11,padding:"6px 9px",borderRadius:9,background:"rgba(17,24,39,.94)",color:"#fff"}}>{note}</div>}
  {show&&<div style={{position:"fixed",inset:0,zIndex:10050,background:"rgba(3,7,18,.82)",display:"grid",placeItems:"center",padding:18}}><div style={{width:"min(720px,100%)",maxHeight:"86vh",overflow:"auto",background:"#fff",color:"#111827",borderRadius:22,padding:20,boxShadow:"0 28px 80px rgba(0,0,0,.35)"}}><div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"start"}}><div><b style={{fontSize:22}}>Choose your language</b><p style={{margin:"5px 0 16px"}}>अपनी भाषा चुनें • ਆਪਣੀ ਭਾਸ਼ਾ ਚੁਣੋ • ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ</p></div>{localStorage.getItem(LANGUAGE_STORAGE_KEY)&&<button onClick={()=>setShow(false)} style={{border:0,background:"transparent",fontSize:26}}>×</button>}</div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(145px,1fr))",gap:9}}>{ROHILLA_LANGUAGES.map(l=><button key={l.code} onClick={()=>choose(l.code)} style={{padding:"13px 10px",borderRadius:14,border:l.code===code?"2px solid #173326":"1px solid #d1d5db",background:l.code===code?"#eef7f1":"#fff",textAlign:"left"}}><b>{l.nativeName}</b><br/><small>{l.name}</small></button>)}</div><p style={{fontSize:12,color:"#4b5563",marginTop:16}}>Your choice is saved on this device. Text and voice assistance use the same language preference where supported.</p></div></div>}
 </>
}
