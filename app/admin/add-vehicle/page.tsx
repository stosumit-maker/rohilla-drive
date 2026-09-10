import type {Metadata} from "next";
import PageClient from "./PageClient";
export const metadata:Metadata={title:"Inventory Management",description:"Create, review and publish ROHILLA DRIVE vehicle inventory records.",alternates:{canonical:"/admin/add-vehicle"}};
export default function Page(){return <PageClient/>}
