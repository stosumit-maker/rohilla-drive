import "./style.css";
import "./brand.css";
import "./trusted-assist.css";
import type { Metadata } from "next";
import PublicQuickLinks from "./PublicQuickLinks";
import LanguageExperience from "./components/LanguageExperience";

const site = "https://www.rohilladrive.com";
const languages={"en-IN":"/en","hi-IN":"/hi","pa-IN":"/pa","kn-IN":"/kn","ta-IN":"/ta","te-IN":"/te","ml-IN":"/ml","mr-IN":"/mr","gu-IN":"/gu","bn-IN":"/bn","or-IN":"/or","ur-IN":"/ur","x-default":"/"};

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: {
    default: "ROHILLA DRIVE — Complete Vehicle & Mobility Network",
    template: "%s | ROHILLA DRIVE",
  },
  description:
    "Buy, sell, verify, maintain, protect and manage vehicles through ROHILLA DRIVE in Ambala City and the growing Rohilla automotive network.",
  applicationName: "ROHILLA DRIVE",
  alternates: { canonical: "/", languages },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    url: site,
    siteName: "ROHILLA DRIVE",
    title: "ROHILLA DRIVE — Complete Vehicle & Mobility Network",
    description:
      "New and pre-owned vehicles, verification, services, Trusted Assist, dealers and automotive partners through one connected network.",
    images: [{ url: "/rohilla-drive-logo.svg", alt: "ROHILLA DRIVE" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ROHILLA DRIVE — Complete Vehicle & Mobility Network",
    description:
      "Buy, sell, verify and manage the complete vehicle life through Rohilla Drive.",
    images: ["/rohilla-drive-logo.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": ["Organization", "AutomotiveBusiness"],
  name: "ROHILLA DRIVE",
  alternateName: "Rohilla Multibrand Cars",
  url: site,
  logo: `${site}/rohilla-drive-logo.svg`,
  telephone: "+91-7015260003",
  areaServed: "India",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Ambala City",
    addressRegion: "Haryana",
    addressCountry: "IN",
  },
  sameAs: [
    "https://www.instagram.com/rohillamultibrandcars/",
    "https://youtube.com/shorts/hqYTgiIaEko",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {children}
        <LanguageExperience />
        <PublicQuickLinks />
      </body>
    </html>
  );
}
