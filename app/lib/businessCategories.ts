export type PartnerBusinessCategory = {
  id: string;
  label: string;
  aliases?: string[];
};

export const partnerBusinessCategories: PartnerBusinessCategory[] = [
  { id: "workshop_repairs", label: "Workshop / Repairs", aliases: ["Workshop & Repairs"] },
  { id: "car_inspection", label: "Car Inspection", aliases: ["Vehicle Inspection", "Car Inspection / Verification"] },
  { id: "finance_dsa", label: "Finance DSA", aliases: ["Finance DSA / Referral"] },
  { id: "insurance", label: "Insurance", aliases: ["Insurance Services"] },
  { id: "rc_rto_assistance", label: "RC / RTO Assistance" },
  { id: "car_detailing", label: "Car Detailing", aliases: ["Vehicle Detailing"] },
  { id: "roadside_assistance", label: "Roadside Assistance" },
  { id: "self_drive_rental", label: "Self-Drive Car Rental", aliases: ["Self-Drive / Rental"] },
  { id: "taxi_cab", label: "Taxi / Cab Service" },
  { id: "chauffeur", label: "Chauffeur Service" },
  { id: "fleet_corporate_mobility", label: "Fleet / Corporate Mobility" },
  { id: "vehicle_delivery_logistics", label: "Vehicle Delivery / Logistics" },
  { id: "ev_services", label: "EV Services" },
  { id: "tyres_battery", label: "Tyres / Battery" },
  { id: "rvsf", label: "Registered Vehicle Scrapping Facility (RVSF)" },
  { id: "recycler_scrap_buyer", label: "Local Vehicle Recycler / Scrap Buyer", aliases: ["Vehicle Recycler / Scrap Buyer"] },
  { id: "other_automobile_service", label: "Other Automobile Service", aliases: ["Other Automotive Service"] }
];

export const partnerCategoryLabels = partnerBusinessCategories.map((category) => category.label);

export function canonicalPartnerCategory(value: string) {
  const normalized = value.trim().toLowerCase();
  const match = partnerBusinessCategories.find((category) =>
    [category.id, category.label, ...(category.aliases || [])].some((item) => item.toLowerCase() === normalized)
  );
  return match?.label || value.trim();
}

export function partnerJoinHref(label: string) {
  return `/join/partner?category=${encodeURIComponent(canonicalPartnerCategory(label))}`;
}
