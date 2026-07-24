"use client";
import React, { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function LoggedInHome({ user }: { user: any }) {
  const [loadingAction, setLoadingAction] = useState("");

    // No longer upgrading roles

  return (
    <div style={{ position: "relative", minHeight: "calc(100vh - 80px - 300px)", overflow: "hidden", background: "linear-gradient(to bottom, #f8fafc, #ffffff)" }}>
      {/* Background Glow Elements */}
      <div style={{ position: "absolute", top: "-10%", left: "-10%", width: "40%", height: "40%", background: "radial-gradient(circle, rgba(14, 165, 233, 0.1) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }}></div>
      <div style={{ position: "absolute", bottom: "-10%", right: "-10%", width: "40%", height: "40%", background: "radial-gradient(circle, rgba(234, 179, 8, 0.1) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }}></div>

      <div style={{ padding: "60px 20px", maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        
        {/* Header Section */}
        <div style={{ marginBottom: "48px", textAlign: "center" }}>
          <div style={{ display: "inline-block", padding: "8px 16px", borderRadius: "100px", backgroundColor: "var(--brand-50)", color: "var(--brand-600)", fontWeight: "600", fontSize: "0.875rem", marginBottom: "16px", border: "1px solid var(--brand-100)" }}>
            Welcome back to Expert Book
          </div>
          <h1 style={{ fontSize: "2.5rem", marginBottom: "16px", fontWeight: "800", letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
            Hello, {user?.name?.split(" ")[0]}! 👋
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.125rem", maxWidth: "600px", margin: "0 auto" }}>
            Explore your personalized dashboard, manage your orders, or take your account to the next level by becoming a seller or professional.
          </p>
        </div>

        {/* Existing Dashboards (Admin) */}
        {(user?.role?.slug === "admin") && (
          <div style={{ marginBottom: "56px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "1.5rem", margin: 0, fontWeight: "700", display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ display: "inline-block", width: "8px", height: "24px", background: "var(--brand-500)", borderRadius: "4px" }}></span>
                Your Workspace
              </h2>
            </div>
            
            <div style={{ 
              padding: "32px", 
              borderRadius: "20px", 
              backgroundColor: "white", 
              border: "1px solid var(--border-light)",
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.03)"
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(239, 68, 68, 0.1)", color: "rgb(239, 68, 68)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                  </div>
                  <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "700" }}>Admin Dashboard</h3>
                </div>
                <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.95rem" }}>Overview the entire marketplace and manage global settings.</p>
              </div>
              <Link href="/admin" className="btn-primary" style={{ padding: "12px 24px", borderRadius: "100px", textDecoration: "none" }}>Enter Panel</Link>
            </div>
          </div>
        )}

        {/* Common Quick Links Section */}
        <div>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "20px", fontWeight: "700" }}>Quick Actions</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
            <Link href="/user/orders" style={{ padding: "24px", background: "white", border: "1px solid var(--border-light)", borderRadius: "20px", textDecoration: "none", color: "var(--text-primary)", display: "flex", flexDirection: "column", gap: "12px", transition: "transform 0.2s, box-shadow 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)' }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "var(--brand-50)", color: "var(--brand-600)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              </div>
              <div>
                <h4 style={{ margin: "0 0 4px 0", fontSize: "1rem" }}>My Orders</h4>
                <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-secondary)" }}>Track your purchases</p>
              </div>
            </Link>

            <Link href="/user/wishlist" style={{ padding: "24px", background: "white", border: "1px solid var(--border-light)", borderRadius: "20px", textDecoration: "none", color: "var(--text-primary)", display: "flex", flexDirection: "column", gap: "12px", transition: "transform 0.2s, box-shadow 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)' }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "rgb(239, 68, 68)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              </div>
              <div>
                <h4 style={{ margin: "0 0 4px 0", fontSize: "1rem" }}>Wishlist</h4>
                <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-secondary)" }}>Your saved items</p>
              </div>
            </Link>

            <Link href="/user/wallet" style={{ padding: "24px", background: "white", border: "1px solid var(--border-light)", borderRadius: "20px", textDecoration: "none", color: "var(--text-primary)", display: "flex", flexDirection: "column", gap: "12px", transition: "transform 0.2s, box-shadow 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)' }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "rgba(34, 197, 94, 0.1)", color: "rgb(34, 197, 94)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
              </div>
              <div>
                <h4 style={{ margin: "0 0 4px 0", fontSize: "1rem" }}>Wallet</h4>
                <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-secondary)" }}>Manage your balance</p>
              </div>
            </Link>

            <Link href="/products" style={{ padding: "24px", background: "white", border: "1px solid var(--border-light)", borderRadius: "20px", textDecoration: "none", color: "var(--text-primary)", display: "flex", flexDirection: "column", gap: "12px", transition: "transform 0.2s, box-shadow 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)' }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "rgba(168, 85, 247, 0.1)", color: "rgb(168, 85, 247)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
              </div>
              <div>
                <h4 style={{ margin: "0 0 4px 0", fontSize: "1rem" }}>Explore Shop</h4>
                <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-secondary)" }}>Discover new items</p>
              </div>
            </Link>

            <Link href="/user/addresses" style={{ padding: "24px", background: "white", border: "1px solid var(--border-light)", borderRadius: "20px", textDecoration: "none", color: "var(--text-primary)", display: "flex", flexDirection: "column", gap: "12px", transition: "transform 0.2s, box-shadow 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)' }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "rgba(14, 165, 233, 0.1)", color: "rgb(14, 165, 233)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              </div>
              <div>
                <h4 style={{ margin: "0 0 4px 0", fontSize: "1rem" }}>My Addresses</h4>
                <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-secondary)" }}>Manage delivery info</p>
              </div>
            </Link>

            <Link href="/user/products" style={{ padding: "24px", background: "white", border: "1px solid var(--border-light)", borderRadius: "20px", textDecoration: "none", color: "var(--text-primary)", display: "flex", flexDirection: "column", gap: "12px", transition: "transform 0.2s, box-shadow 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)' }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "rgba(14, 165, 233, 0.1)", color: "var(--brand-600)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path></svg>
              </div>
              <div>
                <h4 style={{ margin: "0 0 4px 0", fontSize: "1rem" }}>My Products</h4>
                <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-secondary)" }}>Manage your inventory</p>
              </div>
            </Link>

            <Link href="/user/services" style={{ padding: "24px", background: "white", border: "1px solid var(--border-light)", borderRadius: "20px", textDecoration: "none", color: "var(--text-primary)", display: "flex", flexDirection: "column", gap: "12px", transition: "transform 0.2s, box-shadow 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)' }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "rgba(234, 179, 8, 0.1)", color: "rgb(234, 179, 8)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              </div>
              <div>
                <h4 style={{ margin: "0 0 4px 0", fontSize: "1rem" }}>My Services</h4>
                <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-secondary)" }}>Manage your offerings</p>
              </div>
            </Link>

            <Link href="/user/profile" style={{ padding: "24px", background: "white", border: "1px solid var(--border-light)", borderRadius: "20px", textDecoration: "none", color: "var(--text-primary)", display: "flex", flexDirection: "column", gap: "12px", transition: "transform 0.2s, box-shadow 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)' }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "rgba(107, 114, 128, 0.1)", color: "rgb(107, 114, 128)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              <div>
                <h4 style={{ margin: "0 0 4px 0", fontSize: "1rem" }}>Profile Settings</h4>
                <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-secondary)" }}>Update your details</p>
              </div>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
