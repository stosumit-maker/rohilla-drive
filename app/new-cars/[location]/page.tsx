import type {Metadata} from "next";
import {notFound} from "next/navigation";
import NewCarLeadForm from "../../components/NewCarLeadForm";
import {buyPath,getMarketLocation,marketLocations,sellPath} from "../../lib/market-locations";

type Params={location:string};

export function generateStaticParams(){return marketLocations.map(x=>({location:x.slug}))}

export async function generateMetadata({params}:{params:Promise<Params>}):Promise<Metadata>{
  const {location}=await params; const loc=getMarketLocation(location); if(!loc)return {};
  const title=`New Cars in ${loc.name} | Price, Dealer & Test Drive Enquiry`;
  const description=`Looking for a new car in ${loc.name}, ${loc.state}? Share brand, model, budget, exchange and finance preferences with ROHILLA DRIVE for relevant participating dealer options where available.`;
  const canonical=`/new-cars/${loc.slug}`;
  return {title,description,alternates:{canonical},openGraph:{title:`New Cars in ${loc.name} | ROHILLA DRIVE`,description,url:canonical,type:"website"},twitter:{card:"summary_large_image",title,description}};
}

export default async function RegionalNewCars({params}:{params:Promise<Params>}){
  const {location}=await params; const loc=getMarketLocation(location); if(!loc)notFound();
  const related=marketLocations.filter(x=>x.region===loc.region&&x.slug!==loc.slug&&!x.hub).slice(0,8);
  const site="https://www.rohilladrive.com"; const canonical=`/new-cars/${loc.slug}`;
  const faq=[
    [`Can I request new-car options in ${loc.name}?`,`Yes. Share the brand/model, budget and timing. ROHILLA DRIVE can coordinate relevant participating authorised dealer options where available.`],
    ["Can I ask for test drive or quotation?","Yes. You can include test-drive, quotation, variant and delivery requirements. Final availability and confirmation come from the relevant authorised dealer."],
    ["Can I ask for finance and exchange together?","Yes. Add both preferences to the request. Finance remains subject to eligibility and the authorised finance provider; exchange value depends on the actual vehicle and seller/dealer assessment."],
    ["Are prices on this page guaranteed?","No. This page does not publish or guarantee a fixed on-road price. Taxes, insurance, registration, dealer offers, accessories and model updates can change the final amount."],
    ["Do I have to pay to submit a new-car requirement?","No payment is required to submit the enquiry form on this page."]
  ];
  const schema={"@context":"https://schema.org","@type":"WebPage","@id":`${site}${canonical}#page`,name:`New Cars in ${loc.name}`,url:`${site}${canonical}`,description:`New-car discovery and authorised dealer assistance request page for ${loc.name}, ${loc.state}.`,isPartOf:{"@id":`${site}/#website`}};
  const faqSchema={"@context":"https://schema.org","@type":"FAQPage",mainEntity:faq.map(([q,a])=>({"@type":"Question",name:q,acceptedAnswer:{"@type":"Answer",text:a}}))};
  return <main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(faqSchema)}}/>
    <section className="hero" style={{paddingTop:52,paddingBottom:52}}><div className="heroText">
      <span>NEW CAR ASSISTANCE • {loc.region.toUpperCase()}</span>
      <h1>New Cars in {loc.name}</h1>
      <p className="heroSub">Model • Quote • Test Drive • Exchange • Finance</p>
      <p>Tell us the new car you want. We’ll help with available options; final stock and price come from the authorised seller.</p>
      <div className="row" style={{marginTop:18}}><a className="call" href="#new-car-enquiry">Send New-Car Request</a><a className="secondary" href={buyPath(loc)}>Used Cars in {loc.name}</a><a className="secondary" href={sellPath(loc)}>Sell Current Car</a></div>
    </div></section>

    <NewCarLeadForm defaultCity={loc.name} locationName={loc.name}/>

    <section className="section compactSection"><div className="head"><div><h2>Tell Us What You Want</h2><p>Share as much or as little as you know.</p></div></div><div className="grid">
      <article className="card"><div className="body"><h3>Brand, model & variant</h3><p>Share the exact model if decided, or only the budget and body type if you are still comparing.</p></div></article>
      <article className="card"><div className="body"><h3>Test drive & delivery timing</h3><p>Add your preferred test-drive or delivery timing. Dealer response and availability can vary.</p></div></article>
      <article className="card"><div className="body"><h3>Exchange & finance</h3><p>Tell us if you have an existing vehicle to exchange and whether finance assistance is needed.</p></div></article>
    </div></section>

    <section className="section"><div className="head"><div><h2>More from Rohilla Drive</h2><p>Used cars, selling and vehicle services.</p></div></div><div className="grid">
      <article className="card"><div className="body"><h3>Used cars</h3><p>Browse current network inventory or save the exact used-car requirement you need.</p><a href={buyPath(loc)}>Used cars in {loc.name} →</a></div></article>
      <article className="card"><div className="body"><h3>Sell / exchange current car</h3><p>Start a seller enquiry or submit full details and private photos.</p><a href={sellPath(loc)}>Sell car in {loc.name} →</a></div></article>
      <article className="card"><div className="body"><h3>Car services</h3><p>Request repair, inspection, detailing, RC/RTO, insurance, finance, roadside and other automotive support.</p><a href={`/car-services/${loc.slug}`}>Car services in {loc.name} →</a></div></article>
    </div></section>

    {related.length>0&&<section className="section"><div className="head"><div><h2>More {loc.region} New-Car Areas</h2></div></div><div className="joinActions">{related.map(x=><a key={x.slug} href={`/new-cars/${x.slug}`}>New cars in {x.name}</a>)}</div></section>}

    <section className="section dark"><div className="about"><h2>New Car Assistance</h2><p>Rohilla Multibrand Cars is based in Ambala City. New-car availability depends on authorised sellers and their service areas.</p><div className="row"><a className="call" href="tel:+917015260003">Call 7015260003</a><a className="call" href="/coverage">All Coverage Areas</a></div></div></section>

    <section className="section"><div className="head"><div><h2>New Cars in {loc.name} — FAQs</h2></div></div><div className="grid">{faq.map(([q,a])=><article className="card" key={q}><div className="body"><h3>{q}</h3><p>{a}</p></div></article>)}</div></section>
  </main>;
}
