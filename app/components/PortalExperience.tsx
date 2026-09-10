"use client";

import {useEffect} from "react";
import {usePathname} from "next/navigation";

const titles:Record<string,string>={
  "/admin":"Administration Console",
  "/admin/add-vehicle":"Inventory Management",
  "/admin/revenue":"Revenue & Collections",
  "/admin/new-vehicles":"New Vehicle Leads",
  "/admin/deal-rooms":"Deal Management",
  "/admin/finance":"Transactions & RC",
  "/admin/poster-scan":"Listing Intake",
  "/admin/vehicle-ai":"Vehicle Intelligence",
  "/admin/verification":"Verification Operations",
  "/admin/growth":"Marketing Studio",
  "/admin/language":"Language Operations",
  "/admin/connections":"Integrations",
  "/dealer":"Dealer Workspace",
  "/dealer/new-opportunities":"New Vehicle Leads",
  "/dealer/deals":"Deal Management",
  "/dealer/finance":"Vehicle Ledger & RC",
  "/dealer/growth":"Marketing Studio",
  "/dealer/language":"Language Operations",
  "/partner":"Partner Workspace",
  "/partner/deals":"Deal Management",
  "/partner/growth":"Marketing Studio",
  "/partner/language":"Language Operations"
};

const currentCopy:Record<string,string>={
  "ROHILLA DRIVE Admin":"ROHILLA DRIVE",
  "ROHILLA DRIVE ADMIN":"ROHILLA DRIVE",
  "ROHILLA DRIVE DEALER":"ROHILLA DRIVE",
  "ROHILLA DRIVE PARTNER":"ROHILLA DRIVE",
  "Owner/Admin login":"Secure access for authorised administration users.",
  "Secure Admin Setup":"Administrator Security Setup",
  "Google Authenticator में QR scan करो।":"Scan the QR code with your authenticator app, then enter the 6-digit verification code.",
  "Authenticator verification required":"Multi-factor authentication required",
  "Control Room":"Administration Console",
  "Verification Desk":"Verification Operations",
  "Dealer Portal":"Dealer Workspace",
  "Dealer Business Portal":"Dealer Workspace",
  "Dealer Dashboard":"Dealer Workspace Overview",
  "Partner Portal":"Partner Workspace",
  "Partner Business Portal":"Partner Workspace",
  "Customer Website":"Public Website",
  "Business Network":"Business Hub",
  "PARTNER DASHBOARD":"WORKSPACE OVERVIEW",
  "Loading Partner Portal…":"Loading Partner Workspace…",
  "Back to Dealer Portal":"Back to Dealer Workspace",
  "Back to Portal":"Back to Workspace",
  "Portal Home":"Back to Dashboard",
  "Transactions, Margin & RC":"Vehicle Ledger & RC",
  "Open Transaction Ledger":"Open Vehicle Ledger",
  "Marketing Tools":"Marketing Studio",
  "Open Marketing Tools":"Open Marketing Studio",
  "Marketing & Content Management":"Marketing Studio",
  "Dealer Marketing & Content":"Marketing Studio",
  "Partner Marketing & Business Tools":"Marketing Studio",
  "Language Support":"Language Operations",
  "Language & Communication Support":"Language Operations",
  "Dealer Language Support":"Language Operations",
  "Partner Language Support":"Language Operations",
  "Listing Assistant":"Listing Intake",
  "Vehicle Verification":"Verification Operations",
  "New Vehicle Opportunities":"New Vehicle Leads",
  "New Vehicle Lead Management":"New Vehicle Leads",
  "Revenue Management":"Revenue & Collections"
};

function polishCurrentPortalCopy(root:ParentNode){
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node:Node|null;
  while((node=walker.nextNode())){
    const text=node as Text;
    if(!text.parentElement||text.parentElement.closest("script,style,[data-no-copy-polish]"))continue;
    const trimmed=text.data.trim();
    let next=currentCopy[trimmed]?text.data.replace(trimmed,currentCopy[trimmed]):text.data;
    next=next.replace(/Rohilla Drive/g,"ROHILLA DRIVE").replace(/\s*✓/g,"");
    if(next!==text.data)text.data=next;
  }
}

export default function PortalExperience(){
  const path=usePathname();
  useEffect(()=>{
    const portal=path.startsWith("/admin")?"admin":path.startsWith("/dealer")?"dealer":path.startsWith("/partner")?"partner":"";
    document.body.classList.remove("rd-private-portal","rd-portal-admin","rd-portal-dealer","rd-portal-partner");
    let observer:MutationObserver|undefined;
    if(portal){
      document.body.classList.add("rd-private-portal",`rd-portal-${portal}`);
      const match=Object.keys(titles).sort((a,b)=>b.length-a.length).find(key=>path===key||path.startsWith(`${key}/`));
      document.title=`${match?titles[match]:portal.charAt(0).toUpperCase()+portal.slice(1)+" Workspace"} | ROHILLA DRIVE`;
      const run=()=>polishCurrentPortalCopy(document.body);
      run();
      observer=new MutationObserver(run);
      observer.observe(document.body,{childList:true,subtree:true});
    }
    return()=>{observer?.disconnect();document.body.classList.remove("rd-private-portal","rd-portal-admin","rd-portal-dealer","rd-portal-partner")};
  },[path]);
  return null;
}
