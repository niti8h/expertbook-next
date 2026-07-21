import type { Metadata } from "next";
// import { Inter, DM_Sans } from "next/font/google";
import "./globals.css";

const inter = { variable: "" };
const dmSans = { variable: "" };

import { fetchGlobalSettings } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchGlobalSettings();
  
  const defaultTitle = settings.site_name 
    ? `${settings.site_name} — Products & Services, One Platform` 
    : "Expert Book — Products & Services, One Platform";

  return {
    title: settings.meta_title || defaultTitle,
    description: settings.meta_description || "Discover trusted vendors, premium products, and skilled service providers near you. Buy, sell, and grow with Expert Book.",
    keywords: settings.meta_keywords || "marketplace, vendors, products, services, buy, sell, local services",
    icons: settings.site_favicon ? { icon: `${process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.expertbook.in"}${settings.site_favicon}` } : undefined,
    manifest: "/manifest.json",
    appleWebApp: {
      capable: true,
      title: "Expert Book",
      statusBarStyle: "default",
    },
    themeColor: "#0ea5e9"
  };
}

import LayoutWrapper from "@/components/layout/LayoutWrapper";

import NextTopLoader from "nextjs-toploader";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await fetchGlobalSettings();

  return (
    <html lang="en" className={`${inter.variable} ${dmSans.variable}`}>
      <body>
        <NextTopLoader
          color="#0ea5e9"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #0ea5e9,0 0 5px #0ea5e9"
        />
        <LayoutWrapper settings={settings}>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
