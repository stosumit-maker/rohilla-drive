import type {Metadata} from "next";
import GrowthConsole from "../../components/GrowthConsole";
export const metadata:Metadata={title:"Marketing Studio",description:"Partner marketing and business content planning workspace with review controls.",alternates:{canonical:"/partner/growth"}};
export default function PartnerGrowth(){return <GrowthConsole actorRole="partner" title="Partner Marketing & Business Tools" homeHref="/partner"/>}
