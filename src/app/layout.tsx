import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import MobileNav from "@/components/MobileNav";
// LiveToast removed — was displaying fabricated purchase notifications (fake social proof).
// Prohibited under EU Omnibus Directive 2019/2161. See components/LiveToast.tsx.
import WelcomeModal from "@/components/WelcomeModal";
// Analytics import removed here — AnalyticsProvider below handles Vercel Analytics
// and auvraAnalytics, both gated behind cookie consent. See AnalyticsProvider.tsx.
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: {
    default: "Auvra | Premium Archive Sourcing & Curation",
    template: "%s | Auvra"
  },
  description: "Auvra uses advanced neural algorithms to discover rare, unlisted archive pieces. Access direct source links to unique, pre-owned archival items globally with our AI Sourcing.",
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
  verification: {
    other: {
      "p:domain_verify": ["5b79c949fd9e86edb5ce810d299fb80f"],
    },
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
        <Toaster 
          position="top-center" 
          toastOptions={{
            style: {
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'white',
              borderRadius: '9999px',
              padding: '12px 24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            },
            className: 'font-black uppercase tracking-widest text-[10px]'
          }} 
        />
        <Header />
        {children}
        <Footer />
        <CookieConsent />
        <MobileNav />
        {/* LiveToast removed — fake social proof, EU Omnibus Directive 2019/2161 */}
        <WelcomeModal />
        {/* Analytics and auvraAnalytics are loaded inside AnalyticsProvider,
            gated behind cookie consent (GDPR Art. 6(1)(a)). */}
        <AnalyticsProvider />
      </body>
    </html>
  );
}
