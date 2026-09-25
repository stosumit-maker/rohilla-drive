export type TrustedAssistAudience={
  key:string;
  path:string;
  title:string;
  eyebrow:string;
  h1:string;
  description:string;
  defaultProfile:string;
  intro:string;
  situations:string[];
  searchPhrases:string[];
  faq:[string,string][];
};

export const trustedAssistAudiences:TrustedAssistAudience[]=[
  {
    key:"nri",
    path:"/nri-car-care-india",
    title:"NRI Car Care in India | Remote Vehicle Assistance",
    eyebrow:"NRI VEHICLE CARE • INDIA",
    h1:"NRI Car Care & Vehicle Assistance in India",
    description:"ROHILLA Trusted Assist helps NRI families and vehicle owners abroad coordinate service, inspection, battery, tyre, pickup/drop, documentation and selling support for vehicles in India where coverage is available.",
    defaultProfile:"NRI / family abroad",
    intro:"Living abroad while your car remains in India can turn a simple battery, service, inspection or document issue into repeated calls. ROHILLA Trusted Assist gives you one contact point to explain the requirement, confirm the next step and coordinate locally where coverage is available.",
    situations:["Car parked for long periods","Periodic start / condition check requirement","Service or repair coordination","Battery or tyre issue","Inspection before use or sale","Pickup / drop or vehicle movement","RC / insurance document coordination","Preparing the vehicle for sale"],
    searchPhrases:["NRI car care India","car maintenance for NRI in India","vehicle assistance for NRI","remote car management India","car service for NRI family"],
    faq:[
      ["Can an NRI request help for a car kept in India?","Yes. You can submit the vehicle location, current issue and preferred contact time. ROHILLA DRIVE can coordinate eligible work where its team or participating partners are available."],
      ["Will work start without my approval?","The intended workflow is to contact you, clarify the requirement and confirm the next step before work proceeds. You should also confirm provider identity, estimate and scope before authorising payment or work."],
      ["Can you help if I am outside India?","Yes. The form accepts your current location and a separate WhatsApp number so follow-up can happen while you are abroad."],
      ["Can this include selling the car?","Yes. Pre-sale inspection, preparation and seller support can be requested; full vehicle selling details and private photos can also be submitted through ROHILLA DRIVE."],
      ["Is this available everywhere in India?","No. ROHILLA DRIVE is based in Ambala and expands through participating partners. Availability depends on the vehicle location and the requested service."]
    ]
  },
  {
    key:"defence",
    path:"/defence-personnel-vehicle-assistance",
    title:"Vehicle Assistance for Defence Personnel | ROHILLA Trusted Assist",
    eyebrow:"DEFENCE PERSONNEL • VEHICLE SUPPORT",
    h1:"Vehicle Assistance for Defence Personnel & Posted-Out Owners",
    description:"Vehicle coordination for defence personnel, armed-forces families and owners posted away from their vehicle: service, inspection, battery, tyres, pickup/drop, documentation and selling support where available.",
    defaultProfile:"Defence personnel / family",
    intro:"Posting, field duty or transfer can leave a family vehicle in another city. ROHILLA Trusted Assist is designed to reduce the number of people you have to call: share the vehicle location and requirement once, then coordinate the next step through one contact point.",
    situations:["Vehicle left at home during posting","Service or maintenance due","Battery discharge or tyre issue","Inspection after long parking","Pickup / drop coordination","Family needs local vehicle help","RC / insurance document follow-up","Sale support before transfer or relocation"],
    searchPhrases:["car assistance for defence personnel","vehicle help for army personnel","car care during posting","outstation vehicle support defence","remote car service coordination"],
    faq:[
      ["Is this only for Army personnel?","No. The service is intended for defence and armed-forces personnel and families who are posted away or cannot personally manage a vehicle."],
      ["Can a family member coordinate locally?","Yes. You can provide the vehicle location and explain who is available locally. The team can coordinate the request subject to coverage and your confirmation."],
      ["Can you arrange pickup and service?","Pickup, drop and service coordination can be requested where a suitable provider is available. Final scope, charges and provider must be confirmed before work starts."],
      ["Can you help with documents?","RC, insurance and related coordination can be requested, but official outcomes and regulated services remain subject to authorised providers and government processes."],
      ["What if I cannot take a call?","Use WhatsApp or submit a callback request with a preferred contact time. The request is saved for follow-up."]
    ]
  },
  {
    key:"senior",
    path:"/senior-citizen-car-assistance",
    title:"Senior Citizen Car Assistance | Service, Pickup & Vehicle Help",
    eyebrow:"SENIOR CITIZENS • VEHICLE HELP",
    h1:"Car Assistance for Senior Citizens & Elderly Vehicle Owners",
    description:"ROHILLA Trusted Assist helps senior citizens and families coordinate vehicle service, inspection, battery/tyre issues, pickup/drop, roadside support and paperwork where available.",
    defaultProfile:"Senior citizen",
    intro:"Need help with service, inspection, pickup/drop or paperwork? Share the vehicle details once and our team will help coordinate the next step.",
    situations:["Scheduled service or repair","Battery / tyre replacement","Inspection before a journey","Pickup / drop coordination","Roadside or breakdown support","RC / insurance assistance","Family managing the vehicle remotely","Selling an older or unused vehicle"],
    searchPhrases:["senior citizen car assistance","car service for elderly","vehicle help for senior citizens","car pickup service senior citizen","car maintenance assistance elderly"],
    faq:[
      ["Can a family member submit the request for a senior citizen?","Yes. A family member can submit the details and explain where the vehicle is located and what help is required."],
      ["Can pickup and drop be requested?","Yes, where a suitable provider and service area are available. Confirm the provider, timing, charges and handover process before proceeding."],
      ["Can roadside help be requested?","Yes. Roadside or breakdown assistance can be requested, subject to partner availability in the vehicle location."],
      ["Can you help with selling an unused car?","Yes. You can request selling support or use the detailed seller workflow to submit vehicle information and private photos."],
      ["Do I need to pay to submit the request?","No payment is required to send the enquiry. Any later service charge must be confirmed before work begins."]
    ]
  },
  {
    key:"remote",
    path:"/remote-car-assistance",
    title:"Remote Car Assistance | Outstation Vehicle Management",
    eyebrow:"REMOTE OWNER • OUTSTATION VEHICLE",
    h1:"Remote Car Assistance for Outstation Owners & Busy Professionals",
    description:"One contact point for outstation owners and busy professionals who need vehicle inspection, service, battery/tyre help, pickup/drop, documentation, logistics or selling support where available.",
    defaultProfile:"Outstation vehicle owner",
    intro:"If work, travel or relocation keeps you away from the vehicle, routine tasks can become time-consuming. ROHILLA Trusted Assist captures the requirement once and helps coordinate the next step locally where coverage is available.",
    situations:["Owner working in another city","Vehicle parked at family home","Service or repair coordination","Battery / tyre / breakdown issue","Inspection before travel","Pickup / drop or transport","Document follow-up","Pre-sale preparation and selling support"],
    searchPhrases:["remote car assistance","outstation car service help","vehicle management service","car care while away from home","busy professional car assistance"],
    faq:[
      ["Who is remote car assistance for?","It is for owners who are away from the vehicle, travelling, posted elsewhere, working in another city or otherwise unable to manage the vehicle personally."],
      ["Can I request only an inspection first?","Yes. Inspection or condition-check coordination can be requested before deciding on repair, service or sale."],
      ["Can this include vehicle transport?","Vehicle pickup, delivery or logistics can be requested where a suitable provider is available. Final transport terms must be confirmed directly."],
      ["What if the car is not in Ambala?","Submit the actual vehicle location. ROHILLA DRIVE is based in Ambala but accepts broader regional requests where participating partners are available."],
      ["How do I follow up if a call is missed?","Use WhatsApp or the callback form. The request is saved with your contact details and preferred time."]
    ]
  }
];

export function trustedAudience(key:string){return trustedAssistAudiences.find(x=>x.key===key)}
