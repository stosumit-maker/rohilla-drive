import type {Metadata} from "next";
import PageClient from "./PageClient";
export const metadata:Metadata={title:"Verification Operations",description:"Manage authorised vehicle verification requests and workflow status.",alternates:{canonical:"/admin/verification"}};
export default function Page(){return <PageClient/>}
