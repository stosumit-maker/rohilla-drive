import type {Metadata} from "next";
import TrustedAssistForm from "../components/TrustedAssistForm";
import {trustedAssistAudiences} from "../lib/trustedAssistAudiences";

export const metadata:Metadata={
  title:"ROHILLA Trusted Assist | NRI, Defence, Senior & Remote Vehicle Help",
  description:"ROHILLA Trusted Assist coordinates vehicle care for NRI families, defence personnel, senior citizens, outstation owners and busy professionals: service, inspection, battery/tyres, pickup/drop, documents and selling support where available.",
  alternates:{canonical:"/trusted-assist"},
  openGraph:{title:"ROHILLA Trusted Assist | Remote Vehicle Assistance",description:"One contact point for vehicle care when you are abroad, posted away, elderly, busy or unable to manage the vehicle personally.",url:"/trusted-assist",type:"website"},
  twitter:{card:"summary_large_image",title:"ROHILLA Trusted Assist",description:"NRI, defence, senior citizen and outstation vehicle assistance through ROHILLA DRIVE."}
};

const site="https://www.rohilladrive.com";
const services=[
  "Vehicle service / repair coordination",
  "Condition check / inspection",
  "Battery, tyre or breakdown support",
  "Pickup / drop / vehicle movement",
  "RC, insurance and document coordination",
  "Periodic vehicle care while owner is away",
  "Pre-sale preparation and selling support",
  "Family / elderly owner vehicle assistance"
];
const faq:[string,string][]=[
  ["Who is ROHILLA Trusted Assist for?","It is designed for NRI families, defence personnel, senior citizens, outstation owners, busy professionals and families managing a vehicle for someone who cannot handle it in person."],
  ["What can you coordinate?","Depending on location and availability, requests can include inspection, service/repair, battery or tyre help, pickup/drop, vehicle movement, documents, periodic checks and selling support."],
  ["Do you have a branch or workshop in every city?","No. Rohilla Multibrand Cars is based in Ambala City. ROHILLA DRIVE accepts broader regional requests and coordinates with its own team or participating partners where available."],
  ["Will you start work without my approval?","The intended workflow is to contact you, clarify the requirement and confirm the next step. You should confirm the provider, estimate, scope and payment terms before authorising work."],
  ["What if my phone call is missed?","Use WhatsApp or submit the callback form. Your request is saved with your contact details and preferred time so the team can follow up."],
  ["Can this service help with selling a vehicle?","Yes. You can request pre-sale preparation or selling support, and the detailed seller workflow accepts vehicle details and private photos."]
];

export default function TrustedAssist(){
  const serviceSchema={"@context":"https://schema.org","@type":"Service","@id":`${site}/trusted-assist#service`,name:"ROHILLA Trusted Assist",serviceType:"Remote vehicle assistance and coordination",provider:{"@id":`${site}/#organization`},areaServed:[{"@type":"AdministrativeArea","name":"Haryana"},{"@type":"City","name":"Chandigarh"},{"@type":"AdministrativeArea","name":"Punjab"},{"@type":"AdministrativeArea","name":"Rajasthan"}],description:"Vehicle assistance and coordination for NRI families, defence personnel, senior citizens, outstation owners and busy professionals, subject to service-area and partner availability.",url:`${site}/trusted-assist`};
  const faqSchema={"@context":"https://schema.org","@type":"FAQPage",mainEntity:faq.map(([q,a])=>({"@type":"Question",name:q,acceptedAnswer:{"@type":"Answer",text:a}}))};
  return <main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(serviceSchema)}}/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(faqSchema)}}/>
    <section className="hero" style={{paddingTop:52,paddingBottom:52}}><div className="heroText">
      <span>ROHILLA TRUSTED ASSIST • SPECIAL VEHICLE SUPPORT</span>
      <h1>Away from home? Your vehicle still needs someone you can reach.</h1>
      <p className="heroSub">NRI families • Defence personnel • Senior citizens • Outstation owners • Busy professionals</p>
      <p>Tell us what needs to be managed, where the vehicle is, and when we can contact you. ROHILLA DRIVE becomes one enquiry point for eligible vehicle-care coordination instead of making you chase multiple local contacts.</p>
      <div className="row" style={{marginTop:18}}><a className="call" href="#trusted-assist-enquiry">Request Trusted Assist</a><a className="call" href="tel:+917015260003">Call 7015260003</a><a className="secondary" href="https://wa.me/917015260003">WhatsApp</a></div>
    </div></section>

    <section className="section"><div className="head"><div><h2>Built for people who cannot manage the vehicle personally</h2><p>Choose the situation closest to yours. Each page explains the same service in the language people actually search for.</p></div></div><div className="grid">
      {trustedAssistAudiences.map(a=><article className="card" key={a.key}><div className="body"><label>{a.eyebrow}</label><h3>{a.h1}</h3><p>{a.description}</p><a className="textLink" href={a.path}>Open {a.h1} →</a></div></article>)}
    </div></section>

    <section className="section compactSection"><div className="head"><div><h2>What you can request</h2><p>Actual availability depends on the vehicle location, provider availability and the type of work required.</p></div></div><div className="grid">{services.map(x=><article className="card" key={x}><div className="body"><h3>{x}</h3><p>Explain the requirement once. We contact you and coordinate the next step only after confirmation.</p></div></article>)}</div></section>

    <TrustedAssistForm defaultProfile="NRI / family outside India" source="trusted_assist_main"/>

    <section className="section dark"><div className="about"><h2>Call missed? You still have two routes.</h2><p><b>WhatsApp 7015260003</b> or submit the callback form above. The purpose is to make sure a customer who reaches the website does not depend on one phone call only.</p><div className="row"><a className="call" href="https://wa.me/917015260003">WhatsApp Now</a><a className="call" href="#trusted-assist-enquiry">Request Callback</a><a className="secondary" href="/coverage">Coverage Areas</a></div></div></section>

    <section className="section"><div className="head"><div><h2>ROHILLA Trusted Assist — FAQs</h2></div></div><div className="grid">{faq.map(([q,a])=><article className="card" key={q}><div className="body"><h3>{q}</h3><p>{a}</p></div></article>)}</div></section>
  </main>;
}
