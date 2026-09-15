import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sell Your Car in Ambala | List Vehicle Online",
  description:
    "Sell or list your car or other vehicle in Ambala with ROHILLA DRIVE by Rohilla Multibrand Cars. Submit details and private photos for review and follow-up.",
  alternates: {
    canonical: "https://www.rohilladrive.com/sell",
  },
  openGraph: {
    title: "Sell Your Car in Ambala | ROHILLA DRIVE",
    description:
      "Submit your vehicle details and private photos to ROHILLA DRIVE in Ambala City for review, listing assistance and relevant enquiries.",
    url: "https://www.rohilladrive.com/sell",
    type: "website",
  },
  twitter:{
    card:"summary_large_image",
    title:"Sell Your Car in Ambala | ROHILLA DRIVE",
    description:"Submit your vehicle details and private photos for review with ROHILLA DRIVE by Rohilla Multibrand Cars, Ambala City."
  }
};

export default function SellLayout({ children }: { children: React.ReactNode }) {
  return children;
}
