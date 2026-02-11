import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/cart-context";
import CartPanel from "@/components/CartPanel";
import { CustomerSupportAgent } from "@/components/CustomerSupportAgent";
import AppearanceProvider from "@/components/AppearanceProvider";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Console Zone | Buy, Sell & Rent PS5, Xbox, Switch & PC Gear",
  description: "India's most trusted gaming ecosystem. Buy & Sell New or Pre-owned Consoles, Games, and PC Components. Instant cash, store credit, and premium rentals.",
};

import { VisualsProvider } from "@/context/visuals-context";
import LayoutAnimator from "@/components/layout/LayoutAnimator";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <VisualsProvider>
          <CartProvider>
            <AppearanceProvider>
              <LayoutAnimator>
                <Navbar />
                {children}
                <Footer />
              </LayoutAnimator>
              <CustomerSupportAgent />
              <CartPanel />
            </AppearanceProvider>
          </CartProvider>
        </VisualsProvider>
      </body>
    </html>
  );
}
