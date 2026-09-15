import type {Metadata} from "next";
import PartnerKycReviewClient from "./PartnerKycReviewClient";
export const metadata:Metadata={title:"Partner KYC Review",description:"Private partner KYC review for authorised ROHILLA DRIVE administration users.",robots:{index:false,follow:false,noarchive:true},alternates:{canonical:"/admin/partner-kyc"}};
export default function Page(){return <PartnerKycReviewClient/>}
