import type {Metadata} from "next";
import {buyPath,marketLocations,sellPath} from "../lib/market-locations";

export const metadata:Metadata={
  title:"ROHILLA DRIVE Coverage | Haryana, Chandigarh, Punjab & Rajasthan",
  description:"Explore ROHILLA DRIVE used-car buyer and seller enquiry coverage across every Haryana district, Chandigarh, nearby Punjab markets and selected Rajasthan markets.",
  alternates:{canonical:"/coverage"}
};

const regions=["Haryana","Chandigarh","Punjab","Rajasthan"] as const;

export default function Coverage(){
  return <main>
    <section className="hero" style={{paddingTop:52,paddingBottom:52}}><div className="heroText">
      <span>COVERAGE AREAS</span>
      <h1>ROHILLA DRIVE Coverage Areas</h1>
      <p className="heroSub">Haryana • Chandigarh • Nearby Punjab • Rajasthan growth markets</p>
      <p>Rohilla Multibrand Cars is based in Ambala City. Online enquiries are accepted in the areas listed below; this does not mean we have a physical branch in every city.</p>
      <div className="row" style={{marginTop:18}}><a className="call" href="/find-car-ambala">Send a Buyer Requirement</a><a className="call" href="/sell-car-ambala">Sell a Car</a><a className="secondary" href="/inventory">Live Inventory</a></div>
    </div></section>

    {regions.map(region=>{const rows=marketLocations.filter(x=>x.region===region);return <section className="section" key={region}>
      <div className="head"><div><h2>{region}</h2><p>{region==="Haryana"?"All Haryana districts are included in the regional buyer/seller enquiry coverage.":region==="Chandigarh"?"Chandigarh and the tri-city corridor connect naturally with Ambala, Panchkula, Mohali and Zirakpur.":region==="Punjab"?"Initial Punjab focus is on Chandigarh-adjacent and Ambala-connected markets.":"Initial Rajasthan focus is on Haryana-border and major north Rajasthan markets."}</p></div></div>
      <div className="grid">{rows.map(loc=><article className="card" key={loc.slug}><div className="body"><label>{loc.state}</label><h3>{loc.name}</h3><p>{loc.marketNote}</p><div className="row"><a className="secondary" href={buyPath(loc)}>Buy / Find Car</a><a className="secondary" href={sellPath(loc)}>Sell Car</a><a className="secondary" href={`/new-cars/${loc.slug}`}>New Cars</a><a className="secondary" href={`/car-services/${loc.slug}`}>Car Services</a></div></div></article>)}</div>
    </section>})}

    <section className="section dark"><div className="about"><h2>Need Help in Another City?</h2><p>Call or WhatsApp us with the car and location you need.</p><p><b>Phone / WhatsApp:</b> 7015260003</p></div></section>
  </main>;
}
