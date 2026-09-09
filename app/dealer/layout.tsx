import type {Metadata} from "next";
import PortalFrame from "../components/PortalFrame";

export const metadata:Metadata={
 title:"Dealer Workspace",
 description:"Private ROHILLA DRIVE dealer workspace for inventory, transactions, RC tracking, opportunities, deal management and marketing operations.",
 robots:{index:false,follow:false}
};

const nav=[
 {href:"/dealer",label:"Dashboard"},
 {href:"/dealer/new-opportunities",label:"New Vehicle Opportunities"},
 {href:"/dealer/deals",label:"Deal Management"},
 {href:"/dealer/finance",label:"Vehicle Ledger & RC"},
 {href:"/dealer/growth",label:"Marketing Studio"},
 {href:"/dealer/language",label:"Language Operations"},
 {href:"/business-hub",label:"Business Network"},
 {href:"/inventory",label:"Public Inventory"}
];

export default function DealerLayout({children}:{children:React.ReactNode}){
 return <PortalFrame portal="dealer" nav={nav}>{children}</PortalFrame>;
}
