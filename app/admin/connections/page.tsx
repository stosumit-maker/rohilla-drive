import type {Metadata} from "next";
import PageClient from "./PageClient";
export const metadata:Metadata={title:"Integrations",description:"Review authorised ROHILLA DRIVE platform connection and integration status.",alternates:{canonical:"/admin/connections"}};
export default function Page(){return <PageClient/>}
