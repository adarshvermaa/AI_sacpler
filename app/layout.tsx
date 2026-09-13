import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#07090e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://alphascalper.ai"),
  title: {
    default: "AlphaScalper | High-Frequency AI Crypto Scalper & HFT Engine",
    template: "%s | AlphaScalper",
  },
  description:
    "Institutional-grade autonomous AI Scalper for Crypto Futures and Options with CoinDCX API. Sub-millisecond execution, 1m/5m/15m multi-timeframe confluence, and real-equity protection.",
  keywords: [
    "AI Crypto Trading",
    "Crypto Scalper Bot",
    "CoinDCX Futures Scalper",
    "HFT Algorithmic Trading",
    "Multi-Timeframe Technical Analysis",
    "Order Book Imbalance",
    "Cryptocurrency High Frequency Trading",
    "Real-Equity Risk Management",
    "Kelly Criterion Crypto",
  ],
  authors: [{ name: "AlphaScalper Quant Systems" }],
  creator: "AlphaScalper AI",
  publisher: "AlphaScalper",
  applicationName: "AlphaScalper",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "AlphaScalper | High-Frequency AI Crypto Scalper & HFT Engine",
    description:
      "Sub-millisecond autonomous crypto futures & options scalping engine powered by multi-timeframe price action confluence and live CoinDCX API integration.",
    url: "https://alphascalper.ai",
    siteName: "AlphaScalper",
    images: [
      {
        url: "/logo.svg",
        width: 400,
        height: 100,
        alt: "AlphaScalper Institutional AI Engine",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AlphaScalper | High-Frequency AI Crypto Scalper",
    description:
      "Autonomous sub-millisecond AI scalping engine for Crypto Futures with real-equity capital protection.",
    creator: "@alphascalper_ai",
    images: ["/logo.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "AlphaScalper",
    operatingSystem: "Web, Cloud, Linux",
    applicationCategory: "FinancialApplication",
    description:
      "Institutional-grade autonomous AI Scalper for Crypto Futures and Options trading with CoinDCX API.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Sub-millisecond algorithmic execution",
      "1m/5m/15m Multi-Timeframe Candlestick & Price Action Confluence",
      "Real-time CoinDCX Futures Webhook Integration",
      "Dynamic Fractional Kelly Risk Management & Capital Protection Floor",
      "Order Book Imbalance (OBI) & Micro-Price Detection",
    ],
  };

  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-[#07090e] text-slate-100 min-h-screen antialiased selection:bg-cyan-500 selection:text-black overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
