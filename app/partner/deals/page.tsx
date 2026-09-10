import type {Metadata} from "next";
import ParticipantDealRooms from "../../components/ParticipantDealRooms";
export const metadata:Metadata={title:"Deal Management",description:"Secure partner deal workspaces assigned through ROHILLA DRIVE.",alternates:{canonical:"/partner/deals"}};
export default function Page(){return <ParticipantDealRooms actorRole="partner" homeHref="/partner"/>}
