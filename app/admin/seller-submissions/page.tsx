import type {Metadata} from "next";
import SellerSubmissionsClient from "./SellerSubmissionsClient";

export const metadata:Metadata={title:"Seller Submissions",description:"Private seller vehicle intake review for authorised ROHILLA DRIVE administration users.",robots:{index:false,follow:false,noarchive:true},alternates:{canonical:"/admin/seller-submissions"}};
export default function Page(){return <SellerSubmissionsClient/>}
