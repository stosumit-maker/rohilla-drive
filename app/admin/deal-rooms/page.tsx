import type {Metadata} from "next";
import PageClient from "./PageClient";
export const metadata:Metadata={title:"Deal Management",description:"Manage controlled deal workspaces, participants, workflow and multilingual communication.",alternates:{canonical:"/admin/deal-rooms"}};
export default function Page(){return <PageClient/>}
