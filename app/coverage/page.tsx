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
      <span>REGIONAL VEHICLE ENQUIRY NETWORK</span>
      <h1>ROHILLA DRIVE Coverage Areas</h1>
      <p className="heroSub">Haryana • Chandigarh • Nearby Punjab • Rajasthan growth markets</p>
      <p>Rohilla Multibrand Cars is based in Ambala City. ROHILLA DRIVE uses its online platform to accept genuine vehicle buying and selling requirements across a wider regional network. A coverage page does not mean there is a physical branch in every city.</p>
      <div className="row" style={{marginTop:18}}><a className="call" href="/find-car-ambala">Send a Buyer Requirement</a><a className="call" href="/sell-car-ambala">Sell a Car</a><a className="secondary" href="/inventory">Live Inventory</a></div>
    </div></section>

    {regions.map(region=>{const rows=marketLocations.filter(x=>x.region===region);return <section className="section" key={region}>
      <div className="head"><div><h2>{region}</h2><p>{region==="Haryana"?"All Haryana districts are included in the regional buyer/seller enquiry coverage.":region==="Chandigarh"?"Chandigarh and the tri-city corridor connect naturally with Ambala, Panchkula, Mohali and Zirakpur.":region==="Punjab"?"Initial Punjab focus is on Chandigarh-adjacent and Ambala-connected markets.":"Initial Rajasthan focus is on Haryana-border and major north Rajasthan markets."}</p></div></div>
      <div className="grid">{rows.map(loc=><article className="card" key={loc.slug}><div className="body"><label>{loc.state}</label><h3>{loc.name}</h3><p>{loc.marketNote}</p><div className="row"><a className="secondary" href={buyPath(loc)}>Buy / Find Car</a><a className="secondary" href={sellPath(loc)}>Sell Car</a></div></div></article>)}</div>
    </section>})}

    <section className="section dark"><div className="about"><h2>One Lead System, Multiple Markets</h2><p>Buyer and seller forms save the customer requirement before continuing to WhatsApp. This lets ROHILLA DRIVE measure which locations and channels are actually producing genuine enquiries without paying for advertising first.</p><p><b>Phone / WhatsApp:</b> 7015260003</p></div></section>
  </main>;
}
