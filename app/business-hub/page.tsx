export const metadata={title:"Rohilla Business Hub",description:"Join the Rohilla Drive automotive business network as an OEM/authorised new vehicle dealer, pre-owned dealer, workshop, inspector, finance/insurance professional, mobility operator, recycler or other automotive business.",alternates:{canonical:"/business-hub"},openGraph:{url:"/business-hub",title:"Rohilla Business Hub | ROHILLA DRIVE",description:"OEM/new-vehicle dealership, pre-owned, service, mobility and automotive business network."}};

const businessTypes=[
 ["OEM / Authorised New Vehicle Dealer","OEM dealership, authorised showroom or sales team: receive structured new-vehicle demand, quote/test-drive opportunities and multi-brand customer routing.","/dealer"],
 ["Pre-Owned / Used Vehicle Dealer","Regular inventory, dealer submissions, sourcing, finance/margin/RC tools and Rohilla Intelligence growth workflows.","/dealer"],
 ["Workshop / Repairs / Detailing","Receive assigned jobs, manage work status and build a verified service profile.","/partner"],
 ["Inspection / Verification","Vehicle inspection and verification assignments through the Rohilla network.","/partner"],
 ["Finance / Insurance / RC-RTO","Qualified customer requirements with controlled handoff and workflow tracking.","/partner"],
 ["Taxi / Self-Drive / Chauffeur / Fleet","Mobility and corporate/fleet requirements routed through one business network.","/partner"],
 ["Commercial / Transport / Logistics","Commercial vehicle, delivery, fleet and transporter opportunities.","/partner"],
 ["EV / Tyres / Battery / RSA","Future mobility, roadside and vehicle-support services.","/partner"],
 ["RVSF / Recycler / Scrap Buyer","Responsible end-of-life vehicle and recycler quote opportunities.","/partner"],
 ["Multilingual / Cross-State Business","Serve customers across language and state boundaries using Rohilla Language Bridge and translated communication tools.","/partner/language"],
 ["Other Automotive Business","If your business touches the vehicle lifecycle, apply and let Rohilla Drive classify the right workflow.","/partner"]
];

export default function BusinessHub(){return <main>
 <header><div className="brand"><b>ROHILLA DRIVE</b><small>ROHILLA BUSINESS HUB</small></div><div className="row"><a className="call" href="/">Customer Website</a><a className="call" href="/new-vehicles">New Vehicle Assistance</a><a className="call" href="/language-assist">Language Bridge</a></div></header>
 <section className="hero"><div className="heroText"><span>B2B AUTOMOTIVE NETWORK</span><h1>Do business with Rohilla Drive — not just list on it.</h1><p>OEM/authorised new vehicle dealer, pre-owned dealer, workshop, inspector, finance/insurance professional, mobility operator, transporter, RVSF or another automotive business: choose the role that matches your work and enter the right portal.</p><p><b>One network. Every vehicle. Every language.</b></p></div></section>
 <section className="section"><div className="grid">{businessTypes.map(([name,desc,href])=><article className="application" key={name}><h2>{name}</h2><p>{desc}</p><a className="call" href={href}>View / Join →</a></article>)}</div></section>
 <section className="section dark"><div className="about"><h2>One network, separate permissions.</h2><p>Customers do not need a Dealer account to buy, sell or request a service. OEM/new-vehicle and pre-owned dealers get dealer workflows. Service and mobility businesses get Business Hub workflows. Rohilla Drive Admin remains the network control layer.</p><p>Advanced marketing automation, multilingual communication, social publishing, Google Ads control and Rohilla Intelligence only activate for accounts and channels that are officially connected and authorised.</p></div></section>
 </main>}
