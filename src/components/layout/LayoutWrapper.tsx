"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import BottomNav from "./BottomNav";
import { ToastProvider } from "../ui/ToastContext";
import { DialogProvider } from "../ui/DialogContext";

import { ReactIndiaSuiteProvider } from 'react-india-suite';
import { SettingsProvider } from '../ui/SettingsContext';

import PwaInstallPrompt from "../ui/PwaInstallPrompt";

export default function LayoutWrapper({ children, settings = {} }: { children: React.ReactNode, settings?: any }) {
  const pathname = usePathname();
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      document.cookie = `ref=${ref}; path=/; max-age=${60 * 60 * 24 * 30}`; // 30 days
    }
  }, []);
  
  // If we are on the vendor dashboard, admin dashboard, or provider dashboard, do NOT show the global Header/Footer
  const isDashboard = pathname.startsWith("/vendor") || pathname.startsWith("/admin") || pathname.startsWith("/provider");

  return (
    <body style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <SettingsProvider settings={settings}>
        <ReactIndiaSuiteProvider>
          <ToastProvider>
            <DialogProvider>
              <PwaInstallPrompt />
              {!isDashboard && <Header />}
              <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                {children}
              </main>
              {!isDashboard && <Footer />}
              {!isDashboard && <BottomNav />}
            </DialogProvider>
          </ToastProvider>
        </ReactIndiaSuiteProvider>
      </SettingsProvider>
    </body>
  );
}
