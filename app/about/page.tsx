import type { Metadata } from "next";

const site = "https://www.rohilladrive.com";

export const metadata: Metadata = {
  title: "About Rohilla Drive — Official Automotive Network",
  description: "Official information about ROHILLA DRIVE by Rohilla Multibrand Cars in Ambala City, Haryana: new and pre-owned vehicles, selling, verification, services and automotive business connections.",
  alternates: { canonical: "/about" },
  openGraph: {
    type: "website",
    url: `${site}/about`,
    title: "About ROHILLA DRIVE — Official Automotive Network",
    description: "Official Rohilla Drive brand and business information from Ambala City, Haryana.",
  },
};

export default function AboutRohillaDrive() {
  return (
    <main style={{maxWidth:980,margin:"0 auto",padding:"110px 20px 56px",fontFamily:"Arial,Helvetica,sans-serif"}}>
      <section style={{background:"#0b1220",color:"white",borderRadius:24,padding:"34px 28px",marginBottom:22}}>
        <p style={{fontWeight:900,letterSpacing:1,color:"#55d6be",marginTop:0}}>OFFICIAL WEBSITE • ROHILLADRIVE.COM</p>
        <h1 style={{fontSize:"clamp(34px,6vw,62px)",lineHeight:1.04,margin:"10px 0 16px"}}>ROHILLA DRIVE</h1>
        <p style={{fontSize:20,lineHeight:1.55,maxWidth:780,marginBottom:0}}>
          ROHILLA DRIVE is the vehicle and automotive network by Rohilla Multibrand Cars, based in Ambala City, Haryana. The platform connects customers, individual sellers, authorised new-vehicle dealers, pre-owned dealers and automotive service businesses through one digital network.
        </p>
      </section>

      <section style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:14,marginBottom:22}}>
        {[
          ["Buy Vehicles","Browse published pre-owned inventory and submit a vehicle enquiry.","/inventory"],
          ["New Vehicle Assistance","Share a new-vehicle requirement for dealer offers and assistance.","/new-vehicles"],
          ["Sell / List","Individual sellers can submit a vehicle without creating a dealer account.","/sell"],
          ["Vehicle & Mobility Services","Inspection, verification, workshop, RC transfer and other vehicle-life services.","/verify"],
          ["Business Hub","OEM/authorised dealers, pre-owned dealers and automotive partners can register or log in.","/business-hub"],
          ["Rohilla Assistant","Search Rohilla inventory and route automotive requirements through Rohilla-owned logic.","/assistant"],
        ].map(([title,copy,href])=>(
          <a key={title} href={href} style={{display:"block",padding:20,border:"1px solid #d9dee8",borderRadius:18,textDecoration:"none",color:"#111827",background:"white"}}>
            <strong style={{display:"block",fontSize:18,marginBottom:8}}>{title}</strong>
            <span style={{lineHeight:1.5,color:"#4b5563"}}>{copy}</span>
          </a>
        ))}
      </section>

      <section style={{border:"1px solid #d9dee8",borderRadius:20,padding:24,background:"#fff"}}>
        <h2 style={{marginTop:0}}>Official identity & contact</h2>
        <p><strong>Brand:</strong> ROHILLA DRIVE</p>
        <p><strong>Business:</strong> Rohilla Multibrand Cars</p>
        <p><strong>Location:</strong> Ambala City, Haryana, India</p>
        <p><strong>Phone:</strong> <a href="tel:+917015260003">+91 70152 60003</a></p>
        <p><strong>Official website:</strong> <a href={site}>www.rohilladrive.com</a></p>
        <p style={{marginBottom:8}}><strong>Official social profiles:</strong></p>
        <p style={{display:"flex",gap:14,flexWrap:"wrap",marginTop:0}}>
          <a href="https://www.instagram.com/rohillamultibrandcars/" target="_blank" rel="noreferrer">Instagram</a>
          <a href="https://www.facebook.com/profile.php?id=100094277025442" target="_blank" rel="noreferrer">Facebook</a>
          <a href="https://youtube.com/@sumitrohilla983" target="_blank" rel="noreferrer">YouTube</a>
        </p>
        <p style={{color:"#4b5563",lineHeight:1.55,marginBottom:0}}>ROHILLA DRIVE is not a driving school or ride-booking app. It is an automotive vehicle-and-services network. Final price, stock, finance, insurance, service availability and delivery remain subject to the relevant seller or authorised service provider.</p>
      </section>
    </main>
  );
}
