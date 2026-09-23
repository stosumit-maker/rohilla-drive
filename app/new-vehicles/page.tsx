import {redirect} from "next/navigation";

export const metadata={
  title:"New Cars in Ambala",
  alternates:{canonical:"/new-cars/ambala"},
  robots:{index:false,follow:true}
};

export default function LegacyNewVehicles(){
  redirect("/new-cars/ambala");
}
