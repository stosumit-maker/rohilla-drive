import type {Metadata} from "next";
import PageClient from "./PageClient";
export const metadata:Metadata={title:"Vehicle Intelligence",description:"Authorised vehicle and listing image analysis with privacy and human-review controls.",alternates:{canonical:"/admin/vehicle-ai"}};
export default function Page(){return <PageClient/>}
