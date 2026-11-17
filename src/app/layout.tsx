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
    default: "BRK Estates — Find Your Perfect Property",
    template: "%s | BRK Estates",
  },
  description:
    "Browse apartments, villas, open plots and farm land with BRK Estates — trusted real estate listings with transparent pricing and verified properties.",
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    siteName: "BRK Estates",
    url: "/",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "BRK Estates — Find Your Perfect Property",
    description:
      "Browse apartments, villas, open plots and farm land with BRK Estates — trusted real estate listings with transparent pricing and verified properties.",
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
  themeColor: "#1b5e3a",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "BRK Estates",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://brkestates.com",
  logo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://brkestates.com"}/brand/logo.png`,
  areaServed: "IN",
  // TODO: replace with BRK Estates' real contact number before launch.
  telephone: "+91 00000 00000",
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
