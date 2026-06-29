"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import styles from "../dashboard.module.css";
import { api } from "@/lib/api";
import { useSettings } from "@/components/ui/SettingsContext";

const Icons = {
  dashboard: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  products: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>
      <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
    </svg>
  ),
  services: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
    </svg>
  ),
  wallet: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  logout: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  )
};

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const settings = useSettings();

  useEffect(() => {
    const fetchUserRole = async () => {
      const token = localStorage.getItem("auth-token");
      if (!token) {
        router.push("/login");
        return;
      }
      try {
        const res = await api("/auth/me", { token });
        if (res.status === 200) {
          const userRole = res.data.data.role.slug;
          if (userRole !== "vendor") {
            router.push("/");
            return;
          }
          setRole(userRole);
        } else {
          router.push("/login");
        }
      } catch (e) {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchUserRole();
  }, [router]);

  if (loading) {
    return <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center" }}>Loading Dashboard...</div>;
  }

  const handleLogout = () => {
    localStorage.removeItem("auth-token");
    window.location.href = "/login";
  };

  return (
    <div className={styles.dashLayout}>
      {/* Desktop Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link href="/" className={styles.sidebarLogo}>
            {settings.site_logo ? (
              <img 
                src={`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}${settings.site_logo}`} 
                alt={settings.site_name || "MarketSphere"} 
                style={{ maxHeight: "32px", objectFit: "contain" }}
              />
            ) : (
              <div className={styles.sidebarLogoIcon}>{settings.site_name ? settings.site_name.substring(0, 2).toUpperCase() : "MS"}</div>
            )}
            {settings.site_name || "MarketSphere"}
          </Link>
        </div>
        <nav className={styles.sidebarNav}>
          <div className={styles.navSection}>
            <p className={styles.navSectionLabel}>Overview</p>
            <Link href="/vendor" className={`${styles.navItem} ${pathname === "/vendor" ? styles.navItemActive : ""}`}>
              <span className={styles.navIcon}>{Icons.dashboard}</span>
              Dashboard
            </Link>
            <Link href="/vendor/profile" className={`${styles.navItem} ${pathname.includes("/profile") ? styles.navItemActive : ""}`}>
              <span className={styles.navIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </span>
              Store Profile
            </Link>
            <Link href="/vendor/orders" className={`${styles.navItem} ${pathname.includes("/orders") ? styles.navItemActive : ""}`}>
              <span className={styles.navIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              </span>
              Orders
            </Link>
          </div>

          <div className={styles.navSection}>
            <p className={styles.navSectionLabel}>Store</p>
            <Link href="/vendor/products" className={`${styles.navItem} ${pathname.includes("/products") ? styles.navItemActive : ""}`}>
              <span className={styles.navIcon}>{Icons.products}</span>
              Products
            </Link>
            <Link href="/vendor/portfolio" className={`${styles.navItem} ${pathname.includes("/portfolio") ? styles.navItemActive : ""}`}>
              <span className={styles.navIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </span>
              Portfolio
            </Link>
            <Link href="/vendor/reviews" className={`${styles.navItem} ${pathname.includes("/reviews") ? styles.navItemActive : ""}`}>
              <span className={styles.navIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </span>
              Reviews
            </Link>
          </div>

          <div className={styles.navSection}>
            <p className={styles.navSectionLabel}>Finance</p>
            <Link href="/vendor/wallet" className={`${styles.navItem} ${pathname.includes("/wallet") ? styles.navItemActive : ""}`}>
              <span className={styles.navIcon}>{Icons.wallet}</span>
              Wallet
            </Link>
          </div>
          
          <div className={styles.navSection}>
            <p className={styles.navSectionLabel}>System</p>
            <button 
              className={styles.navItem} 
              onClick={handleLogout}
              style={{ color: "var(--danger)", cursor: "pointer", background: "none", border: "none", width: "100%", textAlign: "left" }}
            >
              <span className={styles.navIcon}>{Icons.logout}</span>
              Logout
            </button>
          </div>
        </nav>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className={styles.bottomNav}>
        <Link href="/vendor" className={`${styles.bottomNavItem} ${pathname === "/vendor" ? styles.bottomNavItemActive : ""}`}>
          <span className={styles.bottomNavIcon}>{Icons.dashboard}</span>
          <span>Home</span>
        </Link>
        <Link href="/vendor/orders" className={`${styles.bottomNavItem} ${pathname.includes("/orders") ? styles.bottomNavItemActive : ""}`}>
          <span className={styles.bottomNavIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          </span>
          <span>Orders</span>
        </Link>
        <Link href="/vendor/wallet" className={`${styles.bottomNavItem} ${pathname.includes("/wallet") ? styles.bottomNavItemActive : ""}`}>
          <span className={styles.bottomNavIcon}>{Icons.wallet}</span>
          <span>Wallet</span>
        </Link>
        <Link href="/vendor/profile" className={`${styles.bottomNavItem} ${pathname.includes("/profile") ? styles.bottomNavItemActive : ""}`}>
          <span className={styles.bottomNavIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </span>
          <span>Profile</span>
        </Link>
        
        <button onClick={handleLogout} className={styles.bottomNavItem} style={{ border: "none", background: "transparent" }}>
          <span className={styles.bottomNavIcon}>{Icons.logout}</span>
          <span>Logout</span>
        </button>
      </nav>

      {/* Main Content Area */}
      {children}
    </div>
  );
}
