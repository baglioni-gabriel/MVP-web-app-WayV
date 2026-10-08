import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Wayv — Discover Local Experiences",
    short_name: "Wayv",
    description:
      "A travel social network connecting young travelers with authentic local businesses and events.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0f1e",
    theme_color: "#e2b05d",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
