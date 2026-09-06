import InventoryClient from "./InventoryClient";

export const metadata={
 title:"Browse Vehicle Inventory",
 description:"Browse the complete published Rohilla Drive vehicle inventory by brand, model, fuel, vehicle type and city.",
 alternates:{canonical:"/inventory"}
};

export default function InventoryPage(){return <InventoryClient/>}
