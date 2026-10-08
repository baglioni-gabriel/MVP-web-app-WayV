import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import { AuthProvider } from "@/lib/context/AuthContext";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: {
    default: "Wayv — Discover Local Experiences",
    template: "%s | Wayv",
  },
  description:
    "A travel social network connecting young exploratory travelers with authentic local businesses and events.",
  keywords: [
    "travel",
    "social network",
    "local experiences",
    "events",
    "explore",
    "tourism",
  ],
  authors: [{ name: "Wayv" }],
  openGraph: {
    title: "Wayv — Discover Local Experiences",
    description:
      "Connect with authentic local businesses and discover hidden gems near you.",
    siteName: "Wayv",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#e2b05d",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body className="font-display">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
