import type {Metadata} from "next";
import AmbalaLeadFunnel from "../components/AmbalaLeadFunnel";

export const metadata:Metadata={
  title:"Find Used Car in Ambala | Tell Us Your Budget",
  description:"Looking for a used car in Ambala? Tell ROHILLA DRIVE the model, budget and purchase timing. Save your requirement for direct follow-up even when the exact car is not currently listed.",
  alternates:{canonical:"/find-car-ambala"},
  openGraph:{title:"Find a Used Car in Ambala | ROHILLA DRIVE",description:"Tell us the car and budget you need in Ambala. Your requirement is saved for direct follow-up.",url:"/find-car-ambala",type:"website"},
  twitter:{card:"summary_large_image",title:"Find a Used Car in Ambala | ROHILLA DRIVE",description:"Share your preferred car, budget and timing for direct follow-up in Ambala."}
};

const site="https://www.rohilladrive.com";
const faqs=[
  ["What if the car I want is not listed?","Send the model, budget and purchase timing on this page. ROHILLA DRIVE saves the requirement so the team can follow up with suitable options when available."],
  ["Can I request a particular model or variant?","Yes. Mention the exact model or variant you prefer. You can also give only a budget if you are open to suggestions."],
  ["Do I have to pay to send a car requirement?","No. Sending a buyer enquiry through this page does not require payment."],
  ["Can I also sell my current car?","Yes. Switch the form to I Want to Sell for a quick callback request, or use the Sell / List page to submit full details and private vehicle photos."],
  ["How will ROHILLA DRIVE contact me?","Your requirement is saved with the contact details you provide. You can also continue directly on WhatsApp or call 7015260003."]
];

export default function FindCarAmbala(){
  const faqSchema={"@context":"https://schema.org","@type":"FAQPage",mainEntity:faqs.map(([q,a])=>({"@type":"Question",name:q,acceptedAnswer:{"@type":"Answer",text:a}}))};
  const breadcrumb={"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:"ROHILLA DRIVE",item:site},{"@type":"ListItem",position:2,name:"Ambala",item:`${site}/ambala`},{"@type":"ListItem",position:3,name:"Find a Car in Ambala",item:`${site}/find-car-ambala`}]};
  const pageSchema={"@context":"https://schema.org","@type":"WebPage","@id":`${site}/find-car-ambala#page`,name:"Find a Used Car in Ambala",url:`${site}/find-car-ambala`,description:"Buyer requirement page for used cars in Ambala, allowing customers to share model, budget and timing for direct follow-up.",isPartOf:{"@id":`${site}/#website`},about:{"@id":`${site}/ambala#autodealer`}};

  return <main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(pageSchema)}}/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(faqSchema)}}/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(breadcrumb)}}/>

    <section className="hero" style={{paddingTop:52,paddingBottom:52}}><div className="heroText">
      <span>USED CAR BUYER • AMBALA CITY</span>
      <h1>Find a Car in Ambala</h1>
      <p className="heroSub">Tell us the model, budget and timing.</p>
      <p>If it’s not in current stock, send your requirement and we’ll follow up.</p>
      <div className="row" style={{marginTop:18}}><a className="call" href="#ambala-enquiry">Send Requirement</a><a className="secondary" href="/used-cars-ambala">Browse Cars</a><a className="secondary" href="tel:+917015260003">Call Now</a></div>
    </div></section>

    <AmbalaLeadFunnel source="find_car_ambala" defaultMode="buy"/>

    <section className="section compactSection"><div className="head"><div><h2>How It Works</h2><p>Tell us what you need and we’ll follow up.</p></div></div><div className="grid">
      <article className="card"><div className="body"><h3>Exact car requirement</h3><p>Tell us the exact model or variant.</p></div></article>
      <article className="card"><div className="body"><h3>Budget-first search</h3><p>Share your budget if you are open to options.</p></div></article>
      <article className="card"><div className="body"><h3>Buyer or seller</h3><p>You can also switch the form to sell your current car.</p></div></article>
    </div></section>

    <section className="section dark"><div className="about"><h2>ROHILLA DRIVE • Ambala City</h2><p>Used cars, selling and vehicle assistance.</p><div className="row"><a className="call" href="/ambala">Ambala Vehicle Hub</a><a className="call" href="/sell">Sell Your Car</a><a className="call" href="https://wa.me/917015260003">WhatsApp</a></div></div></section>

    <section className="section"><div className="head"><div><h2>Find a Used Car in Ambala — FAQs</h2></div></div><div className="grid">{faqs.map(([q,a])=><article className="card" key={q}><div className="body"><h3>{q}</h3><p>{a}</p></div></article>)}</div></section>
  </main>;
}
