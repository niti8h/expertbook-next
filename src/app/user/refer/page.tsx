"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Link from "next/link";
import { useToast } from "@/components/ui/ToastContext";

export default function ReferAndEarnPage() {
  const router = useRouter();
  const toast = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) {
        router.push("/login");
        return;
      }
      const res = await api("/auth/me", { token });
      if (res.status === 200) {
        setUser(res.data.data || res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!user?.affiliate_code) return;
    const link = `${window.location.origin}/login?ref=${user.affiliate_code}`;
    navigator.clipboard.writeText(link);
    toast.success("Referral link copied!");
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--surface-0)", color: "var(--text-primary)" }}>
      <div style={{ backgroundColor: "var(--surface-1)", padding: "40px", borderBottom: "1px solid var(--border-light)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: 0 }}>Refer & Earn</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "8px" }}>Share your referral code and earn cash in your wallet.</p>
        </div>
      </div>

      <main style={{ maxWidth: "1200px", margin: "40px auto", padding: "0 40px" }}>
        {loading ? (
          <div style={{ padding: "60px", textAlign: "center", color: "var(--text-muted)" }}>Loading your referral details...</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "32px", maxWidth: "800px", margin: "0 auto" }}>
            
            <div style={{ backgroundColor: "white", padding: "40px", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-light)", textAlign: "center", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ width: "80px", height: "80px", margin: "0 auto 24px", backgroundColor: "rgba(34, 197, 94, 0.1)", color: "rgb(34, 197, 94)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <polyline points="17 11 19 13 23 9"></polyline>
                </svg>
              </div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "16px" }}>Invite Friends & Earn</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "1.125rem", marginBottom: "32px", lineHeight: "1.6" }}>
                Share your unique referral link with friends. When they register using your link and complete a purchase, you'll earn a bonus directly to your wallet!
              </p>

              <div style={{ backgroundColor: "var(--surface-1)", padding: "16px", borderRadius: "var(--radius-md)", border: "1px dashed var(--border-light)", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                <code style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--brand-600)", letterSpacing: "2px" }}>
                  {user?.affiliate_code || "NO-CODE"}
                </code>
                <button onClick={copyToClipboard} className="btn-primary" style={{ padding: "8px 24px", fontSize: "0.875rem" }}>
                  Copy Link
                </button>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px" }}>
                <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>Your current wallet balance:</span>
                <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)" }}>₹{(user?.wallet_balance || 0).toLocaleString()}</span>
              </div>
            </div>

            <div style={{ backgroundColor: "white", padding: "32px", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-light)" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "16px" }}>How it works</h3>
              <ol style={{ margin: 0, paddingLeft: "20px", color: "var(--text-secondary)", lineHeight: "1.8" }}>
                <li style={{ marginBottom: "12px" }}><strong>Share your link:</strong> Send your unique referral link to friends and family.</li>
                <li style={{ marginBottom: "12px" }}><strong>They sign up:</strong> Your friends use the link to create a new account.</li>
                <li style={{ marginBottom: "0" }}><strong>You earn:</strong> When they make a purchase and it is successfully delivered, you earn a percentage of our profit directly into your wallet!</li>
              </ol>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
