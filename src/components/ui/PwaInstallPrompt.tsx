"use client";
import { useState, useEffect } from "react";

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if user dismissed prompt previously
    if (localStorage.getItem("pwa-prompt-dismissed") === "true") {
      return;
    }

    // Detect if already installed (standalone mode)
    const isStandaloneMode = window.matchMedia("(display-mode: standalone)").matches || 
                             (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);
    if (isStandaloneMode) return;

    // Detect iOS Safari
    const ua = window.navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).EBStream;
    setIsIOS(isIOSDevice);
    
    if (isIOSDevice) {
      // Small delay so it doesn't pop up immediately on first render
      setTimeout(() => setShowPrompt(true), 3000);
    }

    // Handle standard Android/Chrome beforeinstallprompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setShowPrompt(false);
      }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-prompt-dismissed", "true");
  };

  if (!showPrompt) return null;

  return (
    <>
      <div 
        style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)", zIndex: 9998,
          backdropFilter: "blur(2px)", transition: "opacity 0.3s"
        }} 
        onClick={handleDismiss}
      />
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        backgroundColor: "white", padding: "24px 20px",
        borderTopLeftRadius: "24px", borderTopRightRadius: "24px",
        boxShadow: "0 -10px 25px rgba(0,0,0,0.1)",
        zIndex: 9999,
        transform: "translateY(0)",
        transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", marginBottom: "16px" }}>
          <div style={{
            width: "56px", height: "56px", borderRadius: "12px",
            backgroundColor: "var(--brand-600)", color: "white",
            display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center",
            fontSize: "1.5rem", fontWeight: 700, flexShrink: 0
          }}>
            EB
          </div>
          <div>
            <h3 style={{ margin: "0 0 4px 0", fontSize: "1.125rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Install Expert Book
            </h3>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
              Install our app for a faster, full-screen experience directly from your home screen.
            </p>
          </div>
        </div>

        {isIOS ? (
          <div style={{ backgroundColor: "var(--surface-2)", padding: "12px 16px", borderRadius: "12px", marginBottom: "20px" }}>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
              1. Tap the <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg> <b>Share</b> button
            </p>
            <p style={{ margin: "8px 0 0 0", fontSize: "0.875rem", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
              2. Select <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg> <b>Add to Home Screen</b>
            </p>
          </div>
        ) : (
          <button 
            onClick={handleInstallClick}
            style={{
              width: "100%", padding: "14px", backgroundColor: "var(--brand-600)",
              color: "white", border: "none", borderRadius: "12px",
              fontWeight: 600, fontSize: "1rem", cursor: "pointer",
              marginBottom: "12px"
            }}
          >
            Install App
          </button>
        )}

        <button 
          onClick={handleDismiss}
          style={{
            width: "100%", padding: "12px", backgroundColor: "transparent",
            color: "var(--text-secondary)", border: "none",
            fontWeight: 500, fontSize: "0.875rem", cursor: "pointer"
          }}
        >
          Not now, don't show again
        </button>
      </div>
    </>
  );
}
