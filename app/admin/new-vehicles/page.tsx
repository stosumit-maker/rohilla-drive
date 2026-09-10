import type {Metadata} from "next";
import PageClient from "./PageClient";
export const metadata:Metadata={title:"New Vehicle Leads",description:"Manage new-vehicle customer requirements and authorised dealer offers.",alternates:{canonical:"/admin/new-vehicles"}};
export default function Page(){return <PageClient/>}
