import type {Metadata} from "next";
import DealerPortalShell from "./DealerPortalShell";

const description="Secure ROHILLA DRIVE workspace for approved dealer partners.";
export const metadata:Metadata={
 title:{default:"Dealer Workspace | ROHILLA DRIVE",template:"%s | ROHILLA DRIVE"},
 description,
 robots:{index:false,follow:false,noarchive:true,nocache:true},
 alternates:{canonical:"/dealer"},
 openGraph:{title:"Dealer Workspace | ROHILLA DRIVE",description,url:"/dealer",siteName:"ROHILLA DRIVE",type:"website",images:[]},
 twitter:{card:"summary",title:"Dealer Workspace | ROHILLA DRIVE",description}
};

export default function DealerLayout({children}:{children:React.ReactNode}){
 return <>
  <style>{`body:has(.rd-dealer-portal) .legalFooter{display:none!important}`}</style>
  <DealerPortalShell>{children}</DealerPortalShell>
 </>;
}
