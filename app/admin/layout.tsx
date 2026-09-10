import type {Metadata} from "next";
import AdminPortalShell from "./AdminPortalShell";

const description="Secure ROHILLA DRIVE administration workspace for authorised operations users.";
export const metadata:Metadata={
 title:{default:"Administration Console | ROHILLA DRIVE",template:"%s | ROHILLA DRIVE"},
 description,
 robots:{index:false,follow:false,noarchive:true,nocache:true},
 alternates:{canonical:"/admin"},
 openGraph:{title:"Administration Console | ROHILLA DRIVE",description,url:"/admin",siteName:"ROHILLA DRIVE",type:"website",images:[]},
 twitter:{card:"summary",title:"Administration Console | ROHILLA DRIVE",description}
};

export default function AdminLayout({children}:{children:React.ReactNode}){
 return <>
  <style>{`body:has(.rd-admin-portal) .legalFooter{display:none!important}`}</style>
  <AdminPortalShell>{children}</AdminPortalShell>
 </>;
}
