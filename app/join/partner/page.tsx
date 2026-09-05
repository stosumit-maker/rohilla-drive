import PartnerJoinForm from "../../components/PartnerJoinForm";
export const metadata={title:"Business Partner Registration",description:"Register an automotive service, mobility, logistics, finance, inspection or recycling business with Rohilla Drive.",alternates:{canonical:"/join/partner"}};
export default async function Page({searchParams}:{searchParams:Promise<{category?:string}>}){const q=await searchParams;return <PartnerJoinForm defaultCategory={q?.category||""}/>}
