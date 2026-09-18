import type {Metadata} from "next";
import AmbalaLeadFunnel from "../components/AmbalaLeadFunnel";

export const metadata:Metadata={
  title:"Used Car Dealer in Ambala | Buy, Sell & Vehicle Services",
  description:"ROHILLA DRIVE by Rohilla Multibrand Cars in Ambala City: used and second hand cars, car selling, new-vehicle assistance, verification, RC support and connected automotive services.",
  alternates:{canonical:"/ambala"},
  openGraph:{title:"ROHILLA DRIVE Ambala | Cars & Automotive Services",description:"Buy or sell vehicles and access automotive assistance through Rohilla Multibrand Cars in Ambala City.",url:"/ambala",type:"website"},
  twitter:{card:"summary_large_image",title:"ROHILLA DRIVE Ambala",description:"Used cars, vehicle selling, verification and automotive assistance in Ambala City."}
};

const site="https://www.rohilladrive.com";
const phone="+91-7015260003";
const services=[
  ["Used Cars in Ambala","Browse current second hand and pre-owned cars with published prices, photos and vehicle details.","/used-cars-ambala"],
  ["Find a Car for Me","Share your preferred model, budget and timing. ROHILLA DRIVE saves the requirement for direct follow-up.","/find-car-ambala"],
  ["Sell Your Car","Submit vehicle details and private photos for review. Individual sellers do not need a dealer account.","/sell"],
  ["New Vehicle Assistance","Share your model, variant, budget and city requirement for new-vehicle assistance.","/new-vehicles"],
  ["Vehicle Verification","Use ROHILLA DRIVE verification workflows for supported vehicle checks and documentation coordination.","/verify"],
  ["Automotive Services","Request inspection, workshop, RC/RTO assistance, detailing, roadside help and other supported services through the network.","/#services"],
  ["Business & Dealer Network","Dealers, workshops and automotive service businesses can create the correct business account directly.","/business-hub"]
];
const faqs=[
  ["Is ROHILLA DRIVE based in Ambala?","Yes. ROHILLA DRIVE is the digital vehicle and mobility platform of Rohilla Multibrand Cars, based in Ambala City, Haryana."],
  ["Can I buy a second hand car in Ambala through ROHILLA DRIVE?","Yes. Published inventory can be browsed online. Each vehicle page shows the details currently available and provides an enquiry route for follow-up."],
  ["Can I sell my used car in Ambala?","Yes. The Sell / List workflow lets an individual seller submit vehicle details and private photos for review."],
  ["Do you provide car services in Ambala?","ROHILLA DRIVE coordinates supported automotive services through its network, including categories such as inspection, workshop, detailing, roadside assistance and RC/RTO assistance."],
  ["How can I contact ROHILLA DRIVE in Ambala?",`Call or WhatsApp ${phone}, or use the enquiry forms on rohilladrive.com.`]
];

export default function AmbalaHub(){
  const autoDealer={
    "@context":"https://schema.org",
    "@type":["AutoDealer","AutomotiveBusiness"],
    "@id":`${site}/ambala#autodealer`,
    name:"ROHILLA DRIVE by Rohilla Multibrand Cars",
    alternateName:["Rohilla Multibrand Cars","ROHILLA DRIVE Ambala"],
    url:`${site}/ambala`,
    telephone:phone,
    description:"Vehicle sales, selling assistance, verification and connected automotive services in Ambala City, Haryana.",
    address:{"@type":"PostalAddress",addressLocality:"Ambala City",addressRegion:"Haryana",addressCountry:"IN"},
    areaServed:[{"@type":"City",name:"Ambala"},{"@type":"AdministrativeArea",name:"Haryana"}],
    parentOrganization:{"@id":`${site}/#organization`},
    sameAs:["https://www.instagram.com/rohillamultibrandcars/","https://www.facebook.com/profile.php?id=100094277025442","https://youtube.com/@sumitrohilla983"]
  };
  const faqSchema={"@context":"https://schema.org","@type":"FAQPage",mainEntity:faqs.map(([q,a])=>({"@type":"Question",name:q,acceptedAnswer:{"@type":"Answer",text:a}}))};
  const breadcrumb={"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:"ROHILLA DRIVE",item:site},{"@type":"ListItem",position:2,name:"Ambala",item:`${site}/ambala`} ]};
  return <main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(autoDealer)}}/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(faqSchema)}}/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(breadcrumb)}}/>

    <section className="hero" style={{paddingTop:52,paddingBottom:52}}><div className="heroText">
      <span>ROHILLA DRIVE • AMBALA CITY, HARYANA</span>
      <h1>Used Car Dealer in Ambala — Buy, Sell & Vehicle Services</h1>
      <p className="heroSub">Buy • Sell • Verify • New Vehicles • Automotive Services</p>
      <p>ROHILLA DRIVE by Rohilla Multibrand Cars connects customers in Ambala with current used-car inventory, vehicle selling, new-vehicle assistance, verification and supported automotive services through one platform.</p>
      <div className="row" style={{marginTop:18}}><a className="call" href="/find-car-ambala">Find My Car</a><a className="call" href="/used-cars-ambala">Used Cars in Ambala</a><a className="call" href="/sell">Sell Your Car</a><a className="secondary" href="/inventory">Browse Inventory</a></div>
    </div></section>

    <AmbalaLeadFunnel source="ambala_hub" defaultMode="buy"/>

    <section className="section"><div className="head"><div><h2>Automotive Help in Ambala — One Connected Platform</h2><p>Choose the task you need and go directly to the correct workflow.</p></div></div><div className="grid">{services.map(([title,text,href])=><article className="card" key={title}><div className="body"><h2 style={{fontSize:22}}>{title}</h2><p>{text}</p><a className="textLink" href={href}>Open →</a></div></article>)}</div></section>

    <section className="section compactSection"><div className="head"><div><h2>Why ROHILLA DRIVE is Useful for Ambala Customers</h2></div></div><div className="grid">
      <article className="card"><div className="body"><h3>Live published inventory</h3><p>Used vehicles appear from the production inventory rather than a static catalogue. Sold or unpublished vehicles do not stay presented as available inventory.</p></div></article>
      <article className="card"><div className="body"><h3>Direct enquiry tracking</h3><p>Vehicle enquiries are recorded before the WhatsApp handoff so the selected vehicle and enquiry source can be followed up properly.</p></div></article>
      <article className="card"><div className="body"><h3>Private seller photos</h3><p>Seller-submitted vehicle photos remain private for review and are not made public automatically.</p></div></article>
      <article className="card"><div className="body"><h3>Verified partner workflow</h3><p>Service-partner access is approval-controlled, with private KYC documents and structured service operations for supported partner categories.</p></div></article>
    </div></section>

    <section className="section dark"><div className="about"><h2>Rohilla Multibrand Cars, Ambala City</h2><p>ROHILLA DRIVE is the online customer and business platform operated for Rohilla Multibrand Cars. The platform is designed around Ambala operations while supporting vehicle requirements and network workflows beyond the city as the business grows.</p><p><b>Phone / WhatsApp:</b> {phone}</p><div className="row"><a className="call" href="/used-cars-ambala">Second Hand Cars in Ambala</a><a className="call" href="/new-vehicles">New Vehicle Assistance</a><a className="call" href="/business-hub">Business Hub</a></div></div></section>

    <section className="section"><div className="head"><div><h2>ROHILLA DRIVE Ambala — FAQs</h2></div></div><div className="grid">{faqs.map(([q,a])=><article className="card" key={q}><div className="body"><h3>{q}</h3><p>{a}</p></div></article>)}</div></section>
  </main>;
}
