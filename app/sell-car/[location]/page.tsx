import type {Metadata} from "next";
import {notFound} from "next/navigation";
import AmbalaLeadFunnel from "../../components/AmbalaLeadFunnel";
import {buyPath,getMarketLocation,marketLocations,sellPath} from "../../lib/market-locations";

type Params={location:string};

export function generateStaticParams(){
  return marketLocations.filter(x=>!x.legacySellPath).map(x=>({location:x.slug}));
}

export async function generateMetadata({params}:{params:Promise<Params>}):Promise<Metadata>{
  const {location}=await params;
  const loc=getMarketLocation(location);
  if(!loc)return {};
  const title=`Sell Car in ${loc.name} | Used Car Selling Enquiry`;
  const description=`Want to sell your car in ${loc.name}, ${loc.state}? Send ROHILLA DRIVE your model, expected price and contact details for direct follow-up, or submit full details and private photos.`;
  const canonical=sellPath(loc);
  return {title,description,alternates:{canonical},openGraph:{title:`Sell Your Car in ${loc.name} | ROHILLA DRIVE`,description,url:canonical,type:"website"},twitter:{card:"summary_large_image",title,description}};
}

export default async function RegionalSellCar({params}:{params:Promise<Params>}){
  const {location}=await params;
  const loc=getMarketLocation(location);
  if(!loc||loc.legacySellPath)notFound();
  const site="https://www.rohilladrive.com";
  const canonical=sellPath(loc);
  const related=marketLocations.filter(x=>x.region===loc.region&&x.slug!==loc.slug&&!x.hub).slice(0,8);
  const faqs=[
    [`How can I sell my car in ${loc.name}?`,`Use the quick sell-car enquiry on this page or submit complete vehicle details and private photos through the detailed seller workflow.`],
    ["Do I need a dealer account?","No. An individual seller can submit one vehicle without creating a dealer account."],
    ["Are my uploaded photos public?","Detailed seller submissions use private photos for review. They are not published automatically."],
    ["Is the selling price guaranteed?","No. Final valuation and transaction terms depend on the actual vehicle, condition, documents, inspection and market demand."],
    ["Can I also buy another car?","Yes. Use the regional used-car page to browse current inventory or save your exact model and budget requirement."]
  ];
  const pageSchema={"@context":"https://schema.org","@type":"WebPage","@id":`${site}${canonical}#page`,name:`Sell Car in ${loc.name}`,url:`${site}${canonical}`,description:`Used-car seller enquiry page for ${loc.name}, ${loc.state}.`,isPartOf:{"@id":`${site}/#website`}};
  const faqSchema={"@context":"https://schema.org","@type":"FAQPage",mainEntity:faqs.map(([q,a])=>({"@type":"Question",name:q,acceptedAnswer:{"@type":"Answer",text:a}}))};

  return <main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(pageSchema)}}/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(faqSchema)}}/>
    <section className="hero" style={{paddingTop:52,paddingBottom:52}}><div className="heroText">
      <span>SELL USED CAR • {loc.region.toUpperCase()}</span>
      <h1>Sell Your Car in {loc.name}</h1>
      <p className="heroSub">Quick callback • Direct WhatsApp • Private photo submission</p>
      <p>{loc.marketNote} Start with a simple sell-car request, or submit complete vehicle details and photos for review. ROHILLA DRIVE does not promise a fixed valuation before the vehicle and documents are reviewed.</p>
      <div className="row" style={{marginTop:18}}><a className="call" href="#ambala-enquiry">Get a Sell-Car Callback</a><a className="call" href="/sell">Submit Full Details & Photos</a><a className="secondary" href={buyPath(loc)}>Buy Used Cars in {loc.name}</a></div>
    </div></section>

    <AmbalaLeadFunnel source={`regional_sell_${loc.slug}`} defaultMode="sell" defaultCity={loc.name} locationName={loc.name}/>

    <section className="section compactSection"><div className="head"><div><h2>How the {loc.name} Seller Enquiry Works</h2><p>Use the shortest route that suits you. Your quick request is saved before WhatsApp opens.</p></div></div><div className="grid">
      <article className="card"><div className="body"><h3>1. Send basic car details</h3><p>Share the car/model, year, expected price and your city so the team has a clear starting point.</p></div></article>
      <article className="card"><div className="body"><h3>2. Add private photos if ready</h3><p>The detailed seller workflow lets you add private vehicle photos for review without making them public automatically.</p><a href="/sell">Open detailed seller submission →</a></div></article>
      <article className="card"><div className="body"><h3>3. Confirm valuation and terms</h3><p>Final price depends on inspection, documentation, actual condition and market demand. Confirm all terms before handing over the vehicle or documents.</p></div></article>
    </div></section>

    <section className="section"><div className="head"><div><h2>{loc.name} and Nearby Seller Coverage</h2><p>Nearby markets include {loc.nearby.join(", ")}. ROHILLA DRIVE is based in Ambala City and uses this online workflow to accept genuine requirements as its network expands.</p></div></div>{related.length>0&&<div className="joinActions">{related.map(x=><a key={x.slug} href={sellPath(x)}>Sell car in {x.name}</a>)}</div>}</section>

    <section className="section dark"><div className="about"><h2>Need to Speak First?</h2><p>Call or WhatsApp 7015260003. No payment is required to submit a sell-car enquiry through this page.</p><div className="row"><a className="call" href="tel:+917015260003">Call 7015260003</a><a className="call" href="/coverage">All Coverage Areas</a></div></div></section>

    <section className="section"><div className="head"><div><h2>Sell Car in {loc.name} — FAQs</h2></div></div><div className="grid">{faqs.map(([q,a])=><article className="card" key={q}><div className="body"><h3>{q}</h3><p>{a}</p></div></article>)}</div></section>
  </main>;
}
