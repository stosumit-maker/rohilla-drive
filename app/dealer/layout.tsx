import type {Metadata} from "next";
import DealerPortalShell from "./DealerPortalShell";

export const metadata:Metadata={
 title:"Dealer Workspace",
 description:"Secure ROHILLA DRIVE workspace for approved dealer partners.",
 robots:{index:false,follow:false,noarchive:true,nocache:true},
 alternates:{canonical:"/dealer"}
};

export default function DealerLayout({children}:{children:React.ReactNode}){
 return <>
  <style>{`body:has(.rd-dealer-portal) .legalFooter{display:none!important}`}</style>
  <DealerPortalShell>{children}</DealerPortalShell>
 </>;
}
