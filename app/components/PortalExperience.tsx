"use client";
import {useEffect} from "react";
import {usePathname} from "next/navigation";

const titles:Record<string,string>={
 "/admin":"Administration Console","/admin/add-vehicle":"Inventory Management","/admin/revenue":"Revenue & Collections","/admin/new-vehicles":"New Vehicle Leads","/admin/deal-rooms":"Deal Management","/admin/finance":"Transactions & RC","/admin/poster-scan":"Listing Intake","/admin/vehicle-ai":"Vehicle Intelligence","/admin/verification":"Verification Operations","/admin/growth":"Marketing Studio","/admin/language":"Language Operations","/admin/connections":"Integrations",
 "/dealer":"Dealer Workspace","/dealer/new-opportunities":"New Vehicle Opportunities","/dealer/deals":"Deal Management","/dealer/finance":"Vehicle Ledger & RC","/dealer/growth":"Marketing Studio","/dealer/language":"Language Operations",
 "/partner":"Partner Workspace","/partner/deals":"Deal Management","/partner/growth":"Marketing Studio","/partner/language":"Language Operations"
};
export default function PortalExperience(){
 const path=usePathname();
 useEffect(()=>{
  const privatePortal=path.startsWith("/admin")||path.startsWith("/dealer")||path.startsWith("/partner");
  document.body.classList.toggle("rd-private-portal",privatePortal);
  if(privatePortal){const match=Object.keys(titles).sort((a,b)=>b.length-a.length).find(k=>path===k||path.startsWith(`${k}/`));document.title=`${match?titles[match]:"Business Workspace"} | ROHILLA DRIVE`}
  return()=>document.body.classList.remove("rd-private-portal");
 },[path]);
 return null;
}
