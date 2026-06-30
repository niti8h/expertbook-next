"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "../auth.module.css";
import Link from "next/link";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [activeRole, setActiveRole] = useState<string>("customer");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"details" | "otp">("details");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // 1. Try URL
    const params = new URLSearchParams(window.location.search);
    const refFromUrl = params.get("ref");
    
    // 2. Try Cookie
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };
    const refFromCookie = getCookie("ref");

    if (refFromUrl) {
      setReferralCode(refFromUrl);
    } else if (refFromCookie) {
      setReferralCode(refFromCookie);
    }
  }, []);

  const roles = [
    {
      id: "customer",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1"/>
          <circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
        </svg>
      ),
      label: "Buyer",
      desc: "Shop products",
    },
    {
      id: "vendor",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>
          <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
        </svg>
      ),
      label: "Seller",
      desc: "Sell products",
    },
    {
      id: "provider",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
        </svg>
      ),
      label: "Provider",
      desc: "Offer services",
    },
  ];

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api("/auth/request-otp", {
        method: "POST",
        body: { phone, name, role: activeRole, referral_code: referralCode },
      });

      if (res.status === 200) {
        setStep("otp");
      } else {
        setError(res.data?.message || "Failed to send OTP.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api("/auth/verify-otp", {
        method: "POST",
        body: { phone, otp },
      });

      if (res.status === 200) {
        // Store token
        localStorage.setItem("auth-token", res.data?.data?.token);
        
        if (activeRole === "provider") {
          window.location.href = "/provider";
        } else if (activeRole === "customer") {
          window.location.href = "/";
        } else {
          window.location.href = "/vendor";
        }
      } else {
        setError(res.data?.message || "Invalid OTP.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage} style={{ minHeight: "calc(100vh - 80px - 300px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div className={styles.authFormWrapper} style={{ width: "100%", maxWidth: "480px", margin: "0 auto", padding: "40px", backgroundColor: "white", borderRadius: "24px", boxShadow: "0 20px 40px rgba(0,0,0,0.08)", border: "1px solid var(--border-light)" }}>

        {step === "details" ? (
          <>
            <h1 className={styles.formTitle} style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "8px", letterSpacing: "-0.5px" }}>Create Account</h1>
            <p className={styles.formSubtitle} style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>
              Already have an account? <Link href="/login">Sign in</Link>
            </p>

            <div className={styles.roleSelector}>
              {roles.map((role) => (
                <div
                  key={role.id}
                  className={`${styles.roleOption} ${
                    activeRole === role.id ? styles.roleOptionActive : ""
                  }`}
                  onClick={() => setActiveRole(role.id)}
                >
                  <span className={styles.roleIcon}>{role.icon}</span>
                  <strong>{role.label}</strong>
                  <span>{role.desc}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleRequestOtp}>
              <div className={styles.fieldGroup}>
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="phone">Mobile Number</label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="referral">Referral Code (Optional)</label>
                <input
                  id="referral"
                  type="text"
                  placeholder="Enter code if you have one"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                />
              </div>

              {error && <p className={styles.errorText}>{error}</p>}

              <button type="submit" className={styles.submitBtn} disabled={loading} style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                {loading ? <><span className="btn-spinner"></span>Sending OTP...</> : "Create Account"}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className={styles.formTitle} style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "8px", letterSpacing: "-0.5px" }}>Verify Number</h1>
            <p className={styles.formSubtitle} style={{ color: "var(--text-secondary)", marginBottom: "32px", lineHeight: 1.5 }}>
              We sent a 6-digit code to <strong>{phone}</strong>.{" "}
              <button
                type="button"
                onClick={() => setStep("details")}
                style={{ color: "var(--brand-600)", textDecoration: "none", fontWeight: 500, fontSize: "0.875rem", background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                Change details
              </button>
            </p>

            <form onSubmit={handleVerifyOtp}>
              <div className={styles.fieldGroup}>
                <label htmlFor="otp">One-Time Password</label>
                <input
                  id="otp"
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  style={{ letterSpacing: "0.5em", textAlign: "center", fontSize: "1.25rem" }}
                  required
                />
              </div>

              {error && <p className={styles.errorText}>{error}</p>}

              <button type="submit" className={styles.submitBtn} disabled={loading} style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                {loading ? <><span className="btn-spinner"></span>Verifying...</> : "Verify & Complete"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
