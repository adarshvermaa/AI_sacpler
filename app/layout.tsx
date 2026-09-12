import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AlphaScalper | High-Frequency AI Crypto Scalper",
  description: "Institutional-grade AI Scalper for Crypto Futures and Options trading with CoinDCX API.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#07090e] text-slate-100 min-h-screen antialiased selection:bg-cyan-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
