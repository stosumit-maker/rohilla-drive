import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sell Your Vehicle Online | ROHILLA DRIVE",
  description:
    "Sell or list your car, bike, commercial vehicle, tractor or EV with ROHILLA DRIVE. Submit your vehicle details for review and next-step assistance.",
  alternates: {
    canonical: "https://www.rohilladrive.com/sell",
  },
  openGraph: {
    title: "Sell Your Vehicle | ROHILLA DRIVE",
    description:
      "Submit your vehicle details to ROHILLA DRIVE for listing, pricing guidance and next-step assistance.",
    url: "https://www.rohilladrive.com/sell",
    type: "website",
  },
};

export default function SellLayout({ children }: { children: React.ReactNode }) {
  return children;
}
