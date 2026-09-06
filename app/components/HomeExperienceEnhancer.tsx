"use client";
import {useEffect} from "react";
import {usePathname} from "next/navigation";

export default function HomeExperienceEnhancer(){
 const path=usePathname();
 useEffect(()=>{
  if(path!=="/")return;
  let timer:number|undefined;
  const apply=()=>{
   const section=document.getElementById("inventory");
   if(!section)return;
   const title=section.querySelector("h2");
   if(title&&title.textContent!=="Featured Used / Pre-Owned Inventory")title.textContent="Featured Used / Pre-Owned Inventory";
   const grid=section.querySelector(".grid");
   if(grid){
    const cards=Array.from(grid.querySelectorAll(":scope > article")) as HTMLElement[];
    cards.forEach((card,index)=>{card.style.display=index<6?"":"none"});
    if(cards.length>6&&!section.querySelector("#browse-full-inventory")){
     const wrap=document.createElement("div");wrap.id="browse-full-inventory";wrap.style.cssText="display:flex;justify-content:center;margin-top:18px";
     const link=document.createElement("a");link.href="/inventory";link.className="call";link.textContent=`Browse Full Inventory (${cards.length}) →`;
     wrap.appendChild(link);grid.insertAdjacentElement("afterend",wrap);
    }
   }
  };
  apply();
  const observer=new MutationObserver(()=>{if(timer)window.clearTimeout(timer);timer=window.setTimeout(apply,120)});
  const section=document.getElementById("inventory");if(section)observer.observe(section,{childList:true,subtree:true});
  return()=>{observer.disconnect();if(timer)window.clearTimeout(timer)};
 },[path]);
 return null;
}
