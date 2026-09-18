import type {Metadata} from "next";

const description="ROHILLA DRIVE assistance for vehicle buying, selling, new-vehicle requirements, automotive services and business registration.";

export const metadata:Metadata={
  title:"Vehicle & Service Assistant",
  description,
  alternates:{canonical:"/assistant"},
  openGraph:{title:"Vehicle & Service Assistant | ROHILLA DRIVE",description,url:"/assistant",siteName:"ROHILLA DRIVE",type:"website"},
  twitter:{card:"summary",title:"Vehicle & Service Assistant | ROHILLA DRIVE",description}
};

export default function AssistantLayout({children}:{children:React.ReactNode}){
  return children;
}
