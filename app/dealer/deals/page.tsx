import type {Metadata} from "next";
import ParticipantDealRooms from "../../components/ParticipantDealRooms";
export const metadata:Metadata={title:"Deal Management",description:"Secure dealer deal workspaces assigned through ROHILLA DRIVE.",alternates:{canonical:"/dealer/deals"}};
export default function Page(){return <ParticipantDealRooms actorRole="dealer" homeHref="/dealer"/>}
