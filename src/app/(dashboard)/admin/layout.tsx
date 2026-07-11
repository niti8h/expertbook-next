"use client";
import { getImageUrl } from "../../../lib/utils";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import styles from "../dashboard.module.css";
import { api } from "@/lib/api";
import { useSettings } from "@/components/ui/SettingsContext";

const Icons = {
  dashboard: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  users: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  orders: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  ),
  withdrawals: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
    </svg>
  ),
  categories: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  ),
  settings: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  ),
  logout: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  )
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
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
          const u = res.data.data;
          if (u.role?.slug !== "admin") {
            router.push("/");
            return;
          }
          setUser(u);
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
    return <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center" }}>Loading Admin Dashboard...</div>;
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
                src={getImageUrl(settings.site_logo)} 
                alt={settings.site_name || "Expert Book"} 
                style={{ maxHeight: "32px", objectFit: "contain" }}
              />
            ) : (
              <div className={styles.sidebarLogoIcon}>{settings.site_name ? settings.site_name.substring(0, 2).toUpperCase() : "EB"}</div>
            )}
            {settings.site_name || "Expert Book"}
          </Link>
        </div>

        <nav className={styles.sidebarNav}>
          <div className={styles.navSection}>
            <p className={styles.navSectionLabel}>Overview</p>
            <Link href="/admin" className={`${styles.navItem} ${pathname === "/admin" ? styles.navItemActive : ""}`}>
              <span className={styles.navIcon}>{Icons.dashboard}</span>
              Dashboard
            </Link>
          </div>

          <div className={styles.navSection}>
            <p className={styles.navSectionLabel}>User Management</p>
            <Link href="/admin/users" className={`${styles.navItem} ${pathname.includes("/admin/users") ? styles.navItemActive : ""}`}>
              <span className={styles.navIcon}>{Icons.users}</span>
              All Users
            </Link>
          </div>

          <div className={styles.navSection}>
            <p className={styles.navSectionLabel}>Commerce</p>
            <Link href="/admin/orders" className={`${styles.navItem} ${pathname.includes("/admin/orders") ? styles.navItemActive : ""}`}>
              <span className={styles.navIcon}>{Icons.orders}</span>
              Orders
            </Link>
            <Link href="/admin/withdrawals" className={`${styles.navItem} ${pathname.includes("/admin/withdrawals") ? styles.navItemActive : ""}`}>
              <span className={styles.navIcon}>{Icons.withdrawals}</span>
              Withdrawals
            </Link>
            <Link href="/admin/categories" className={`${styles.navItem} ${pathname.includes("/admin/categories") ? styles.navItemActive : ""}`}>
              <span className={styles.navIcon}>{Icons.categories}</span>
              Categories
            </Link>
          </div>

          <div className={styles.navSection}>
            <p className={styles.navSectionLabel}>System</p>
            <Link href="/admin/settings" className={`${styles.navItem} ${pathname.includes("/admin/settings") ? styles.navItemActive : ""}`}>
              <span className={styles.navIcon}>{Icons.settings}</span>
              Settings
            </Link>
            <button 
              onClick={handleLogout}
              className={styles.navItem} 
              style={{ background: "none", border: "none", width: "100%", cursor: "pointer", color: "var(--danger-600)" }}
            >
              <span className={styles.navIcon} style={{ color: "var(--danger-600)" }}>{Icons.logout}</span>
              Logout
            </button>
          </div>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userCard}>
            <div className={styles.userAvatar}>
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>{user?.name}</div>
              <div className={styles.userRole}>Administrator</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content wrapper */}
      {children}

      {/* Mobile Bottom Navigation */}
      <nav className={styles.bottomNav}>
        <Link href="/admin/dashboard" className={`${styles.bottomNavItem} ${pathname === "/admin/dashboard" ? styles.bottomNavItemActive : ""}`}>
          <span className={styles.bottomNavIcon}>{Icons.dashboard}</span>
          Home
        </Link>
        <Link href="/admin/orders" className={`${styles.bottomNavItem} ${pathname.startsWith("/admin/orders") ? styles.bottomNavItemActive : ""}`}>
          <span className={styles.bottomNavIcon}>{Icons.orders}</span>
          Orders
        </Link>
        <Link href="/admin/users" className={`${styles.bottomNavItem} ${pathname.startsWith("/admin/users") ? styles.bottomNavItemActive : ""}`}>
          <span className={styles.bottomNavIcon}>{Icons.users}</span>
          Users
        </Link>
        <Link href="/admin/settings" className={`${styles.bottomNavItem} ${pathname.startsWith("/admin/settings") ? styles.bottomNavItemActive : ""}`}>
          <span className={styles.bottomNavIcon}>{Icons.settings}</span>
          Settings
        </Link>
        <button onClick={handleLogout} className={styles.bottomNavItem} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <span className={styles.bottomNavIcon} style={{ color: "var(--danger-600)" }}>{Icons.logout}</span>
          Logout
        </button>
      </nav>
    </div>
  );
}
