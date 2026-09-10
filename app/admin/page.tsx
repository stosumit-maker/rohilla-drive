import type {Metadata} from "next";
import AdminDashboardClient from "./AdminDashboardClient";

export const metadata:Metadata={title:"Administration Console",description:"ROHILLA DRIVE administration dashboard for authorised operations users.",alternates:{canonical:"/admin"}};
export default function Page(){return <AdminDashboardClient/>}
