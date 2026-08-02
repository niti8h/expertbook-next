"use client";
import { getImageUrl } from "../../lib/utils";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "./layout.module.css";
import { api } from "@/lib/api";
import { useSettings } from "../ui/SettingsContext";

export default function Header() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const settings = useSettings();
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("auth-token");
    if (token) {
      setIsLoggedIn(true);
      fetchUser(token);
    }
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchUser = async (token: string) => {
    try {
      const res = await api("/auth/me", { token });
      if (res.status === 200) {
        setUser(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth-token");
    setIsLoggedIn(false);
    setUser(null);
    setIsProfileDropdownOpen(false);
    router.push("/login");
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navInner}>
        <Link href="/" className={styles.logo}>
          {settings.site_logo ? (
            <img 
              src={getImageUrl(settings.site_logo)} 
              alt={settings.site_name || "Expert Book"} 
              style={{ maxHeight: "32px", objectFit: "contain" }}
            />
          ) : (
            <div className={styles.logoIcon}>{settings.site_name ? settings.site_name.substring(0, 2).toUpperCase() : "EB"}</div>
          )}
          {settings.site_name || "Expert Book"}
        </Link>

        {/* Desktop Links */}
        <div className={`${styles.navLinks} ${styles.hideMobile}`}>
          <Link href="/categories" className={styles.navLink}>Categories</Link>
          <Link href="/products" className={styles.navLink}>Products</Link>
          <Link href="/services" className={styles.navLink}>Services</Link>
          <Link href="/article" className={styles.navLink}>Articles</Link>
        </div>

        {/* Desktop Right */}
        <div className={`${styles.navRight} ${styles.hideMobile}`}>
          {isLoggedIn ? (
            <div className={styles.profileDropdownContainer} ref={dropdownRef} style={{ position: "relative" }}>
              <button 
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                style={{ 
                  display: "flex", alignItems: "center", gap: "8px", 
                  background: "none", border: "1px solid var(--border-light)", 
                  padding: "4px 12px 4px 4px", borderRadius: "100px",
                  cursor: "pointer", transition: "box-shadow 0.2s"
                }}
                className={isProfileDropdownOpen ? styles.activeDropdown : ""}
              >
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "var(--brand-600)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: "0.875rem" }}>
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--text-primary)" }}>
                  {user?.name ? user.name.split(" ")[0] : "Profile"}
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: isProfileDropdownOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>

              {isProfileDropdownOpen && (
                <div style={{ 
                  position: "absolute", top: "calc(100% + 8px)", right: 0, 
                  width: "240px", backgroundColor: "white", borderRadius: "var(--radius-md)",
                  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
                  border: "1px solid var(--border-light)", zIndex: 100, overflow: "hidden"
                }}>
                  <div style={{ padding: "16px", borderBottom: "1px solid var(--border-light)" }}>
                    <p style={{ margin: 0, fontWeight: 600, color: "var(--text-primary)", fontSize: "0.938rem" }}>{user?.name || "User"}</p>
                    <p style={{ margin: "4px 0 0 0", color: "var(--text-muted)", fontSize: "0.813rem" }}>{user?.email || ""}</p>
                  </div>
                  
                  <div style={{ padding: "8px 0" }}>
                    <p style={{ padding: "8px 16px", margin: 0, fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>My Account</p>
                    <Link href="/user/orders" style={{ display: "block", padding: "10px 16px", color: "var(--text-primary)", textDecoration: "none", fontSize: "0.875rem" }} onClick={() => setIsProfileDropdownOpen(false)}>Order History</Link>
                    <Link href="/user/addresses" style={{ display: "block", padding: "10px 16px", color: "var(--text-primary)", textDecoration: "none", fontSize: "0.875rem" }} onClick={() => setIsProfileDropdownOpen(false)}>Saved Addresses</Link>
                    <Link href="/user/refer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", color: "var(--text-primary)", textDecoration: "none", fontSize: "0.875rem" }} onClick={() => setIsProfileDropdownOpen(false)}>
                      <span>Refer & Earn</span>
                      <span style={{ fontSize: "0.65rem", backgroundColor: "rgba(34, 197, 94, 0.1)", color: "rgb(34, 197, 94)", padding: "2px 6px", borderRadius: "10px", fontWeight: 700 }}>NEW</span>
                    </Link>
                    <Link href="/user/wallet" style={{ display: "block", padding: "10px 16px", color: "var(--text-primary)", textDecoration: "none", fontSize: "0.875rem" }} onClick={() => setIsProfileDropdownOpen(false)}>Wallet & Payouts</Link>
                  </div>

                  <div style={{ borderTop: "1px solid var(--border-light)", padding: "8px 0" }}>
                    <p style={{ padding: "8px 16px", margin: 0, fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Store Management</p>
                    <Link
                      href="/user/seller-orders"
                      style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 16px", color: "var(--text-primary)", textDecoration: "none", fontSize: "0.875rem" }}
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <path d="M16 10a4 4 0 0 1-8 0"></path>
                      </svg>
                      Store Orders
                    </Link>
                    <Link
                      href="/user/products"
                      style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 16px", color: "var(--text-primary)", textDecoration: "none", fontSize: "0.875rem" }}
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                      </svg>
                      My Products
                    </Link>
                    <Link
                      href="/user/services"
                      style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 16px", color: "var(--text-primary)", textDecoration: "none", fontSize: "0.875rem" }}
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                      My Services
                    </Link>
                  </div>

                  <div style={{ borderTop: "1px solid var(--border-light)", padding: "8px 0" }}>
                    <Link href="/user/wishlist" style={{ display: "block", padding: "10px 16px", color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.875rem", borderBottom: "1px solid var(--border-light)" }}>Wishlist</Link>
                    <button 
                      onClick={handleLogout} 
                      style={{ width: "100%", textAlign: "left", padding: "10px 16px", background: "none", border: "none", color: "var(--danger)", fontSize: "0.875rem", cursor: "pointer" }}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className={styles.navSignIn}>Sign In</Link>
              <Link href="/register" className="btn-primary" style={{ padding: "8px 24px", textDecoration: "none", fontSize: "0.875rem" }}>
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          className={`${styles.menuToggle} ${styles.hideDesktop}`} 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          <span style={{ transform: isMobileMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }}></span>
          <span style={{ opacity: isMobileMenuOpen ? 0 : 1 }}></span>
          <span style={{ transform: isMobileMenuOpen ? 'rotate(-45deg) translate(7px, -6px)' : 'none' }}></span>
        </button>
      </div>

      {/* Mobile Menu Slide-out */}
      {isMobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <div className={styles.mobileNavLinks}>
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>

            <Link href="/categories" onClick={() => setIsMobileMenuOpen(false)}>Categories</Link>
            <Link href="/products" onClick={() => setIsMobileMenuOpen(false)}>Products</Link>
            <Link href="/services" onClick={() => setIsMobileMenuOpen(false)}>Services</Link>
            <Link href="/article" onClick={() => setIsMobileMenuOpen(false)}>Articles</Link>
          </div>
          <div className={styles.mobileNavActions}>
            {isLoggedIn ? (
              <>
                <Link href="/user/orders" className="btn-secondary" style={{ display: "block", textAlign: "center", padding: "12px", marginBottom: "12px", textDecoration: "none" }} onClick={() => setIsMobileMenuOpen(false)}>My Orders</Link>
                <Link href="/user/wishlist" className="btn-secondary" style={{ display: "block", textAlign: "center", padding: "12px", marginBottom: "12px", textDecoration: "none" }} onClick={() => setIsMobileMenuOpen(false)}>Wishlist</Link>
                <Link href="/user/wallet" className="btn-secondary" style={{ display: "block", textAlign: "center", padding: "12px", marginBottom: "12px", textDecoration: "none" }} onClick={() => setIsMobileMenuOpen(false)}>Wallet & Payouts</Link>
                <Link href="/user/seller-orders" className="btn-secondary" style={{ display: "block", textAlign: "center", padding: "12px", marginBottom: "12px", textDecoration: "none" }} onClick={() => setIsMobileMenuOpen(false)}>Store Orders</Link>
                <Link href="/user/products" className="btn-secondary" style={{ display: "block", textAlign: "center", padding: "12px", marginBottom: "12px", textDecoration: "none" }} onClick={() => setIsMobileMenuOpen(false)}>My Products</Link>
                <Link href="/user/services" className="btn-secondary" style={{ display: "block", textAlign: "center", padding: "12px", marginBottom: "12px", textDecoration: "none" }} onClick={() => setIsMobileMenuOpen(false)}>My Services</Link>
                <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="btn-secondary" style={{ width: "100%", padding: "12px", fontSize: "1rem", color: "var(--danger)", border: "1px solid var(--danger)" }}>Logout</button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-secondary" onClick={() => setIsMobileMenuOpen(false)} style={{ display: "block", textAlign: "center", padding: "12px" }}>Sign In</Link>
                <Link href="/register" className="btn-primary" onClick={() => setIsMobileMenuOpen(false)} style={{ display: "block", textAlign: "center", padding: "12px", textDecoration: "none" }}>Create Account</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
