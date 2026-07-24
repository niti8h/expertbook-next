"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function BottomNav() {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    
    const handleScroll = () => {
      if (window.scrollY > 20) setScrolled(true);
      else setScrolled(false);
    };
    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (!isMobile) return null;

  const isActive = (path: string) => {
    if (path === "/" && pathname !== "/") return false;
    if (path === "/" && pathname === "/") return true;
    return pathname.startsWith(path);
  };

  const navItems = [
    {
      name: "Home",
      path: "/",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={isActive("/") ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isActive("/") ? "0" : "1.75"} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      )
    },
    {
      name: "Categories",
      path: "/categories",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={isActive("/categories") ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isActive("/categories") ? "0" : "1.75"} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1"></rect>
          <rect x="14" y="3" width="7" height="7" rx="1"></rect>
          <rect x="14" y="14" width="7" height="7" rx="1"></rect>
          <rect x="3" y="14" width="7" height="7" rx="1"></rect>
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
    }
  ];

  return (
    <>
      <div style={{ height: "120px", width: "100%" }} className="hideDesktop" />
      
      <div style={{
        position: "fixed",
        bottom: "calc(env(safe-area-inset-bottom, 20px) + 20px)", // Increased distance from bottom
        left: "50%",
        transform: "translateX(-50%)",
        width: "90%",
        maxWidth: "400px",
        backgroundColor: "rgba(255, 255, 255, 0.75)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        borderRadius: "100px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 20px",
        zIndex: 999,
        boxShadow: "0 10px 40px rgba(0,0,0,0.1), 0 1px 3px rgba(255,255,255,0.4) inset",
        border: "1px solid rgba(255, 255, 255, 0.5)",
        transition: "all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)"
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
                transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                transform: active ? "scale(1.05)" : "scale(1)"
              }}
            >
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "48px",
                height: "36px",
                borderRadius: "18px",
                backgroundColor: active ? "rgba(99, 102, 241, 0.15)" : "transparent",
                transition: "all 0.3s ease",
                transform: active ? "translateY(-4px)" : "translateY(0)"
              }}>
                {item.icon}
              </div>
              <span style={{ 
                fontSize: "0.65rem", 
                fontWeight: active ? 700 : 500,
                opacity: active ? 1 : 0.7,
                transition: "all 0.3s ease",
                transform: active ? "translateY(-2px)" : "translateY(0)"
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
