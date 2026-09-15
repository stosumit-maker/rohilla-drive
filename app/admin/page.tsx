import type {Metadata} from "next";
import AdminDashboardClient from "./AdminDashboardClient";
import AdminSellerShortcut from "./AdminSellerShortcut";
import AdminServiceShortcut from "./AdminServiceShortcut";
import AdminKycShortcut from "./AdminKycShortcut";

export const metadata:Metadata={title:"Administration Console",description:"ROHILLA DRIVE administration dashboard for authorised operations users.",alternates:{canonical:"/admin"}};
export default function Page(){return <><AdminSellerShortcut/><AdminServiceShortcut/><AdminKycShortcut/><AdminDashboardClient/></>}
