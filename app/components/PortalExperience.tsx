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
  "/dealer/new-opportunities":"New Vehicle Opportunities",
  "/dealer/deals":"Deal Management",
  "/dealer/finance":"Vehicle Ledger & RC",
  "/dealer/growth":"Marketing Studio",
  "/dealer/language":"Language Operations",
  "/partner":"Partner Workspace",
  "/partner/deals":"Deal Management",
  "/partner/growth":"Marketing Studio",
  "/partner/language":"Language Operations"
};

export default function PortalExperience(){
  const path=usePathname();
  useEffect(()=>{
    const portal=path.startsWith("/admin")?"admin":path.startsWith("/dealer")?"dealer":path.startsWith("/partner")?"partner":"";
    document.body.classList.remove("rd-private-portal","rd-portal-admin","rd-portal-dealer","rd-portal-partner");
    if(portal){
      document.body.classList.add("rd-private-portal",`rd-portal-${portal}`);
      const match=Object.keys(titles).sort((a,b)=>b.length-a.length).find(key=>path===key||path.startsWith(`${key}/`));
      document.title=`${match?titles[match]:portal.charAt(0).toUpperCase()+portal.slice(1)+" Workspace"} | ROHILLA DRIVE`;
    }
    return()=>{document.body.classList.remove("rd-private-portal","rd-portal-admin","rd-portal-dealer","rd-portal-partner")};
  },[path]);
  return null;
}
