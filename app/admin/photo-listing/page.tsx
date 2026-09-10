import type {Metadata} from "next";
import PhotoListingClient from "./PhotoListingClient";

export const metadata:Metadata={
 title:"Photo-First Listing",
 description:"Privacy-aware administration workflow to auto-fill vehicle details from photos, protect registration numbers and publish reviewed inventory.",
 alternates:{canonical:"/admin/photo-listing"}
};

export default function Page(){return <PhotoListingClient/>}
