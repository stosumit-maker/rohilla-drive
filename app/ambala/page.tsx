import type {Metadata} from "next";
import AmbalaLeadFunnel from "../components/AmbalaLeadFunnel";

export const metadata:Metadata={
  title:{absolute:"Used Car Dealer in Ambala | Rohilla Multibrand Cars"},
  description:"Rohilla Multibrand Cars is a used car dealer and second hand car showroom in Ambala City. Browse pre-owned cars for sale, budget cars and live inventory or sell your car.",
  alternates:{canonical:"/ambala"},
  openGraph:{title:"Used Car Dealer in Ambala | Rohilla Multibrand Cars",description:"Browse used and second hand cars in Ambala City, view published prices and photos, or send a direct enquiry to Rohilla Multibrand Cars.",url:"/ambala",type:"website"},
  twitter:{card:"summary_large_image",title:"ROHILLA DRIVE Ambala",description:"Used cars, vehicle selling, verification and automotive assistance in Ambala City."}
};

const site="https://www.rohilladrive.com";
const phone="+91-7015260003";
const services=[
  ["Used Cars in Ambala","Browse current second hand and pre-owned cars with published prices, photos and vehicle details.","/used-cars-ambala"],
  ["Find a Car for Me","Share your preferred model, budget and timing. ROHILLA DRIVE saves the requirement for direct follow-up.","/find-car-ambala"],
  ["Sell Your Car","Submit vehicle details and private photos for review. Individual sellers do not need a dealer account.","/sell"],
  ["New Vehicle Assistance","Share your model, variant, budget and city requirement for new-vehicle assistance.","/new-vehicles"],
  ["Vehicle Verification","Use ROHILLA DRIVE verification workflows for supported vehicle checks and documentation coordination.","/verify"],
  ["Automotive Services","Request inspection, workshop, RC/RTO assistance, detailing, roadside help and other supported services through the network.","/#services"],
  ["Business & Dealer Network","Dealers, workshops and automotive service businesses can create the correct business account directly.","/business-hub"]
];
const faqs=[
  ["Is ROHILLA DRIVE based in Ambala?","Yes. ROHILLA DRIVE is the digital vehicle and mobility platform of Rohilla Multibrand Cars, based in Ambala City, Haryana."],
  ["Can I buy a second hand car in Ambala through ROHILLA DRIVE?","Yes. Published inventory can be browsed online. Each vehicle page shows the details currently available and provides an enquiry route for follow-up."],
  ["Can I sell my used car in Ambala?","Yes. The Sell / List workflow lets an individual seller submit vehicle details and private photos for review."],
  ["Do you provide car services in Ambala?","ROHILLA DRIVE coordinates supported automotive services through its network, including categories such as inspection, workshop, detailing, roadside assistance and RC/RTO assistance."],
  ["Where is Rohilla Multibrand Cars in Ambala?","Rohilla Multibrand Cars serves customers from Baldev Nagar, Ambala City, Haryana."],
  ["Do you buy used cars in Ambala?","Yes. Car owners can submit vehicle details through the Sell Your Car workflow for review and follow-up."],
  ["How can I contact ROHILLA DRIVE in Ambala?",`Call or WhatsApp ${phone}, or use the enquiry forms on rohilladrive.com.`]
];

