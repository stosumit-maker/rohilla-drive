import type {Metadata} from "next";
import {supabase} from "../supabaseClient";
import AmbalaLeadFunnel from "../components/AmbalaLeadFunnel";

export const revalidate=300;

export const metadata:Metadata={
  title:"Used Cars in Ambala | Second Hand Cars for Sale",
  description:"Browse current used and second hand cars in Ambala City from ROHILLA DRIVE by Rohilla Multibrand Cars. View price, year, fuel, kilometres, photos and enquire directly.",
  alternates:{canonical:"/used-cars-ambala"},
  openGraph:{
    title:"Used Cars in Ambala | ROHILLA DRIVE",
    description:"Current second hand cars for sale in Ambala City with vehicle details, photos and direct enquiry.",
    url:"/used-cars-ambala",
    type:"website"
  },
  twitter:{card:"summary_large_image",title:"Used Cars in Ambala | ROHILLA DRIVE",description:"Browse current second hand cars for sale in Ambala City."}
};

type Car={
  id:string;brand:string;model:string;variant:string|null;year:number|null;km:number|null;fuel:string|null;owner_count:number|null;asking_price:number|null;city:string|null;registration_prefix:string|null;vehicle_photos?:{url:string;sort_order:number|null}[]
};

const site="https://www.rohilladrive.com";
const phone="+91-7015260003";
const faqs=[
  ["Where can I find used cars in Ambala?","ROHILLA DRIVE publishes its current pre-owned vehicle inventory online. You can check available cars, key details and photos, then send an enquiry for the vehicle you want to inspect or discuss."],
  ["Can I see second hand car prices before contacting you?","Yes. Published listings show the asking price along with available details such as model year, kilometres, fuel type, ownership count and city."],
  ["Can I sell my car in Ambala through ROHILLA DRIVE?","Yes. Individual sellers can use the Sell / List page to submit vehicle details and private photos for review without creating a dealer account."],
  ["Do you handle only Ambala registration cars?","No. Availability can include vehicles with different registration prefixes. Always check the individual vehicle page and confirm documentation before completing a transaction."],
  ["How do I enquire about a used car?","Open the vehicle details page and use the enquiry option. ROHILLA DRIVE records the enquiry and can continue the conversation with you on WhatsApp or phone."]
];

