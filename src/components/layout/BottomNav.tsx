"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function BottomNav() {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isMobile) return null;

  const isActive = (path: string) => {
    if (path === "/" && pathname !== "/") return false;
    return pathname.startsWith(path);
  };

  const navItems = [
    {
      name: "Wishlist",
      path: "/user/wishlist",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={isActive("/user/wishlist") ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isActive("/user/wishlist") ? "0" : "1.75"} strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      )
    },
    {
      name: "Shop",
      path: "/products",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={isActive("/products") ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isActive("/products") ? "0" : "1.75"} strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
      )
    },
    {
      name: "Services",
      path: "/services",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={isActive("/services") ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isActive("/services") ? "0" : "1.75"} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      )
    },
    {
      name: "Articles",
      path: "/article",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={isActive("/article") ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isActive("/article") ? "0" : "1.75"} strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      )
    },
    {
      name: "Orders",
      path: "/user/orders",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={isActive("/user/orders") ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isActive("/user/orders") ? "0" : "1.75"} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      )
    },
    {
      name: "Earn",
      path: "/user/refer",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={isActive("/user/refer") ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isActive("/user/refer") ? "0" : "1.75"} strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="8.5" cy="7" r="4"></circle>
          <polyline points="17 11 19 13 23 9"></polyline>
        </svg>
      )
    }
  ];

  return (
    <>
      <div style={{ height: "90px", width: "100%" }} className="hideDesktop" />
      
      <div style={{
        position: "fixed",
        bottom: "env(safe-area-inset-bottom, 20px)",
        left: "16px",
        right: "16px",
        backgroundColor: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderRadius: "100px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 16px",
        zIndex: 999,
        boxShadow: "0 12px 36px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.05)",
        border: "1px solid rgba(255, 255, 255, 0.6)",
        transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      }} className="hideDesktop">
        
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link 
              key={item.name}
              href={item.path} 
              style={{ 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center", 
                gap: "4px", 
                textDecoration: "none", 
                color: active ? "var(--brand-600)" : "var(--text-secondary)",
                transition: "all 0.25s ease",
                transform: active ? "translateY(-2px)" : "translateY(0)"
              }}
            >
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "40px",
                height: "32px",
                borderRadius: "16px",
                backgroundColor: active ? "rgba(99, 102, 241, 0.1)" : "transparent",
                transition: "background-color 0.25s ease"
              }}>
                {item.icon}
              </div>
              <span style={{ 
                fontSize: "0.6rem", 
                fontWeight: active ? 700 : 500,
                opacity: active ? 1 : 0.8
              }}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
