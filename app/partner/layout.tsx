import type {Metadata} from "next";
import PartnerPortalShell from "./PartnerPortalShell";

export const metadata:Metadata={
 title:"Partner Workspace",
 description:"Secure ROHILLA DRIVE workspace for approved automotive service and mobility partners.",
 robots:{index:false,follow:false,noarchive:true,nocache:true},
 alternates:{canonical:"/partner"}
};

export default function PartnerLayout({children}:{children:React.ReactNode}){
 return <>
  <style>{`body:has(.rd-partner-portal) .legalFooter{display:none!important}`}</style>
  <PartnerPortalShell>{children}</PartnerPortalShell>
 </>;
}
