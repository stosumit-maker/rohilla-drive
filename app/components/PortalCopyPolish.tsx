"use client";

import {useEffect} from "react";
import {usePathname} from "next/navigation";

const exact:Record<string,string>={
 "Owner/Admin login":"Restricted access for authorised operations users.",
 "ROHILLA DRIVE Admin":"ROHILLA DRIVE Administration Console",
 "Secure Admin Setup":"Administrator Security Setup",
 "Google Authenticator में QR scan करो।":"Scan the QR code with your authenticator app, then enter the 6-digit verification code.",
 "Authenticator verification required":"Multi-factor authentication required",
 "Add & Publish Vehicle":"Inventory Publishing",
 "Upload 1–50+ photos. Publish only after checking the details.":"Create a verified inventory record and publish only after the vehicle details and media have been reviewed.",
 "Dealer Applications":"Dealer Access Reviews",
 "Partner Applications":"Partner Access Reviews",
 "Customer Service Requests":"Service Operations Queue",
 "Social Publishing Queue":"Channel Distribution Queue",
 "Website publishing is independent from social delivery. Instagram/Facebook/YouTube queue records can be created, while automatic external posting still requires the official platform API/OAuth connections.":"Website inventory publishing operates independently from external social channels. Automated distribution is enabled only when authorised platform connections are active.",
 "ROHILLA DRIVE Dealer Portal":"ROHILLA DRIVE Dealer Workspace",
 "Dealer Login":"Sign In to Dealer Workspace",
 "Create New Account":"Apply for Access",
 "Create Dealer Account & Continue on WhatsApp":"Submit Dealer Application",
 "Private Multi-Category Business Portal":"Dealer Operations Workspace",
 "Inventory & Listings":"Inventory Management",
 "Finance • Margin • RC":"Transactions & RC",
 "Open Finance Tools":"Open Vehicle Ledger",
 "Growth Tools":"Marketing Studio",
 "Open Growth Console":"Open Marketing Studio",
 "New Vehicle Network":"New Vehicle Opportunities",
 "Submit Dealer Vehicle":"Add Vehicle to Inventory",
 "Dealer submissions stay draft until ROHILLA DRIVE approval. You remain responsible for accurate vehicle, ownership and listing information.":"New dealer inventory is submitted for Rohilla Drive review before public publication. Your business remains responsible for accurate vehicle and ownership information.",
 "My Submitted Vehicles":"Inventory Portfolio",
 "ROHILLA DRIVE Dealer Finance":"Dealer Transactions & RC",
 "My Finance • Margin • RC":"Vehicle Ledger • Margin • RC",
 "My Vehicle Finance & RC":"Transactions, Margin & RC",
 "Only your own dealer vehicles are visible here. Other dealers' data and Rohilla Drive private records are not accessible.":"Your workspace is restricted to your dealership's vehicles and private transaction records.",
 "My Stock Cost":"Inventory Cost",
 "My Gross Margin":"Gross Margin",
 "My RC Pending":"Pending RC Transfers",
 "My Vehicle Ledger":"Vehicle Transaction Record",
 "Partner Portal":"Partner Workspace",
 "Partner Login":"Sign In to Partner Workspace",
 "Create Partner Account & Continue on WhatsApp":"Submit Partner Application",
 "ROHILLA DRIVE PARTNER":"PARTNER OPERATIONS",
 "Manage requests specifically assigned to your business through Rohilla Drive. You remain responsible for service quality, lawful operations and required licences/permits.":"Manage service requests assigned to your business. Service delivery, licensing and compliance remain your responsibility.",
 "No assigned requests":"No assigned service requests",
 "Eligible requests assigned by Rohilla Drive will appear here. Approval does not guarantee request volume.":"New service requests assigned to your business will appear here.",
 "Contact via ROHILLA DRIVE":"Request Customer Connection",
 "Customer contact is protected. ROHILLA DRIVE will coordinate the connection after acceptance when the workflow permits it.":"Customer contact remains protected until the request is accepted and Rohilla Drive authorises the handoff.",
 "ROHILLA INTELLIGENCE":"ROHILLA DRIVE MARKETING STUDIO",
 "ROHILLA INTELLIGENCE V2":"ROHILLA DRIVE MARKETING STUDIO",
 "ROHILLA-OWNED WORKFLOWS • ZERO-COST ORGANIC MODE":"CONTENT OPERATIONS • ORGANIC DISTRIBUTION",
 "One command. A controlled growth pipeline.":"Create campaign-ready content from one workspace.",
 "Prepare organic promotion packs now without paid AI or ads. Official auto-publishing stays optional for later.":"Build brand-consistent organic campaign assets now. External publishing remains controlled by authorised channel connections.",
 "Free Organic Promotion Pack":"Organic Campaign Pack",
 "8-layer execution model":"Campaign Workflow",
 "Advanced Voice / Text Growth Command":"Automation Brief",
 "My Growth Queue":"Campaign Activity",
 "Distribution rule":"Channel Governance",
 "TWO-WAY LANGUAGE BRIDGE":"MULTILINGUAL CUSTOMER COMMUNICATION",
 "Customer speaks their language. You work in yours.":"Serve customers in their language. Operate in yours.",
 "Customer → You":"Customer → Team",
 "You → Customer":"Team → Customer",
 "Translate for me":"Translate for Team",
 "Live Speech Interpretation":"Live Interpretation",
 "Browser interpretation is code-ready.":"Realtime speech capability",
 "My Authorised Deal Rooms":"Assigned Deal Workspaces",
 "You only see deals where Rohilla Drive Admin has explicitly added your business.":"Only deal workspaces assigned to your organisation are visible here.",
 "No Deal Room assigned yet.":"No deal workspace is currently assigned.",
 "Open Deal":"Open Workspace",
 "Workflow":"Deal Checklist",
 "Messages":"Secure Messages",
 "Add Message":"Send Message",
 "Portal Home":"Workspace Home",
 "Dealer / OEM Deal Rooms":"Dealer Deal Management",
 "Business Hub Partner Deal Rooms":"Partner Deal Management",
 "Finance & RC Control":"Transactions & RC",
 "Purchase • Sale • Margin • RC":"Transactions • Margin • RC",
 "Control Room":"Administration",
 "Smart Poster Scan":"Listing Intake",
 "Deal Ledger & RC Tracking":"Transaction Ledger & RC Tracking",
 "Private owner-only financial control. Nothing here is shown on the public vehicle page.":"Private financial and RC records for authorised administration users. These records are not displayed on public vehicle pages.",
 "Deal Ledger":"Transaction Record",
 "Live calculation":"Calculated Position",
 "Save Ledger":"Save Transaction",
 "₹ Revenue Pipeline":"Revenue Pipeline",
 "Track income opportunities before spending on paid AI or ads. Amounts stay optional until a commercial fee is actually agreed.":"Track commercial opportunities, agreed fees, invoicing and receipts across the Rohilla Drive network.",
 "Add Income Opportunity":"Add Revenue Opportunity",
 "Turn Existing Demand Into Trackable Income":"Convert Active Demand Into Revenue Tracking",
 "Track Revenue":"Add to Pipeline",
 "OEM / New Vehicle Network":"New Vehicle Lead Operations",
 "OEM / Authorised New Vehicle Quote Network":"Authorised New Vehicle Lead Network",
 "Multi-Brand New Vehicle Demand":"New Vehicle Customer Demand",
 "Customer requirements on one side, competitive OEM/authorised dealer offers on the other. Customer contact stays under Rohilla Drive control until you decide the handoff.":"Review customer requirements, compare authorised dealer offers and control the customer handoff from one workspace.",
 "WhatsApp Customer":"Contact Customer",
 "Smart Poster → Vehicle Details":"Listing Media → Vehicle Record",
 "Upload a sale poster. The scanner reads visible English text and pre-fills the vehicle form. Always verify details before Publish Live.":"Upload listing artwork or source media to pre-fill vehicle details. Review every extracted field before publication.",
 "Scan Poster & Auto-Fill":"Extract Listing Details",
 "Parse Text":"Parse Listing Text",
 "Verify & Save":"Review & Save",
 "Publish Vehicle Live":"Publish Inventory",
 "ROHILLA DRIVE Dealer":"ROHILLA DRIVE Dealer Workspace"
};

