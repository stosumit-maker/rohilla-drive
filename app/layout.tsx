import "./style.css";

export const metadata = {
  title: "ROHILLA DRIVE — Cars & Automobile Network",
  description:
    "Buy, sell, exchange, find cars and access automobile services with ROHILLA DRIVE.",
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
