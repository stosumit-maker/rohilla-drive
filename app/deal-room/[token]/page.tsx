import PublicDealRoom from "../../components/PublicDealRoom";
export const metadata={title:"Rohilla Deal Room",description:"Private Rohilla Drive cross-state vehicle coordination room.",robots:{index:false,follow:false}};
export default async function Page({params}:{params:Promise<{token:string}>}){const {token}=await params;return <PublicDealRoom token={token}/>}
