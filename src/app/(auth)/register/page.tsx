"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "../auth.module.css";
import Link from "next/link";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
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

    if (localStorage.getItem("auth-token")) {
      window.location.href = "/";
    }
  }, []);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api("/auth/request-otp", {
        method: "POST",
        body: { phone, name, referral_code: referralCode },
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
        
        window.location.href = "/";
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
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, "");
                    if (val.startsWith("91") && val.length > 10) {
                      val = val.substring(2);
                    }
                    setPhone(val);
                  }}
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
