import type {Metadata} from "next";
import AmbalaLeadFunnel from "../components/AmbalaLeadFunnel";

export const metadata:Metadata={
  title:"Sell Car in Ambala | Used Car Selling Enquiry",
  description:"Want to sell your car in Ambala? Send ROHILLA DRIVE your car model, expected price and contact details for direct follow-up, or submit full vehicle details and private photos.",
  alternates:{canonical:"/sell-car-ambala"},
  openGraph:{title:"Sell Your Car in Ambala | ROHILLA DRIVE",description:"Send a quick sell-car enquiry in Ambala and continue on WhatsApp, or submit full vehicle details with private photos.",url:"/sell-car-ambala",type:"website"},
  twitter:{card:"summary_large_image",title:"Sell Your Car in Ambala | ROHILLA DRIVE",description:"Quick used-car selling enquiry for Ambala with direct follow-up."}
};

const site="https://www.rohilladrive.com";
const faqs=[
  ["How can I sell my car in Ambala?","Send a quick sell-car requirement on this page for direct follow-up. If you want to provide complete vehicle information and photos immediately, use the detailed Sell / List workflow."],
  ["Can I upload car photos?","Yes. The detailed Sell / List workflow supports private seller photo uploads for review. Seller photos are not published automatically."],
  ["Do I need a dealer account to sell one car?","No. Individual sellers can submit a vehicle without creating a dealer account."],
  ["Does sending an enquiry guarantee a sale or price?","No. Vehicle condition, documentation, inspection, market demand and final transaction terms must be reviewed separately."],
  ["How will I be contacted?","Your enquiry is saved with the contact details you provide. You can continue directly on WhatsApp or call 7015260003."]
];

export default function SellCarAmbala(){
  const faqSchema={"@context":"https://schema.org","@type":"FAQPage",mainEntity:faqs.map(([q,a])=>({"@type":"Question",name:q,acceptedAnswer:{"@type":"Answer",text:a}}))};
  const breadcrumb={"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:"ROHILLA DRIVE",item:site},{"@type":"ListItem",position:2,name:"Ambala",item:`${site}/ambala`},{"@type":"ListItem",position:3,name:"Sell Car in Ambala",item:`${site}/sell-car-ambala`}]};
  const pageSchema={"@context":"https://schema.org","@type":"WebPage","@id":`${site}/sell-car-ambala#page`,name:"Sell Car in Ambala",url:`${site}/sell-car-ambala`,description:"Local sell-car enquiry page for Ambala with direct follow-up and a route to private seller photo submission.",isPartOf:{"@id":`${site}/#website`},about:{"@id":`${site}/ambala#autodealer`}};

  return <main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(pageSchema)}}/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(faqSchema)}}/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(breadcrumb)}}/>
    <section className="hero" style={{paddingTop:52,paddingBottom:52}}><div className="heroText">
      <span>SELL USED CAR • AMBALA CITY</span>
      <h1>Sell Your Car in Ambala</h1>
      <p className="heroSub">Quick enquiry • Direct follow-up • Private photo option</p>
      <p>Share your car, expected price and contact details. We’ll follow up.</p>
      <div className="row" style={{marginTop:18}}><a className="call" href="#ambala-enquiry">Request a Callback</a><a className="call" href="/sell">Add Details & Photos</a><a className="secondary" href="tel:+917015260003">Call 7015260003</a></div>
    </div></section>
    <AmbalaLeadFunnel source="sell_car_ambala" defaultMode="sell"/>
    <section className="section compactSection"><div className="head"><div><h2>Choose How to Start</h2><p>Request a callback or send full vehicle details.</p></div></div><div className="grid">
      <article className="card"><div className="body"><h3>Quick callback request</h3><p>Enter your car, expected price, location and mobile number. The request is saved before WhatsApp opens.</p><a className="textLink" href="#ambala-enquiry">Send quick enquiry →</a></div></article>
      <article className="card"><div className="body"><h3>Full vehicle submission</h3><p>Add detailed vehicle information and private photos for review without creating a dealer account.</p><a className="textLink" href="/sell">Submit vehicle & photos →</a></div></article>
      <article className="card"><div className="body"><h3>Direct contact</h3><p>If you prefer to speak first, call or WhatsApp ROHILLA DRIVE on 7015260003.</p><a className="textLink" href="https://wa.me/917015260003">WhatsApp →</a></div></article>
    </div></section>
    <section className="section dark"><div className="about"><h2>Before You Sell</h2><p>Submitting a request does not guarantee purchase or a fixed valuation. Final price and transaction terms depend on the actual vehicle, condition, documentation, inspection and market demand.</p><div className="row"><a className="call" href="/used-cars-ambala">Used Cars in Ambala</a><a className="call" href="/find-car-ambala">Find a Car</a><a className="call" href="/ambala">Ambala Vehicle Hub</a></div></div></section>
    <section className="section"><div className="head"><div><h2>Sell Car in Ambala — FAQs</h2></div></div><div className="grid">{faqs.map(([q,a])=><article className="card" key={q}><div className="body"><h3>{q}</h3><p>{a}</p></div></article>)}</div></section>
  </main>;
}
