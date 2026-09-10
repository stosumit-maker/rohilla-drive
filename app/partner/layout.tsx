import type {Metadata} from "next";
import PartnerPortalShell from "./PartnerPortalShell";

const description="Secure ROHILLA DRIVE workspace for approved automotive service and mobility partners.";
export const metadata:Metadata={
 title:{default:"Partner Workspace | ROHILLA DRIVE",template:"%s | ROHILLA DRIVE"},
 description,
 robots:{index:false,follow:false,noarchive:true,nocache:true},
 alternates:{canonical:"/partner"},
 openGraph:{title:"Partner Workspace | ROHILLA DRIVE",description,url:"/partner",siteName:"ROHILLA DRIVE",type:"website",images:[]},
 twitter:{card:"summary",title:"Partner Workspace | ROHILLA DRIVE",description}
};

export default function PartnerLayout({children}:{children:React.ReactNode}){
 return <>
  <style>{`body:has(.rd-partner-portal) .legalFooter{display:none!important}`}</style>
  <PartnerPortalShell>{children}</PartnerPortalShell>
 </>;
}
