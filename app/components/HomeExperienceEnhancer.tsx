"use client";
import {useEffect} from "react";
import {usePathname} from "next/navigation";

export default function HomeExperienceEnhancer(){
 const path=usePathname();
 useEffect(()=>{
  if(path!=="/")return;
  let timer:number|undefined;
  let cleanupSearch:undefined|(()=>void);
  const apply=()=>{
   const section=document.getElementById("inventory");
   const navInventory=Array.from(document.querySelectorAll("header nav a")).find(a=>a.textContent?.trim()==="Inventory") as HTMLAnchorElement|undefined;
   if(navInventory)navInventory.href="/inventory";

   const heroSearch=document.querySelector(".hero .search");
   if(heroSearch&&!heroSearch.getAttribute("data-rd-inventory-route")){
    heroSearch.setAttribute("data-rd-inventory-route","1");
    const input=heroSearch.querySelector("input") as HTMLInputElement|null;
    const select=heroSearch.querySelector("select") as HTMLSelectElement|null;
    const button=heroSearch.querySelector("button") as HTMLButtonElement|null;
    const route=()=>{const p=new URLSearchParams();if(input?.value.trim())p.set("q",input.value.trim());if(select?.value&&select.value!=="All")p.set("fuel",select.value);window.location.href=`/inventory${p.toString()?`?${p.toString()}`:""}`};
    if(button){button.onclick=(e)=>{e.preventDefault();e.stopPropagation();route()}}
    if(input){const key=(e:KeyboardEvent)=>{if(e.key==="Enter"){e.preventDefault();route()}};input.addEventListener("keydown",key);cleanupSearch=()=>input.removeEventListener("keydown",key)}
   }

   const usedButton=Array.from(document.querySelectorAll(".primaryActions button")).find(b=>b.textContent?.includes("Used Cars")) as HTMLButtonElement|undefined;
   if(usedButton&&!usedButton.getAttribute("data-rd-inventory-route")){
    usedButton.setAttribute("data-rd-inventory-route","1");usedButton.onclick=(e)=>{e.preventDefault();e.stopPropagation();window.location.href="/inventory"};
   }

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
  observer.observe(document.body,{childList:true,subtree:true});
  return()=>{observer.disconnect();cleanupSearch?.();if(timer)window.clearTimeout(timer)};
 },[path]);
 return null;
}
