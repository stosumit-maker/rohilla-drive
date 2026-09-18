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
      <p className="heroSub">Away from the vehicle? One request. One contact point. Clear confirmation before work proceeds.</p>
      <p>{audience.intro}</p>
      <div className="row" style={{marginTop:18}}>
        <a className="call" href="#trusted-assist-enquiry">Request Trusted Assist</a>
        <a className="call" href="tel:+917015260003">Call 7015260003</a>
        <a className="secondary" href="https://wa.me/917015260003">WhatsApp</a>
      </div>
    </div></section>

    <section className="section"><div className="head"><div><h2>When ROHILLA Trusted Assist can help</h2><p>This service is designed for situations where the owner or family cannot conveniently manage the vehicle in person.</p></div></div><div className="grid">
      {audience.situations.map(x=><article className="card" key={x}><div className="body"><h3>{x}</h3><p>Submit the request, vehicle location and preferred contact time. The next step depends on local availability and your confirmation.</p></div></article>)}
    </div></section>

    <TrustedAssistForm defaultProfile={audience.defaultProfile} source={`trusted_assist_${audience.key}`}/>

    <section className="section compactSection"><div className="head"><div><h2>Search terms this service is built around</h2><p>These phrases describe real customer needs that ROHILLA Trusted Assist is intended to address.</p></div></div><div className="joinActions">{audience.searchPhrases.map(x=><span key={x} style={{padding:"10px 14px",border:"1px solid #d9dee8",borderRadius:999,background:"#fff",fontWeight:800}}>{x}</span>)}</div></section>

    <section className="section dark"><div className="about">
      <h2>ROHILLA Trusted Assist</h2>
      <p>For NRI families, defence personnel, senior citizens, outstation owners, busy professionals and families managing a vehicle on someone else’s behalf.</p>
      <p>Rohilla Multibrand Cars is based in Ambala City. Broader support depends on the vehicle location and participating partner availability. ROHILLA DRIVE does not claim a physical office or workshop in every city.</p>
      <div className="row"><a className="call" href="/trusted-assist">Trusted Assist Overview</a><a className="call" href="/coverage">Coverage Areas</a><a className="secondary" href="/sell">Sell a Vehicle</a></div>
    </div></section>

    <section className="section"><div className="head"><div><h2>{audience.h1} — FAQs</h2></div></div><div className="grid">
      {audience.faq.map(([q,a])=><article className="card" key={q}><div className="body"><h3>{q}</h3><p>{a}</p></div></article>)}
    </div></section>
  </main>;
}
