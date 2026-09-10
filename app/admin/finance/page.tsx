import type {Metadata} from "next";
import PageClient from "./PageClient";
export const metadata:Metadata={title:"Transactions & RC",description:"Private vehicle transaction, margin and RC-transfer administration.",alternates:{canonical:"/admin/finance"}};
export default function Page(){return <PageClient/>}
