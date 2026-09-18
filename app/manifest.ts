import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ROHILLA DRIVE",
    short_name: "ROHILLA DRIVE",
    description:
      "Cars, vehicle selling, automotive services and assistance from ROHILLA DRIVE by Rohilla Multibrand Cars.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0b1220",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
