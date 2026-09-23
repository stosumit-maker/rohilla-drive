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
      <p className="heroSub">Vehicle help when you cannot manage it in person.</p>
      <p>{audience.intro}</p>
      <div className="row" style={{marginTop:18}}>
        <a className="call" href="#trusted-assist-enquiry">Request Trusted Assist</a>
        <a className="call" href="tel:+917015260003">Call 7015260003</a>
        <a className="secondary" href="https://wa.me/917015260003">WhatsApp</a>
      </div>
    </div></section>

    <section className="section"><div className="head"><div><h2>When ROHILLA Trusted Assist can help</h2><p>For owners or families who cannot manage the vehicle in person.</p></div></div><div className="grid">
      {audience.situations.map(x=><article className="card" key={x}><div className="body"><h3>{x}</h3><p>Submit the request, vehicle location and preferred contact time. The next step depends on local availability and your confirmation.</p></div></article>)}
    </div></section>

    <TrustedAssistForm defaultProfile={audience.defaultProfile} source={`trusted_assist_${audience.key}`}/>


    <section className="section dark"><div className="about">
      <h2>ROHILLA Trusted Assist</h2>
      <p>For NRI families, defence personnel, senior citizens, outstation owners, busy professionals and families managing a vehicle on someone else’s behalf.</p>
      <p>Based in Ambala City. Support outside Ambala depends on vehicle location and service availability.</p>
      <div className="row"><a className="call" href="/trusted-assist">Trusted Assist Overview</a><a className="call" href="/coverage">Coverage Areas</a><a className="secondary" href="/sell">Sell a Vehicle</a></div>
    </div></section>

    <section className="section"><div className="head"><div><h2>{audience.h1} — FAQs</h2></div></div><div className="grid">
      {audience.faq.map(([q,a])=><article className="card" key={q}><div className="body"><h3>{q}</h3><p>{a}</p></div></article>)}
    </div></section>
  </main>;
}
