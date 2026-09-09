import type {Metadata} from "next";
import PortalFrame from "../components/PortalFrame";

export const metadata:Metadata={
 title:"Partner Workspace",
 description:"Private ROHILLA DRIVE partner workspace for assigned requests, deal management, marketing and language operations.",
 robots:{index:false,follow:false}
};

const nav=[
 {href:"/partner",label:"Dashboard"},
 {href:"/partner/deals",label:"Deal Management"},
 {href:"/partner/growth",label:"Marketing Studio"},
 {href:"/partner/language",label:"Language Operations"},
 {href:"/business-hub",label:"Business Network"},
 {href:"/inventory",label:"Public Inventory"}
];

export default function PartnerLayout({children}:{children:React.ReactNode}){
 return <PortalFrame portal="partner" nav={nav}>{children}</PortalFrame>;
}
