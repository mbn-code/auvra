import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import MobileNav from "@/components/MobileNav";
import LiveToast from "@/components/LiveToast";
import WelcomeModal from "@/components/WelcomeModal";

export const metadata: Metadata = {
  title: {
    default: "Auvra | Premium Archive Sourcing & Curation",
    template: "%s | Auvra"
  },
  description: "Auvra is a premium sourcing concierge. Discover unique archive pieces and one-of-one curated finds from global private collections. Verified quality and authenticity guaranteed.",
  keywords: ["archive fashion", "luxury sourcing", "curated fashion", "vintage designer", "streetwear archive", "Louis Vuitton archive", "Chrome Hearts vintage", "Corteiz", "Arc'teryx", "premium curation"],
  authors: [{ name: "Auvra" }],
  creator: "Auvra",
  publisher: "Auvra",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://auvra.eu",
    siteName: "Auvra",
    title: "Auvra | Premium Archive Sourcing & Curation",
    description: "Expertly curated 1-of-1 luxury and streetwear archive pieces. Real-time sourcing from global collections.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Auvra Archive",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Auvra | Premium Archive Sourcing",
    description: "Expertly curated 1-of-1 luxury and streetwear archive pieces.",
    images: ["/og-image.jpg"],
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  metadataBase: new URL("https://auvra.eu"),
  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Auvra",
    "url": "https://auvra.eu",
    "logo": "https://auvra.eu/og-image.jpg",
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "malthe@mbn-code.dk",
      "contactType": "customer service"
    }
  };

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
      <body className="antialiased selection:bg-black selection:text-white pt-28 pb-20 lg:pb-0">
        <Header />
        {children}
        <Footer />
        <CookieConsent />
        <MobileNav />
        <LiveToast />
        <WelcomeModal />
      </body>
    </html>
  );
}
