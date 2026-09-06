import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vehicle Verification",
  description:
    "Request vehicle verification with ROHILLA DRIVE for available RC, challan, insurance, PUC, finance and compliance records before you buy.",
  alternates: {
    canonical: "https://www.rohilladrive.com/verify",
  },
  openGraph: {
    title: "Vehicle Verification | ROHILLA DRIVE",
    description:
      "Request a structured vehicle verification using available official and compliance records before purchase.",
    url: "https://www.rohilladrive.com/verify",
    type: "website",
  },
};

export default function VerifyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
