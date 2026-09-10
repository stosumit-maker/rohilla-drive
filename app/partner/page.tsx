import type {Metadata} from "next";
import PartnerDashboardClient from "./PartnerDashboardClient";
export const metadata:Metadata={title:"Partner Workspace",description:"Approved automotive service and mobility partner workspace for assigned customer operations.",alternates:{canonical:"/partner"}};
export default function Page(){return <PartnerDashboardClient/>}
