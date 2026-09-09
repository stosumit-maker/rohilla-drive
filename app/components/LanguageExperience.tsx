"use client";
import {useEffect,useMemo,useRef,useState} from "react";
import {usePathname} from "next/navigation";
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
 const path=usePathname();
 const privatePortal=path.startsWith("/admin")||path.startsWith("/dealer")||path.startsWith("/partner");
 const [code,setCode]=useState("en-IN");
 const [show,setShow]=useState(false);
 const [hasSaved,setHasSaved]=useState(false);
 const [note,setNote]=useState("");
 const busy=useRef(false);
 const debounce=useRef<number|undefined>(undefined);
 const language=useMemo(()=>languageByCode(code),[code]);

 useEffect(()=>{
  const saved=localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if(saved){setCode(saved);setHasSaved(true)}else if(!privatePortal)setShow(true);
 },[privatePortal]);

 useEffect(()=>{
  if(privatePortal)return;
  document.documentElement.lang=language.translationCode;
  window.dispatchEvent(new CustomEvent("rohilla-language-change",{detail:language}));
  if(code==="en-IN")return;
  translateVisiblePage(code);
  const root=document.querySelector("main");if(!root)return;
  const observer=new MutationObserver(()=>{if(debounce.current)window.clearTimeout(debounce.current);debounce.current=window.setTimeout(()=>translateVisiblePage(code),450)});
  observer.observe(root,{childList:true,subtree:true});
  return()=>{observer.disconnect();if(debounce.current)window.clearTimeout(debounce.current)};
 },[code,path,privatePortal]);

 async function translateBatch(texts:string[],target:string){
  const r=await fetch("/api/translate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({texts,target,source:"en-IN"})});
  return await r.json();
 }

 async function translateVisiblePage(target:string){
  if(busy.current||privatePortal)return;
  busy.current=true;setNote("Translating…");
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
   setNote(configured?`${language.nativeName} ✓`:"Translation connection pending — your language preference is saved.");
  }catch{setNote("Language preference saved. Translation service is temporarily unavailable.")}finally{busy.current=false}
 }

 function choose(next:string){
  localStorage.setItem(LANGUAGE_STORAGE_KEY,next);
  setCode(next);setHasSaved(true);setShow(false);
 }

 if(privatePortal)return null;
 return <>
  <button onClick={()=>setShow(true)} aria-label="Choose language" data-no-translate style={{position:"fixed",right:12,top:72,zIndex:10020,border:"1px solid #d7b56d",background:"#111827",color:"#f4d38a",borderRadius:999,padding:"8px 11px",fontWeight:800,boxShadow:"0 6px 20px rgba(0,0,0,.2)"}}>🌐 {language.nativeName}</button>
  {note&&code!=="en-IN"&&<div data-no-translate style={{position:"fixed",right:12,top:112,zIndex:10019,maxWidth:280,fontSize:11,padding:"6px 9px",borderRadius:9,background:"rgba(17,24,39,.94)",color:"#fff"}}>{note}</div>}
  {show&&<div data-no-translate role="dialog" aria-modal="true" aria-label="Choose your language" style={{position:"fixed",inset:0,zIndex:10050,background:"rgba(3,7,18,.82)",display:"flex",alignItems:"center",justifyContent:"center",padding:"14px max(12px,env(safe-area-inset-right))"}}>
   <div style={{width:"min(620px,100%)",maxHeight:"88dvh",overflowY:"auto",WebkitOverflowScrolling:"touch",background:"#fff",color:"#111827",borderRadius:22,padding:"18px 16px 16px",boxShadow:"0 28px 80px rgba(0,0,0,.35)"}}>
    <div style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"flex-start"}}>
     <div><div style={{fontSize:24,fontWeight:900,lineHeight:1.15}}>Choose your language</div><p style={{margin:"6px 0 12px",fontSize:15,lineHeight:1.45,color:"#64748b"}}>अपनी भाषा चुनें • ਆਪਣੀ ਭਾਸ਼ਾ ਚੁਣੋ • ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ</p></div>
     {hasSaved&&<button onClick={()=>setShow(false)} aria-label="Close language chooser" style={{flex:"0 0 auto",border:"1px solid #e5e7eb",background:"#f8fafc",color:"#111827",fontSize:22,lineHeight:1,borderRadius:999,padding:"7px 10px"}}>×</button>}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:8}}>
     {ROHILLA_LANGUAGES.map(l=>{const selected=l.code===code;return <button key={l.code} onClick={()=>choose(l.code)} style={{minHeight:64,padding:"10px 11px",borderRadius:14,border:selected?"2px solid #173326":"1px solid #d1d5db",background:selected?"#eef7f1":"#fff",color:"#111827",textAlign:"left",display:"flex",flexDirection:"column",justifyContent:"center",gap:2,boxShadow:selected?"0 0 0 2px rgba(23,51,38,.05)":"none"}}><span style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:6,width:"100%"}}><b style={{fontSize:15,color:"#111827",lineHeight:1.25}}>{l.nativeName}</b>{selected&&<span aria-hidden style={{color:"#166534",fontWeight:900}}>✓</span>}</span><small style={{fontSize:11,color:"#64748b",lineHeight:1.25}}>{l.name}</small></button>})}
    </div>
    {!hasSaved&&<button onClick={()=>choose("en-IN")} style={{width:"100%",marginTop:10,background:"#111827",color:"#fff",border:"1px solid #111827",borderRadius:12,padding:"11px 14px",fontWeight:900}}>Continue in English</button>}
    <p style={{fontSize:11,color:"#64748b",margin:"11px 2px 0",lineHeight:1.45}}>You can change this anytime from the 🌐 language button. Secure Admin, Dealer and Partner portals use the protected Language Desk.</p>
   </div>
  </div>}
 </>;
}
