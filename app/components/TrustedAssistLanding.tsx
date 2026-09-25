import TrustedAssistForm from "./TrustedAssistForm";
import type {TrustedAssistAudience} from "../lib/trustedAssistAudiences";

export default function TrustedAssistLanding({audience}:{audience:TrustedAssistAudience}){
  const site="https://www.rohilladrive.com";
  const pageSchema={"@context":"https://schema.org","@type":"WebPage","@id":`${site}${audience.path}#page`,name:audience.h1,url:`${site}${audience.path}`,description:audience.description,isPartOf:{"@id":`${site}/#website`},about:{"@id":`${site}/trusted-assist#service`}};
  const faqSchema={"@context":"https://schema.org","@type":"FAQPage",mainEntity:audience.faq.map(([q,a])=>({"@type":"Question",name:q,acceptedAnswer:{"@type":"Answer",text:a}}))};
  return <main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(pageSchema)}}/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(faqSchema)}}/>
    <section className="hero" style={{paddingTop:52,paddingBottom:52}}><div className="heroText">
      <span>{audience.eyebrow}</span>
      <h1>{audience.h1}</h1>
      <p className="heroSub">Simple, coordinated help for your vehicle.</p>
      <p>{audience.intro}</p>
      <div className="row" style={{marginTop:18}}>
        <a className="call" href="#trusted-assist-enquiry">Request Trusted Assist</a>
        <a className="call" href="tel:+917015260003">Call 7015260003</a>
        <a className="call secondary" href="https://wa.me/917015260003">WhatsApp</a>
      </div>
    </div></section>

    <section className="section"><div className="head"><div><h2>How We Can Help</h2><p>Choose the support you need for the vehicle.</p></div></div><div className="grid">
      {audience.situations.map(x=><article className="card" key={x}><div className="body"><h3>{x}</h3><p>Share the details once. We’ll help coordinate the next step.</p></div></article>)}
    </div></section>

    <TrustedAssistForm defaultProfile={audience.defaultProfile} source={`trusted_assist_${audience.key}`}/>


    <section className="section dark trustedAssistSummary"><div className="about">
      <h2>Trusted Vehicle Assistance</h2>
      <p>One point of contact for service, inspection, pickup/drop, documents and vehicle sale support.</p>
      <p>Based in Ambala City. Assistance in other locations is subject to availability.</p>
      <div className="row"><a className="call" href="/trusted-assist">Trusted Assist Overview</a><a className="call" href="/coverage">Coverage Areas</a><a className="call secondary" href="/sell-car-ambala">Sell Your Car</a></div>
    </div></section>

    <section className="section trustedAssistFaq"><div className="head"><div><h2>Frequently Asked Questions</h2></div></div><div className="grid">
      {audience.faq.map(([q,a])=><article className="card" key={q}><div className="body"><h3>{q}</h3><p>{a}</p></div></article>)}
    </div></section>
  </main>;
}
