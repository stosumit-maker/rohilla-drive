import type {Metadata} from "next";
import PageClient from "./PageClient";
export const metadata:Metadata={title:"Vehicle Ledger & RC",description:"Private dealer transaction, margin and RC-transfer records for the dealer's own vehicles.",alternates:{canonical:"/dealer/finance"}};
export default function Page(){return <PageClient/>}
