"use client";

import Link from "next/link";
import { useSettings } from "../ui/SettingsContext";

export default function Footer() {
  const settings = useSettings();
  
  return (
    <footer style={{ 
      backgroundColor: "var(--surface-1)", 
      borderTop: "1px solid var(--border-light)",
      padding: "60px 40px",
      marginTop: "auto"
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "40px" }}>
        <div>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "1.25rem", fontWeight: 700, letterSpacing: "-0.5px", color: "var(--text-primary)", textDecoration: "none", marginBottom: "16px" }}>
            {settings.site_logo ? (
              <img 
                src={`${process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.expertbook.in"}${settings.site_logo}`} 
                alt={settings.site_name || "Expert Book"} 
                style={{ maxHeight: "24px", objectFit: "contain" }}
              />
            ) : (
              <div style={{ width: "24px", height: "24px", background: "var(--brand-600)", color: "white", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem" }}>
                {settings.site_name ? settings.site_name.substring(0, 2).toUpperCase() : "EB"}
              </div>
            )}
            {settings.site_name || "Expert Book"}
          </Link>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.6 }}>
            The premium destination for exclusive products and professional services.
          </p>
        </div>
        
        <div>
          <h4 style={{ fontWeight: 600, marginBottom: "16px", fontSize: "0.938rem" }}>Shop</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
            <li><Link href="/products" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.875rem" }}>All Products</Link></li>
            <li><Link href="/services" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.875rem" }}>All Services</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontWeight: 600, marginBottom: "16px", fontSize: "0.938rem" }}>Vendors</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
            <li><Link href="/register" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.875rem" }}>Become a Seller</Link></li>
            <li><Link href="/login" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.875rem" }}>Vendor Login</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontWeight: 600, marginBottom: "16px", fontSize: "0.938rem" }}>Legal</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
            <li><Link href="/privacy" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.875rem" }}>Privacy Policy</Link></li>
            <li><Link href="/terms" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.875rem" }}>Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      <div style={{ maxWidth: "1200px", margin: "40px auto 0", paddingTop: "24px", borderTop: "1px solid var(--border-light)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "0.813rem" }}>
          &copy; {new Date().getFullYear()} {settings.site_name || "Expert Book"}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
