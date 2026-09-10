import type {Metadata} from "next";
import PageClient from "./PageClient";
export const metadata:Metadata={title:"Listing Intake",description:"Extract and review vehicle listing information before inventory publication.",alternates:{canonical:"/admin/poster-scan"}};
export default function Page(){return <PageClient/>}
