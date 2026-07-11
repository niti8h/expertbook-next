"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "../auth.module.css";
import Link from "next/link";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [queryString, setQueryString] = useState("");

  useEffect(() => {
    setQueryString(window.location.search);
  }, []);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api("/auth/request-otp", {
        method: "POST",
        body: { phone },
      });

      if (res.status === 200) {
        setStep("otp");
      } else if (res.status === 422) {
        // If validation failed, they probably need to register
        setError("Account not found. Please create an account.");
      } else {
        setError((res.data as any)?.message || "Failed to send OTP.");
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
        
        // Redirect based on role
        if (res.data?.data?.user?.role?.slug === "admin") {
          window.location.href = "/admin";
        } else if (res.data?.data?.user?.role?.slug === "provider") {
          window.location.href = "/provider";
        } else if (res.data?.data?.user?.role?.slug === "vendor") {
          window.location.href = "/vendor"; // Use window.location to force full reload and update Header state
        } else {
          window.location.href = "/";
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
    <div className={styles.authPage} style={{ minHeight: "calc(100vh - 80px - 300px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className={styles.authFormWrapper} style={{ width: "100%", maxWidth: "440px", margin: "40px auto", padding: "40px", backgroundColor: "white", borderRadius: "24px", boxShadow: "0 20px 40px rgba(0,0,0,0.08)", border: "1px solid var(--border-light)" }}>
        
        {step === "phone" ? (
          <>
            <h1 className={styles.formTitle} style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "8px", letterSpacing: "-0.5px" }}>Welcome back</h1>
            <p className={styles.formSubtitle} style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>
              New here? <Link href={`/register${queryString}`}>Create an account</Link>
            </p>

            <form onSubmit={handleRequestOtp}>
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

              {error && <p className={styles.errorText}>{error}</p>}

              <button type="submit" className={styles.submitBtn} disabled={loading} style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                {loading ? <><span className="btn-spinner"></span>Sending OTP...</> : "Continue"}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className={styles.formTitle} style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "8px", letterSpacing: "-0.5px" }}>Enter OTP</h1>
            <p className={styles.formSubtitle} style={{ color: "var(--text-secondary)", marginBottom: "32px", lineHeight: 1.5 }}>
              We sent a 6-digit code to <strong>{phone}</strong>.{" "}
              <button
                type="button"
                onClick={() => setStep("phone")}
                style={{ color: "var(--brand-600)", textDecoration: "none", fontWeight: 500, fontSize: "0.875rem", background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                Change number
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
                {loading ? <><span className="btn-spinner"></span>Verifying...</> : "Sign In"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