export default async function UsedCarsAmbala(){
  const db=supabase();
  const {data}=await db.from("vehicles")
    .select("id,brand,model,variant,year,km,fuel,owner_count,asking_price,city,registration_prefix,vehicle_photos(url,sort_order)")
    .eq("status","published")
    .ilike("city","%Ambala%")
    .order("created_at",{ascending:false})
    .limit(48);
  const cars=(data||[]) as Car[];

  const collectionSchema={
    "@context":"https://schema.org",
    "@type":"CollectionPage",
    "@id":`${site}/used-cars-ambala#page`,
    name:"Used Cars in Ambala",
    description:"Current second hand and pre-owned car inventory in Ambala City from ROHILLA DRIVE by Rohilla Multibrand Cars.",
    url:`${site}/used-cars-ambala`,
    isPartOf:{"@id":`${site}/#website`},
    about:{"@id":`${site}/ambala#autodealer`},
    mainEntity:{
      "@type":"ItemList",
      numberOfItems:cars.length,
      itemListElement:cars.map((car,index)=>({"@type":"ListItem",position:index+1,url:`${site}/cars/${car.id}`,name:`${car.year||""} ${car.brand} ${car.model} ${car.variant||""}`.trim()}))
    }
  };
  const faqSchema={"@context":"https://schema.org","@type":"FAQPage",mainEntity:faqs.map(([q,a])=>({"@type":"Question",name:q,acceptedAnswer:{"@type":"Answer",text:a}}))};
  const breadcrumbSchema={"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:"ROHILLA DRIVE",item:site},{"@type":"ListItem",position:2,name:"Ambala",item:`${site}/ambala`},{"@type":"ListItem",position:3,name:"Used Cars in Ambala",item:`${site}/used-cars-ambala`} ]};

  return <main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(collectionSchema)}}/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(faqSchema)}}/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(breadcrumbSchema)}}/>

    <section className="hero" style={{paddingTop:52,paddingBottom:52}}>
      <div className="heroText">
        <span>ROHILLA MULTIBRAND CARS • AMBALA CITY</span>
        <h1>Used Cars & Second Hand Cars for Sale in Ambala</h1>
        <p className="heroSub">Second hand cars • Pre-owned cars • Direct vehicle enquiry</p>
        <p>Browse current ROHILLA DRIVE listings in Ambala with available price, year, kilometres, fuel, ownership and vehicle photos. Inventory changes as vehicles are added or sold.</p>
        <div className="row" style={{marginTop:18}}>
          <a className="call" href="/inventory?city=Ambala%20City">Browse Full Inventory</a>
          <a className="call" href="/find-car-ambala">Tell Us the Car You Need</a>
          <a className="call" href="/sell">Sell Your Car in Ambala</a>
          <a className="secondary" href={`https://wa.me/917015260003?text=${encodeURIComponent("Hello ROHILLA DRIVE, I am looking for a used car in Ambala.")}`}>WhatsApp</a>
        </div>
      </div>
    </section>

    <AmbalaLeadFunnel source="used_cars_ambala" defaultMode="buy"/>

    <section className="section" style={{paddingTop:30}}>
      <div className="head"><div><h2>Current Second Hand Cars in Ambala</h2><p>{cars.length?`${cars.length} published vehicle${cars.length===1?"":"s"} currently matching Ambala.`:"No Ambala vehicle is published at this moment. Share your requirement and we can follow up when suitable inventory is available."}</p></div><a className="textLink" href="/inventory">All Inventory →</a></div>
      {cars.length?<div className="grid">{cars.map(car=>{const photos=[...(car.vehicle_photos||[])].sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));const first=photos[0]?.url;return <article className="card" key={car.id}>
        <a className="photo real" href={`/cars/${car.id}`} aria-label={`Open ${car.brand} ${car.model} details`}>{first?<img src={first} alt={`${car.year||""} ${car.brand} ${car.model} used car in Ambala`}/>:<span>Vehicle photo unavailable</span>}</a>
        <div className="body"><label>USED CAR • AMBALA</label><h2 style={{fontSize:22}}>{car.brand} {car.model}</h2>{car.variant&&<p>{car.variant}</p>}<small>{car.year||"Year on request"}{car.km!=null?` • ${Number(car.km).toLocaleString("en-IN")} km`:""}{car.fuel?` • ${car.fuel}`:""}{car.owner_count?` • ${car.owner_count} Owner`:""}</small>{car.registration_prefix&&<small style={{display:"block",marginTop:5}}>Registration: {car.registration_prefix}</small>}{car.asking_price!=null&&<strong>₹{Number(car.asking_price).toLocaleString("en-IN")}</strong>}<a className="call" href={`/cars/${car.id}`} style={{display:"block",textAlign:"center"}}>View Car Details</a><div className="row" style={{marginTop:8,gap:6}}><a className="call" href={`/cars/${car.id}?enquire=1`} style={{flex:1,textAlign:"center",padding:"9px 8px",fontSize:11}}>Enquire / WhatsApp</a><a className="secondary" href={`/cars/${car.id}?book=1`} style={{flex:1,textAlign:"center",padding:"9px 8px",fontSize:11,borderRadius:10,fontWeight:800,textDecoration:"none"}}>Book Now</a></div></div>
      </article>})}</div>:<div className="notice"><b>Looking for a specific car?</b> <a href="/find-car-ambala">Tell us the model and budget — save your requirement →</a></div>}
    </section>

    <section className="section compactSection">
      <div className="head"><div><h2>Search Used Cars in Ambala Your Way</h2><p>Use the live inventory filters to narrow vehicles by model, fuel, type or city.</p></div></div>
      <div className="grid">
        <article className="card"><div className="body"><h3>First-owner cars</h3><p>Check ownership count on each listing and confirm documents before purchase.</p><a href="/inventory?city=Ambala%20City">Check Ambala inventory →</a></div></article>
        <article className="card"><div className="body"><h3>Diesel & petrol cars</h3><p>Filter the published catalogue by fuel type and compare current asking prices.</p><a href="/inventory?city=Ambala%20City">Filter by fuel →</a></div></article>
        <article className="card"><div className="body"><h3>SUVs, hatchbacks & sedans</h3><p>Search by brand or model, then open the full listing for photos and vehicle-specific details.</p><a href="/inventory?city=Ambala%20City">Browse all used cars →</a></div></article>
      </div>
    </section>

    <section className="section dark"><div className="about"><h2>Rohilla Multibrand Cars — Ambala City</h2><p>ROHILLA DRIVE is the online vehicle and mobility platform of Rohilla Multibrand Cars in Ambala City, Haryana. Customers can browse published pre-owned vehicles, submit a car for sale, request new-vehicle assistance and access connected automotive services.</p><p><b>Phone / WhatsApp:</b> {phone}</p><div className="row"><a className="call" href="/ambala">Ambala Vehicle Hub</a><a className="call" href="/sell">Sell / List a Vehicle</a><a className="call" href="/verify">Vehicle Verification</a></div></div></section>

    <section className="section"><div className="head"><div><h2>Used Cars in Ambala — FAQs</h2></div></div><div className="grid">{faqs.map(([q,a])=><article className="card" key={q}><div className="body"><h3>{q}</h3><p>{a}</p></div></article>)}</div></section>
  </main>;
}
