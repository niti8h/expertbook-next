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
  services: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
    </svg>
  ),
  bookings: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
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

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
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
          if (userRole !== "provider") {
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
                src={`${process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.expertbook.in"}${settings.site_logo}`} 
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
            <Link href="/provider" className={`${styles.navItem} ${pathname === "/provider" ? styles.navItemActive : ""}`}>
              <span className={styles.navIcon}>{Icons.dashboard}</span>
              Dashboard
            </Link>
            <Link href="/provider/profile" className={`${styles.navItem} ${pathname.includes("/profile") ? styles.navItemActive : ""}`}>
              <span className={styles.navIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </span>
              Store Profile
            </Link>
            <Link href="/provider/bookings" className={`${styles.navItem} ${pathname.includes("/bookings") ? styles.navItemActive : ""}`}>
              <span className={styles.navIcon}>{Icons.bookings}</span>
              Bookings
            </Link>
          </div>

          <div className={styles.navSection}>
            <p className={styles.navSectionLabel}>Management</p>
            <Link href="/provider/services" className={`${styles.navItem} ${pathname.includes("/services") ? styles.navItemActive : ""}`}>
              <span className={styles.navIcon}>{Icons.services}</span>
              Services
            </Link>
            <Link href="/provider/portfolio" className={`${styles.navItem} ${pathname.includes("/portfolio") ? styles.navItemActive : ""}`}>
              <span className={styles.navIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </span>
              Portfolio
            </Link>
            <Link href="/provider/reviews" className={`${styles.navItem} ${pathname.includes("/reviews") ? styles.navItemActive : ""}`}>
              <span className={styles.navIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </span>
              Reviews
            </Link>
          </div>

          <div className={styles.navSection}>
            <p className={styles.navSectionLabel}>Finance</p>
            <Link href="/provider/wallet" className={`${styles.navItem} ${pathname.includes("/wallet") ? styles.navItemActive : ""}`}>
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
        <Link href="/provider" className={`${styles.bottomNavItem} ${pathname === "/provider" ? styles.bottomNavItemActive : ""}`}>
          <span className={styles.bottomNavIcon}>{Icons.dashboard}</span>
          <span>Home</span>
        </Link>
        <Link href="/provider/bookings" className={`${styles.bottomNavItem} ${pathname.includes("/bookings") ? styles.bottomNavItemActive : ""}`}>
          <span className={styles.bottomNavIcon}>{Icons.bookings}</span>
          <span>Bookings</span>
        </Link>
        <Link href="/provider/wallet" className={`${styles.bottomNavItem} ${pathname.includes("/wallet") ? styles.bottomNavItemActive : ""}`}>
          <span className={styles.bottomNavIcon}>{Icons.wallet}</span>
          <span>Wallet</span>
        </Link>
        <Link href="/provider/profile" className={`${styles.bottomNavItem} ${pathname.includes("/profile") ? styles.bottomNavItemActive : ""}`}>
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
