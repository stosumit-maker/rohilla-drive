import DealerJoinForm from "../../components/DealerJoinForm";
const description="Register an OEM or authorised new-vehicle dealership with ROHILLA DRIVE to receive structured customer demand, quote and test-drive opportunities.";
export const metadata={title:"OEM / Authorised Dealer Registration",description,alternates:{canonical:"/join/oem"},openGraph:{title:"OEM / Authorised Dealer Registration | ROHILLA DRIVE",description,url:"/join/oem"},twitter:{card:"summary_large_image",title:"OEM / Authorised Dealer Registration | ROHILLA DRIVE",description}};
export default function Page(){return <DealerJoinForm kind="oem"/>}
