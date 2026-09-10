import "./style.css";
import "./brand.css";
import "./trusted-assist.css";
import "./portal.css";
import type { Metadata } from "next";
import PublicQuickLinks from "./PublicQuickLinks";
import PublicBackNavigation from "./components/PublicBackNavigation";
import PublicRegistrationPrefix from "./components/PublicRegistrationPrefix";
import OfficialIdentityStrip from "./components/OfficialIdentityStrip";
import LanguageExperience from "./components/LanguageExperience";
import HomeExperienceEnhancer from "./components/HomeExperienceEnhancer";
import LegalFooter from "./components/LegalFooter";
import PortalExperience from "./components/PortalExperience";
import PortalCopyPolish from "./components/PortalCopyPolish";

const site = "https://www.rohilladrive.com";
const languages={"en-IN":"/en","hi-IN":"/hi","pa-IN":"/pa","kn-IN":"/kn","ta-IN":"/ta","te-IN":"/te","ml-IN":"/ml","mr-IN":"/mr","gu-IN":"/gu","bn-IN":"/bn","or-IN":"/or","ur-IN":"/ur","x-default":"/"};

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: { default: "ROHILLA DRIVE — Complete Vehicle & Mobility Network", template: "%s | ROHILLA DRIVE" },
  description: "Official ROHILLA DRIVE by Rohilla Multibrand Cars, Ambala City. Buy, sell, verify and discover new or pre-owned vehicles and automotive services.",
  applicationName: "ROHILLA DRIVE",
  alternates: { canonical: "/", languages },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    url: `${site}/`,
    siteName: "ROHILLA DRIVE",
    title: "ROHILLA DRIVE — Complete Vehicle & Mobility Network",
    description: "Official website of ROHILLA DRIVE by Rohilla Multibrand Cars. New and pre-owned vehicles, verification, services, Trusted Assist, dealers and automotive partners through one connected network.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ROHILLA DRIVE official website" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ROHILLA DRIVE — Complete Vehicle & Mobility Network",
    description: "Official ROHILLA DRIVE website. Buy, sell, verify and manage the complete vehicle life through one connected network.",
    images: ["/opengraph-image"],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
};

export const viewport = { width: "device-width", initialScale: 1, maximumScale: 1, userScalable: false };

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": ["Organization", "AutomotiveBusiness"],
  "@id": `${site}/#organization`,
  name: "ROHILLA DRIVE",
  alternateName: ["Rohilla Drive", "Rohilla Multibrand Cars", "rohilladrive.com"],
  description: "ROHILLA DRIVE is the official vehicle and mobility network by Rohilla Multibrand Cars in Ambala City, Haryana, connecting new and pre-owned vehicles, verification, automotive services, Trusted Assist and mobility support.",
  url: `${site}/`,
  mainEntityOfPage: `${site}/about`,
  logo: `${site}/icon`,
  telephone: "+91-7015260003",
  contactPoint: [{ "@type": "ContactPoint", telephone: "+91-7015260003", contactType: "customer service", areaServed: "IN", availableLanguage: ["English", "Hindi", "Punjabi"] }],
  areaServed: "India",
  address: { "@type": "PostalAddress", addressLocality: "Ambala City", addressRegion: "Haryana", addressCountry: "IN" },
  knowsAbout: ["new vehicles","pre-owned vehicles","vehicle verification","automotive services","vehicle selling","vehicle mobility","RC transfer","inspection"],
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
    <OfficialIdentityStrip />
    {children}
    <LegalFooter />
    <HomeExperienceEnhancer />
    <LanguageExperience />
    <PublicQuickLinks />
  </body></html>;
}
