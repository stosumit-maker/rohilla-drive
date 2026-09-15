import type {Metadata} from "next";
import ServiceOperationsClient from "./ServiceOperationsClient";

export const metadata:Metadata={title:"Service Operations",description:"Private service workflow operations for authorised ROHILLA DRIVE administration users.",robots:{index:false,follow:false,noarchive:true},alternates:{canonical:"/admin/service-operations"}};
export default function Page(){return <ServiceOperationsClient/>}
