import type {Metadata} from "next";

const site="https://www.rohilladrive.com";
const phone="+91-7015260003";
const googleProfile="https://www.google.com/search?kgmid=/g/11v13gyn6y&q=Rohilla+Multibrand+Cars";

export const metadata:Metadata={
  title:"Used Car Dealer in Ambala | Rohilla Multibrand Cars",
  description:"Rohilla Multibrand Cars is a used car dealer in Ambala City. Browse current used and second hand cars, sell your car or send a direct vehicle requirement through ROHILLA DRIVE.",
  alternates:{canonical:"/used-car-dealer-baldev-nagar-ambala"},
  openGraph:{
    title:"Rohilla Multibrand Cars | Used Car Dealer in Baldev Nagar, Ambala",
    description:"Used cars, second hand cars and direct vehicle enquiries from Rohilla Multibrand Cars in Ambala City.",
    url:"/used-car-dealer-baldev-nagar-ambala",
    type:"website"
  }
};

export default function BaldevNagarDealerPage(){
  const dealer={
    "@context":"https://schema.org",
    "@type":["AutoDealer","AutomotiveBusiness"],
    "@id":site+"/ambala#autodealer",
    name:"Rohilla Multibrand Cars",
    alternateName:["ROHILLA DRIVE","Rohilla Drive"],
    url:site+"/used-car-dealer-baldev-nagar-ambala",
    telephone:phone,
    description:"Used car dealer serving Baldev Nagar and Ambala City with published pre-owned vehicle inventory and direct enquiries through ROHILLA DRIVE.",
    address:{"@type":"PostalAddress",addressLocality:"Ambala City",addressRegion:"Haryana",addressCountry:"IN"},
    areaServed:[
      {"@type":"Place",name:"Baldev Nagar, Ambala"},
      {"@type":"City",name:"Ambala"},
      {"@type":"AdministrativeArea",name:"Haryana"}
    ],
    hasMap:googleProfile,
    sameAs:[
      "https://www.instagram.com/rohillamultibrandcars/",
      "https://www.facebook.com/profile.php?id=100094277025442",
      "https://youtube.com/@sumitrohilla983",
      googleProfile
    ]
  };
  const breadcrumb={
    "@context":"https://schema.org",
    "@type":"BreadcrumbList",
    itemListElement:[
      {"@type":"ListItem",position:1,name:"ROHILLA DRIVE",item:site},
      {"@type":"ListItem",position:2,name:"Ambala",item:site+"/ambala"},
      {"@type":"ListItem",position:3,name:"Used Car Dealer in Baldev Nagar",item:site+"/used-car-dealer-baldev-nagar-ambala"}
    ]
  };

  return <main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(dealer)}}/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(breadcrumb)}}/>
    <section className="hero" style={{paddingTop:52,paddingBottom:52}}>
      <div className="heroText">
        <span>ROHILLA MULTIBRAND CARS • BALDEV NAGAR • AMBALA CITY</span>
        <h1>Used Car Dealer in Baldev Nagar, Ambala</h1>
        <p className="heroSub">Used Cars • Second Hand Cars • Buy & Sell</p>
        <p>Browse current published cars from Rohilla Multibrand Cars and send a direct enquiry through ROHILLA DRIVE.</p>
        <div className="row" style={{marginTop:18}}>
          <a className="call" href="/used-cars-ambala">Browse Used Cars</a>
          <a className="call" href="/sell-car-ambala">Sell Your Car</a>
          <a className="secondary" href={googleProfile} target="_blank" rel="noopener noreferrer">View on Google</a>
        </div>
      </div>
    </section>
    <section className="section">
      <div className="head"><div><h2>Rohilla Multibrand Cars — Ambala City</h2><p>Local used-car enquiries, current vehicle inventory and car-selling requests are handled through ROHILLA DRIVE.</p></div></div>
      <div className="grid">
        <article className="card"><div className="body"><h3>Used Cars in Ambala</h3><p>See current published cars with price, year, fuel, kilometres and photos.</p><a className="textLink" href="/used-cars-ambala">Browse current cars →</a></div></article>
        <article className="card"><div className="body"><h3>Find a Car</h3><p>Share the model and budget you need for direct follow-up.</p><a className="textLink" href="/find-car-ambala">Send requirement →</a></div></article>
        <article className="card"><div className="body"><h3>Sell Your Car</h3><p>Submit your vehicle details for review and follow-up.</p><a className="textLink" href="/sell-car-ambala">Sell your car →</a></div></article>
      </div>
    </section>
    <section className="section dark"><div className="about">
      <h2>Used & Second Hand Cars in Baldev Nagar & Ambala</h2>
      <p>Rohilla Multibrand Cars serves used-car buyers and sellers in Baldev Nagar and across Ambala City.</p>
      <p><b>Phone / WhatsApp:</b> {phone}</p>
      <div className="row"><a className="call" href="/ambala">Ambala Vehicle Hub</a><a className="call" href="/inventory">All Inventory</a></div>
    </div></section>
  </main>;
}
