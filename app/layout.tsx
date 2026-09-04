import "./style.css";
import "./brand.css";
import "./trusted-assist.css";

export const metadata = {
  title: "ROHILLA DRIVE — One Platform for the Entire Vehicle Life",
  description:
    "Buy, verify, drive, maintain, protect and sell through the ROHILLA DRIVE automobile network.",
  manifest: "/manifest.webmanifest",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
