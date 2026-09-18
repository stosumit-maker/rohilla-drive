export type AutoServiceIntent={
  id:string;
  label:string;
  short:string;
  searchTerms:string[];
  regulated?:boolean;
};

export const autoServiceIntents:AutoServiceIntent[]=[
  {id:"car-service-repair",label:"Car Service & Repair",short:"Workshop servicing, diagnostics, mechanical repair and maintenance requests.",searchTerms:["car service","car repair","car mechanic","car workshop","car service center"]},
  {id:"car-inspection",label:"Car Inspection & Verification",short:"Pre-purchase inspection, condition checks and vehicle verification requests.",searchTerms:["car inspection","used car inspection","vehicle inspection","car verification"]},
  {id:"car-detailing",label:"Car Detailing & Cleaning",short:"Interior, exterior, polishing, detailing and vehicle preparation requests.",searchTerms:["car detailing","car cleaning","car polish","car spa"]},
  {id:"rc-rto",label:"RC / RTO Assistance",short:"Ownership-transfer, RC and documentation coordination requests.",searchTerms:["RC transfer","RTO assistance","vehicle ownership transfer","car RC transfer"],regulated:true},
  {id:"car-finance",label:"Car Finance Assistance",short:"New or used vehicle finance requirement routing to relevant authorised providers.",searchTerms:["car loan","used car loan","vehicle finance","car finance"],regulated:true},
  {id:"car-insurance",label:"Car Insurance Assistance",short:"Motor-insurance requirement routing to appropriately authorised providers.",searchTerms:["car insurance","motor insurance","vehicle insurance","insurance renewal"],regulated:true},
  {id:"tyres-battery",label:"Tyres & Battery",short:"Tyre, battery and related vehicle-support requirements.",searchTerms:["car tyres","car battery","battery replacement","tyre shop"]},
  {id:"roadside-assistance",label:"Roadside Assistance",short:"Breakdown, towing and roadside-support requirements where a suitable partner is available.",searchTerms:["roadside assistance","car breakdown","car towing","towing service"]},
  {id:"ev-services",label:"EV Services",short:"Electric-vehicle support requirements based on partner capability and service area.",searchTerms:["EV service","electric car service","EV repair","EV support"]},
  {id:"vehicle-logistics",label:"Vehicle Delivery & Logistics",short:"Vehicle movement, pickup, delivery and logistics coordination requests.",searchTerms:["car transport","vehicle transport","car delivery","car logistics"]},
  {id:"self-drive-rental",label:"Self-Drive Car Rental",short:"Self-drive vehicle requirements in supported service areas.",searchTerms:["self drive car rental","car rental","rent a car"]},
  {id:"taxi-chauffeur",label:"Taxi / Cab / Chauffeur",short:"Local, intercity, chauffeur and mobility requirements where available.",searchTerms:["cab service","taxi service","chauffeur","driver service"]}
];

export function serviceById(id:string){return autoServiceIntents.find(x=>x.id===id)}
