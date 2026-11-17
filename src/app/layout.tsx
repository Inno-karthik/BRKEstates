import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://brkestates.com"),
  title: {
    default: "BKR Estates — Real Estate in Visakhapatnam | Powered by Prakruti",
    template: "%s | BKR Estates",
  },
  description:
    "Verified plots, apartments, villas and farm land in and around Visakhapatnam — BKR Estates, powered by Prakruti, with 20+ years of local expertise and transparent pricing.",
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    siteName: "BKR Estates",
    url: "/",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "BKR Estates — Real Estate in Visakhapatnam | Powered by Prakruti",
    description:
      "Verified plots, apartments, villas and farm land in and around Visakhapatnam — BKR Estates, powered by Prakruti, with 20+ years of local expertise and transparent pricing.",
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/brand/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/brand/icon-180.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#9b1c1c",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "BKR Estates",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://brkestates.com",
  logo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://brkestates.com"}/brand/logo.png`,
  areaServed: "Visakhapatnam, Andhra Pradesh, IN",
  telephone: "+91 95538 22333",
  email: "bkrestatesvizag@gmail.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "2nd Floor, 47-10-25/1, 2nd Ln, Sagar Nagar, Dwaraka Nagar",
    addressLocality: "Visakhapatnam",
    addressRegion: "Andhra Pradesh",
    postalCode: "530016",
    addressCountry: "IN",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}
    >
      <head>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      </head>
      <body className="min-h-full flex flex-col bg-white">{children}</body>
    </html>
  );
}