export default function AmbalaHub(){
  const autoDealer={
    "@context":"https://schema.org",
    "@type":["AutoDealer","AutomotiveBusiness"],
    "@id":`${site}/ambala#autodealer`,
    name:"Rohilla Multibrand Cars",
    alternateName:["Rohilla Multibrand Cars Ambala","Rohilla Multibrand Cars Baldev Nagar","ROHILLA DRIVE Ambala"],
    url:`${site}/ambala`,
    telephone:phone,
    description:"Used and second hand car dealer in Baldev Nagar, Ambala City, Haryana, with published pre-owned inventory and direct vehicle enquiries.",
    address:{"@type":"PostalAddress",streetAddress:"Near TR Sawhney Maruti Showroom, Jaggi Garden, Tagore Garden, Baldev Nagar",addressLocality:"Ambala",addressRegion:"Haryana",postalCode:"134007",addressCountry:"IN"},
    areaServed:[{"@type":"City",name:"Ambala"},{"@type":"Place",name:"Ambala City"},{"@type":"Place",name:"Ambala Cantt"},{"@type":"Place",name:"Baldev Nagar, Ambala"},{"@type":"Place",name:"Naraingarh"},{"@type":"Place",name:"Barara"},{"@type":"Place",name:"Saha"},{"@type":"Place",name:"Mullana"},{"@type":"Place",name:"Shahzadpur"},{"@type":"City",name:"Yamunanagar"},{"@type":"Place",name:"Jagadhri"},{"@type":"City",name:"Kurukshetra"},{"@type":"Place",name:"Pehowa"},{"@type":"City",name:"Kaithal"},{"@type":"City",name:"Panchkula"},{"@type":"AdministrativeArea",name:"Haryana"}],
    knowsAbout:["used cars in Ambala","second hand cars in Ambala","pre-owned cars","car sale and purchase","vehicle enquiries"],
    hasMap:"https://www.google.com/search?kgmid=/g/11v13gyn6y&q=Rohilla+Multibrand+Cars",
    sameAs:["https://www.instagram.com/rohillamultibrandcars/","https://www.facebook.com/profile.php?id=100094277025442","https://youtube.com/@sumitrohilla983","https://www.google.com/search?kgmid=/g/11v13gyn6y&q=Rohilla+Multibrand+Cars"]
  };
  const faqSchema={"@context":"https://schema.org","@type":"FAQPage",mainEntity:faqs.map(([q,a])=>({"@type":"Question",name:q,acceptedAnswer:{"@type":"Answer",text:a}}))};
  const breadcrumb={"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:"ROHILLA DRIVE",item:site},{"@type":"ListItem",position:2,name:"Ambala",item:`${site}/ambala`} ]};
  return <main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(autoDealer)}}/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(faqSchema)}}/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(breadcrumb)}}/>

    <section className="hero" style={{paddingTop:52,paddingBottom:52}}><div className="heroText">
      <span>ROHILLA DRIVE • AMBALA CITY, HARYANA</span>
      <h1>Used Car Dealer in Ambala — Rohilla Multibrand Cars</h1>
      <p className="heroSub">Buy • Sell • Verify • New Vehicles • Automotive Services</p>
      <p>Browse current second hand cars in Ambala with published prices and photos, sell your car, or send us the exact model and budget you need.</p>
      <div className="row" style={{marginTop:18}}><a className="call" href={`https://wa.me/917015260003?text=${encodeURIComponent("Hello Rohilla Multibrand Cars, I am looking for a used car in Ambala.")}`}>WhatsApp Now</a><a className="call" href="/find-car-ambala">Find My Car</a><a className="call" href="/used-cars-ambala">Used Cars in Ambala</a><a className="call" href="/sell">Sell Your Car</a><a className="secondary" href="/inventory">Browse Inventory</a></div>
    </div></section>

    <section className="section compactSection"><div className="about">
      <h2>Local Used-Car Dealer in Ambala</h2>
      <p>Rohilla Multibrand Cars is an Ambala City used-car business and second hand car showroom with online inventory through ROHILLA DRIVE. Customers in Ambala City, Ambala Cantt, Baldev Nagar, Naraingarh, Barara, Saha, Mullana and Shahzadpur can browse pre-owned cars for sale, compare asking prices and send a direct enquiry before visiting.</p><p>We also accept buyer and seller requirements from nearby North Haryana and Tricity markets including Yamunanagar, Jagadhri, Kurukshetra, Thanesar, Shahbad, Ladwa, Pehowa, Kaithal, Panchkula, Pinjore and Kalka. Our physical dealership remains in Ambala; these are customer service and enquiry coverage areas.</p><p><b>Popular car searches:</b> used cars in Ambala, second hand cars in Ambala, pre-owned cars, budget used cars, first-owner cars and sell car in Ambala.</p>
      <div className="row"><a className="call" href="/used-cars-ambala">Used Cars in Ambala</a><a className="call" href="/sell-car-ambala">Sell Your Car in Ambala</a><a className="secondary" href="/dealers/rohilla-multibrand-cars">Rohilla Multibrand Cars Profile</a><a className="secondary" href="/used-car-dealer-baldev-nagar-ambala">Baldev Nagar Dealer Page</a><a className="secondary" href="/find-car-ambala">Find a Car for Me</a></div>
    </div></section>

    <AmbalaLeadFunnel source="ambala_hub" defaultMode="buy"/>

    <section className="section"><div className="head"><div><h2>What Do You Need?</h2><p>Choose an option to continue.</p></div></div><div className="grid">{services.map(([title,text,href])=><article className="card" key={title}><div className="body"><h2 style={{fontSize:22}}>{title}</h2><p>{text}</p><a className="textLink" href={href}>Open →</a></div></article>)}</div></section>

    <section className="section compactSection"><div className="head"><div><h2>Why Customers Use Rohilla Drive</h2></div></div><div className="grid">
      <article className="card"><div className="body"><h3>Live published inventory</h3><p>Only currently published vehicles are shown as available.</p></div></article>
      <article className="card"><div className="body"><h3>Direct enquiry tracking</h3><p>Send an enquiry for the exact car you are viewing.</p></div></article>
      <article className="card"><div className="body"><h3>Private seller photos</h3><p>Seller photos stay private until reviewed.</p></div></article>
      <article className="card"><div className="body"><h3>Verified partner workflow</h3><p>Service requests are handled through approved business access where required.</p></div></article>
    </div></section>

    <section className="section dark"><div className="about"><h2>Rohilla Multibrand Cars, Ambala City</h2><p>Rohilla Drive is the online platform of Rohilla Multibrand Cars, Ambala City.</p><p><b>Phone / WhatsApp:</b> {phone}</p><p><a className="textLink" href="https://www.google.com/search?kgmid=/g/11v13gyn6y&q=Rohilla+Multibrand+Cars" target="_blank" rel="noopener noreferrer">View Rohilla Multibrand Cars on Google →</a></p><div className="row"><a className="call" href="/used-cars-ambala">Second Hand Cars in Ambala</a><a className="call" href="/new-vehicles">New Vehicle Assistance</a><a className="call" href="/business-hub">Business Hub</a></div></div></section>

    <section className="section"><div className="head"><div><h2>ROHILLA DRIVE Ambala — FAQs</h2></div></div><div className="grid">{faqs.map(([q,a])=><article className="card" key={q}><div className="body"><h3>{q}</h3><p>{a}</p></div></article>)}</div></section>
  </main>;
}
