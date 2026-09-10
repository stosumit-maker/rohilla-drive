import type {Metadata} from "next";
import PageClient from "./PageClient";
export const metadata:Metadata={title:"New Vehicle Leads",description:"Review assigned new-vehicle requirements and submit authorised dealer offers.",alternates:{canonical:"/dealer/new-opportunities"}};
export default function Page(){return <PageClient/>}
