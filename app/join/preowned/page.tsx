import DealerJoinForm from "../../components/DealerJoinForm";
const description="Register a pre-owned or used vehicle dealership with ROHILLA DRIVE for inventory, sourcing, buyer enquiries and dealer workflow access.";
export const metadata={title:"Pre-Owned Dealer Registration",description,alternates:{canonical:"/join/preowned"},openGraph:{title:"Pre-Owned Dealer Registration | ROHILLA DRIVE",description,url:"/join/preowned"},twitter:{card:"summary_large_image",title:"Pre-Owned Dealer Registration | ROHILLA DRIVE",description}};
export default function Page(){return <DealerJoinForm kind="preowned"/>}
