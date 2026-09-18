import type {Metadata} from "next";
import {notFound} from "next/navigation";
import ServiceLeadForm from "../../components/ServiceLeadForm";
import {autoServiceIntents} from "../../lib/auto-services";
import {buyPath,getMarketLocation,marketLocations,sellPath} from "../../lib/market-locations";

type Params={location:string};

export function generateStaticParams(){return marketLocations.map(x=>({location:x.slug}))}

export async function generateMetadata({params}:{params:Promise<Params>}):Promise<Metadata>{
  const {location}=await params; const loc=getMarketLocation(location); if(!loc)return {};
  const title=`Car Services in ${loc.name} | Repair, Inspection, RC, Finance & More`;
  const description=`Need car service in ${loc.name}, ${loc.state}? Request workshop repair, inspection, detailing, RC/RTO help, finance, insurance, tyres/battery, roadside assistance and more through ROHILLA DRIVE.`;
  const canonical=`/car-services/${loc.slug}`;
  return {title,description,alternates:{canonical},openGraph:{title:`Car Services in ${loc.name} | ROHILLA DRIVE`,description,url:canonical,type:"website"},twitter:{card:"summary_large_image",title,description}};
}

export default async function CarServicesLocation({params}:{params:Promise<Params>}){
  const {location}=await params; const loc=getMarketLocation(location); if(!loc)notFound();
  const site="https://www.rohilladrive.com";
  const canonical=`/car-services/${loc.slug}`;
  const related=marketLocations.filter(x=>x.region===loc.region&&x.slug!==loc.slug&&!x.hub).slice(0,8);
  const faq=[
    [`What car services can I request in ${loc.name}?`,`You can request workshop repair, inspection, detailing, RC/RTO assistance, finance or insurance assistance, tyres/battery, roadside help, EV support, vehicle logistics, rental and mobility services. Availability depends on participating partners in the service area.`],
    ["Does ROHILLA DRIVE operate its own workshop in every city?","No. Rohilla Multibrand Cars is based in Ambala City. ROHILLA DRIVE is an online coordination platform and may route eligible requests to participating partners where available."],
    ["Can I request car finance or insurance?","Yes, but regulated finance and insurance requests are only routed to appropriately authorised providers. Approval, premium, interest rate and final terms are decided by the relevant provider."],
    ["Can I request RC transfer help?","Yes. RC/RTO assistance can be coordinated where available. Official requirements, fees and outcomes remain subject to the applicable government process and documents."],
    ["Do I have to pay to submit a service request?","No payment is required to submit the enquiry form on this page. Any later service charges must be confirmed with the actual provider before work begins."]
  ];
  const schema={"@context":"https://schema.org","@type":"WebPage","@id":`${site}${canonical}#page`,name:`Car Services in ${loc.name}`,url:`${site}${canonical}`,description:`Automotive service request hub for ${loc.name}, ${loc.state}.`,isPartOf:{"@id":`${site}/#website`}};
  const faqSchema={"@context":"https://schema.org","@type":"FAQPage",mainEntity:faq.map(([q,a])=>({"@type":"Question",name:q,acceptedAnswer:{"@type":"Answer",text:a}}))};
  return <main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(faqSchema)}}/>
    <section className="hero" style={{paddingTop:52,paddingBottom:52}}><div className="heroText">
      <span>AUTOMOTIVE SERVICES • {loc.region.toUpperCase()}</span>
      <h1>Car Services in {loc.name}</h1>
      <p className="heroSub">Repair • Inspection • Detailing • RC/RTO • Finance • Insurance • Roadside • Tyres/Battery</p>
      <p>Send one requirement instead of searching multiple providers. ROHILLA DRIVE can coordinate eligible requests with participating businesses where available. We do not claim a physical branch or workshop in every city.</p>
      <div className="row" style={{marginTop:18}}><a className="call" href="#service-enquiry">Request a Service</a><a className="secondary" href={buyPath(loc)}>Buy / Find a Car</a><a className="secondary" href={sellPath(loc)}>Sell a Car</a></div>
    </div></section>

    <section className="section"><div className="head"><div><h2>Automotive Help Available Through the Network</h2><p>Choose the exact requirement when you submit the form. Partner availability and service area can vary.</p></div></div><div className="grid">
      {autoServiceIntents.map(item=><article className="card" key={item.id}><div className="body"><label>{item.label}</label><h3>{item.label}</h3><p>{item.short}</p><small>Common searches: {item.searchTerms.join(" • ")}</small><p style={{marginTop:12}}><a className="textLink" href={`#service-enquiry`}>Request {item.label} →</a></p></div></article>)}
    </div></section>

    <ServiceLeadForm defaultCity={loc.name} locationName={loc.name}/>

    <section className="section compactSection"><div className="head"><div><h2>Car Support Around {loc.name}</h2><p>{loc.marketNote} Nearby markets include {loc.nearby.join(", ")}.</p></div></div><div className="grid">
      <article className="card"><div className="body"><h3>Buying or selling too?</h3><p>Use the same ROHILLA DRIVE network for used-car buying requirements and seller enquiries.</p><div className="row"><a className="secondary" href={buyPath(loc)}>Find Used Car</a><a className="secondary" href={sellPath(loc)}>Sell Car</a></div></div></article>
      <article className="card"><div className="body"><h3>New car requirement</h3><p>Share brand, model, budget, exchange and finance preferences for relevant new-vehicle options where participating dealers are available.</p><a className="textLink" href={`/new-cars/${loc.slug}`}>New cars in {loc.name} →</a></div></article>
      <article className="card"><div className="body"><h3>Confirm before work starts</h3><p>Check provider identity, scope, estimate, parts, warranty, documents and final price before authorising any work or payment.</p></div></article>
    </div></section>

    {related.length>0&&<section className="section"><div className="head"><div><h2>More {loc.region} Service Areas</h2></div></div><div className="joinActions">{related.map(x=><a key={x.slug} href={`/car-services/${x.slug}`}>Car services in {x.name}</a>)}</div></section>}

    <section className="section dark"><div className="about"><h2>ROHILLA DRIVE Automotive Network</h2><p>Rohilla Multibrand Cars is based in Ambala City. ROHILLA DRIVE expands digital enquiry coverage across Haryana, Chandigarh, nearby Punjab markets and selected Rajasthan markets without pretending to have a branch in every city.</p><div className="row"><a className="call" href="tel:+917015260003">Call 7015260003</a><a className="call" href="/coverage">All Coverage Areas</a></div></div></section>

    <section className="section"><div className="head"><div><h2>Car Services in {loc.name} — FAQs</h2></div></div><div className="grid">{faq.map(([q,a])=><article className="card" key={q}><div className="body"><h3>{q}</h3><p>{a}</p></div></article>)}</div></section>
  </main>;
}
