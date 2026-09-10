import type {Metadata} from "next";
import AdminPortalShell from "./AdminPortalShell";

export const metadata:Metadata={
 title:"Administration Console",
 description:"Secure ROHILLA DRIVE administration workspace for authorised operations users.",
 robots:{index:false,follow:false,noarchive:true,nocache:true},
 alternates:{canonical:"/admin"}
};

export default function AdminLayout({children}:{children:React.ReactNode}){
 return <>
  <style>{`body:has(.rd-admin-portal) .legalFooter{display:none!important}`}</style>
  <AdminPortalShell>{children}</AdminPortalShell>
 </>;
}
