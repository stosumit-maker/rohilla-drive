import type {Metadata} from "next";
import PageClient from "./PageClient";
export const metadata:Metadata={title:"Language Operations",description:"Multilingual customer communication and authorised interpretation workspace.",alternates:{canonical:"/admin/language"}};
export default function Page(){return <PageClient/>}
