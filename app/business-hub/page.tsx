export const metadata={title:"Rohilla Business Hub",description:"Join the Rohilla Drive automotive business network as a dealer, workshop, inspector, finance/insurance professional, mobility operator, recycler or other automotive business."};

const businessTypes=[
 ["Vehicle Dealer / Pre-Owned","Regular inventory, dealer submissions, finance/margin/RC tools, sourcing and future AI growth tools.","/dealer"],
 ["New Vehicle Dealership / Sales Team","Receive structured new-vehicle requirements, test-drive/quote opportunities and multi-brand demand routing.","/dealer"],
 ["Workshop / Repairs / Detailing","Receive assigned jobs, manage work status and build a verified service profile.","/partner"],
 ["Inspection / Verification","Vehicle inspection and verification assignments through the Rohilla network.","/partner"],
 ["Finance / Insurance / RC-RTO","Qualified customer requirements with controlled handoff and workflow tracking.","/partner"],
 ["Taxi / Self-Drive / Chauffeur / Fleet","Mobility and corporate/fleet requirements routed through one business network.","/partner"],
 ["Commercial / Transport / Logistics","Commercial vehicle, delivery, fleet and transporter opportunities.","/partner"],
 ["EV / Tyres / Battery / RSA","Future mobility, roadside and vehicle-support services.","/partner"],
 ["RVSF / Recycler / Scrap Buyer","Responsible end-of-life vehicle and recycler quote opportunities.","/partner"],
 ["Other Automotive Business","If your business touches the vehicle lifecycle, apply and let Rohilla Drive classify the right workflow.","/partner"]
];

export default function BusinessHub(){return <main>
 <header><div className="brand"><b>ROHILLA DRIVE</b><small>ROHILLA BUSINESS HUB</small></div><div className="row"><a className="call" href="/">Customer Website</a><a className="call" href="/new-vehicles">New Vehicle Assistance</a></div></header>
 <section className="hero"><div className="heroText"><span>B2B AUTOMOTIVE NETWORK</span><h1>Do business with Rohilla Drive — not just list on it.</h1><p>Dealer, new-car dealership, workshop, inspector, finance/insurance professional, mobility operator, transporter, RVSF or another automotive business: choose the role that matches your work and enter the right portal.</p></div></section>
 <section className="section"><div className="grid">{businessTypes.map(([name,desc,href])=><article className="application" key={name}><h2>{name}</h2><p>{desc}</p><a className="call" href={href}>View / Join →</a></article>)}</div></section>
 <section className="section dark"><div className="about"><h2>One network, separate permissions.</h2><p>Customers do not need a Dealer account to buy, sell or request a service. Dealers get dealer tools. Service and mobility businesses get Business Hub workflows. Rohilla Drive Admin remains the network control layer.</p><p>Advanced marketing automation, social publishing, Google Ads control and Rohilla Intelligence will only activate for accounts and channels that are officially connected and authorised.</p></div></section>
 </main>}