const placeholders:Record<string,string>={
 "Expected Rohilla fee ₹ (optional)":"Expected fee ₹ (optional)",
 "OCR / listing text (you can also paste text here)":"Listing text / extracted text",
 "Optional promotion brief: sunroof highlight, first owner, Rakhi offer, diesel automatic, etc.":"Campaign brief: key feature, offer, audience or positioning",
 "Speak or type the outcome you want…":"Describe the campaign outcome or workflow you want…"
};

function polishText(value:string){
 const trimmed=value.trim();
 if(exact[trimmed])return value.replace(trimmed,exact[trimmed]);
 const dynamic:[RegExp,(m:RegExpMatchArray)=>string][]=[
  [/^Customer Sales \/ New Car \/ Listing Leads \((\d+)\)$/,(m)=>`Customer Lead Pipeline (${m[1]})`],
  [/^Dealer Applications \((\d+)\)$/,(m)=>`Dealer Access Reviews (${m[1]})`],
  [/^Partner Applications \((\d+)\)$/,(m)=>`Partner Access Reviews (${m[1]})`],
  [/^Customer Service Requests \((\d+)\)$/,(m)=>`Service Operations Queue (${m[1]})`],
  [/^My Submitted Vehicles \((\d+)\)$/,(m)=>`Inventory Portfolio (${m[1]})`]
 ];
 for(const [re,fn] of dynamic){const m=trimmed.match(re);if(m)return value.replace(trimmed,fn(m))}
 return value;
}

function apply(root:ParentNode){
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node:Node|null;
 while((node=walker.nextNode())){const t=node as Text;if(!t.parentElement||t.parentElement.closest("script,style,[data-no-copy-polish]"))continue;const next=polishText(t.data);if(next!==t.data)t.data=next}
 root.querySelectorAll?.("input[placeholder],textarea[placeholder]").forEach((el:any)=>{const p=el.getAttribute("placeholder");if(p&&placeholders[p])el.setAttribute("placeholder",placeholders[p])});
}

export default function PortalCopyPolish(){
 const path=usePathname();
 const privatePortal=path.startsWith("/admin")||path.startsWith("/dealer")||path.startsWith("/partner");
 useEffect(()=>{
  if(!privatePortal)return;
  let busy=false;
  const run=()=>{if(busy)return;busy=true;requestAnimationFrame(()=>{apply(document.body);busy=false})};
  run();
  const observer=new MutationObserver(run);observer.observe(document.body,{childList:true,subtree:true});
  return()=>observer.disconnect();
 },[path,privatePortal]);
 return null;
}
