import type {Metadata} from "next";
import TrustedAssistLanding from "../components/TrustedAssistLanding";
import {trustedAudience} from "../lib/trustedAssistAudiences";

const audience=trustedAudience("defence")!;
export const metadata:Metadata={title:audience.title,description:audience.description,alternates:{canonical:audience.path},openGraph:{title:audience.title,description:audience.description,url:audience.path,type:"website"},twitter:{card:"summary_large_image",title:audience.title,description:audience.description}};
export default function Page(){return <TrustedAssistLanding audience={audience}/>}
