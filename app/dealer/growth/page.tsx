import type {Metadata} from "next";
import GrowthConsole from "../../components/GrowthConsole";
export const metadata:Metadata={title:"Marketing Studio",description:"Dealer marketing and content planning workspace with privacy and review controls.",alternates:{canonical:"/dealer/growth"}};
export default function DealerGrowth(){return <GrowthConsole actorRole="dealer" title="Dealer Marketing & Content" homeHref="/dealer"/>}
