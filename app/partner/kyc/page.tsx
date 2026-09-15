import type {Metadata} from "next";
import PartnerKycClient from "./PartnerKycClient";
export const metadata:Metadata={title:"Partner KYC",description:"Private ROHILLA DRIVE business verification workspace for partner applicants.",robots:{index:false,follow:false,noarchive:true},alternates:{canonical:"/partner/kyc"}};
export default function Page(){return <PartnerKycClient/>}
