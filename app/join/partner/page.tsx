import PartnerJoinForm from "../../components/PartnerJoinForm";
const description="Register an automotive service, mobility, logistics, finance, inspection or recycling business with ROHILLA DRIVE.";
export const metadata={title:"Business Partner Registration",description,alternates:{canonical:"/join/partner"},openGraph:{title:"Business Partner Registration | ROHILLA DRIVE",description,url:"/join/partner"},twitter:{card:"summary_large_image",title:"Business Partner Registration | ROHILLA DRIVE",description}};
export default async function Page({searchParams}:{searchParams:Promise<{category?:string}>}){const q=await searchParams;return <PartnerJoinForm defaultCategory={q?.category||""}/>}
