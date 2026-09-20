import type {Metadata} from "next";

const description="CarMentor by ROHILLA DRIVE helps customers find cars, share budgets and vehicle requirements, and route buying, selling or vehicle-service enquiries.";

export const metadata:Metadata={
  title:"CarMentor | Smart Car Guidance",
  description,
  alternates:{canonical:"/assistant"},
  openGraph:{title:"CarMentor | ROHILLA DRIVE",description,url:"/assistant",siteName:"ROHILLA DRIVE",type:"website"},
  twitter:{card:"summary",title:"CarMentor | ROHILLA DRIVE",description}
};

export default function AssistantLayout({children}:{children:React.ReactNode}){
  return children;
}
