import type { Metadata } from "next";
import { Inter, DM_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

import { fetchGlobalSettings } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchGlobalSettings();
  
  const defaultTitle = settings.site_name 
    ? `${settings.site_name} — Products & Services, One Platform` 
    : "MarketSphere — Products & Services, One Platform";

  return {
    title: settings.meta_title || defaultTitle,
    description: settings.meta_description || "Discover trusted vendors, premium products, and skilled service providers near you. Buy, sell, and grow with MarketSphere.",
    keywords: settings.meta_keywords || "marketplace, vendors, products, services, buy, sell, local services",
    icons: settings.site_favicon ? { icon: `${process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.expertbook.in"}${settings.site_favicon}` } : undefined,
  };
}

import LayoutWrapper from "@/components/layout/LayoutWrapper";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await fetchGlobalSettings();

  return (
    <html lang="en" className={`${inter.variable} ${dmSans.variable}`}>
      <LayoutWrapper settings={settings}>
        {children}
      </LayoutWrapper>
    </html>
  );
}
