import type {Metadata} from "next";
import DealerDashboardClient from "./DealerDashboardClient";
export const metadata:Metadata={title:"Dealer Workspace",description:"Approved dealer workspace for inventory, transactions, new-vehicle leads and business operations.",alternates:{canonical:"/dealer"}};
export default function Page(){return <DealerDashboardClient/>}
