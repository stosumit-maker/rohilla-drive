import "./style.css";
import "./brand.css";
import "./trusted-assist.css";
import "./portal.css";
import "./production-polish.css";
import type { Metadata } from "next";
import PublicQuickLinks from "./PublicQuickLinks";
import PublicBackNavigation from "./components/PublicBackNavigation";
import PublicRegistrationPrefix from "./components/PublicRegistrationPrefix";
import LanguageExperience from "./components/LanguageExperience";
import HomeExperienceEnhancer from "./components/HomeExperienceEnhancer";
import LegalFooter from "./components/LegalFooter";
import PortalExperience from "./components/PortalExperience";
import PortalCopyPolish from "./components/PortalCopyPolish";

const site = "https://www.rohilladrive.com";
const languages={"en-IN":"/en","hi-IN":"/hi","pa-IN":"/pa","kn-IN":"/kn","ta-IN":"/ta","te-IN":"/te","ml-IN":"/ml","mr-IN":"/mr","gu-IN":"/gu","bn-IN":"/bn","or-IN":"/or","ur-IN":"/ur","x-default":"/"};

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: { default: "ROHILLA DRIVE | Cars, Automotive Services & Vehicle Assistance", template: "%s | ROHILLA DRIVE" },
  description: "ROHILLA DRIVE by Rohilla Multibrand Cars, Ambala City — used and new car enquiries, vehicle selling, inspection, repair, detailing, RC/RTO, finance, insurance, roadside, tyres/battery and wider automotive assistance across Haryana, Chandigarh and nearby regional markets.",
  applicationName: "ROHILLA DRIVE",
  alternates: { canonical: "/", languages },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    url: `${site}/`,
    siteName: "ROHILLA DRIVE",
    title: "ROHILLA DRIVE | Cars & Automotive Services Network",
    description: "Cars, buying and selling, new-vehicle assistance, inspection, repair, RC/RTO, finance, insurance, roadside and connected automotive services from ROHILLA DRIVE.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ROHILLA DRIVE official website" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ROHILLA DRIVE | Cars & Automotive Services Network",
    description: "Vehicle buying, selling, new-car assistance, inspection, repair, detailing, RC/RTO, finance, insurance and mobility support from ROHILLA DRIVE.",
    images: ["/opengraph-image"],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
};

export const viewport = { width: "device-width", initialScale: 1, maximumScale: 5, userScalable: true };

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": ["Organization", "AutomotiveBusiness", "AutoDealer"],
  "@id": `${site}/#organization`,
  name: "ROHILLA DRIVE",
  alternateName: ["Rohilla Drive", "Rohilla Multibrand Cars", "rohilladrive.com"],
  description: "ROHILLA DRIVE is the vehicle and mobility network by Rohilla Multibrand Cars in Ambala City, Haryana, connecting new and pre-owned vehicles, selling, inspection, repairs, detailing, RC/RTO assistance, finance and insurance requirements, roadside support, Trusted Assist and mobility services.",
  url: `${site}/`,
  mainEntityOfPage: `${site}/about`,
  logo: `${site}/icon`,
  telephone: "+91-7015260003",
  contactPoint: [{ "@type": "ContactPoint", telephone: "+91-7015260003", contactType: "customer service", areaServed: "IN", availableLanguage: ["English", "Hindi", "Punjabi"] }],
  areaServed: [{"@type":"City","name":"Ambala"},{"@type":"AdministrativeArea","name":"Haryana"},{"@type":"AdministrativeArea","name":"Chandigarh"},{"@type":"AdministrativeArea","name":"Punjab"},{"@type":"AdministrativeArea","name":"Rajasthan"},{"@type":"Country","name":"India"}],
  address: { "@type": "PostalAddress", addressLocality: "Ambala City", addressRegion: "Haryana", addressCountry: "IN" },
  knowsAbout: ["used cars","second hand cars","new cars","vehicle selling","car service","car repair","car inspection","car detailing","RC transfer","RTO assistance","car finance","car insurance","roadside assistance","car tyres","car battery","EV services","vehicle logistics","self-drive rental","vehicle verification","automotive services","vehicle mobility"],
  sameAs: [
    "https://www.instagram.com/rohillamultibrandcars/",
    "https://www.facebook.com/profile.php?id=100094277025442",
    "https://youtube.com/@sumitrohilla983",
    "https://github.com/stosumit-maker/rohilla-drive"
  ],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${site}/#website`,
  url: `${site}/`,
  name: "ROHILLA DRIVE",
  alternateName: ["Rohilla Drive", "Rohilla Multibrand Cars", "rohilladrive.com"],
  publisher: { "@id": `${site}/#organization` },
  inLanguage: ["en-IN", "hi-IN", "pa-IN", "kn-IN", "ta-IN", "te-IN", "ml-IN", "mr-IN", "gu-IN", "bn-IN", "or-IN", "ur-IN"],
  potentialAction: {
    "@type": "SearchAction",
    target: `${site}/inventory?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
    <PortalExperience />
    <PortalCopyPolish />
    <PublicBackNavigation />
    <PublicRegistrationPrefix />
    {children}
    <LegalFooter />
    <HomeExperienceEnhancer />
    <LanguageExperience />
    <PublicQuickLinks />
  </body></html>;
}
