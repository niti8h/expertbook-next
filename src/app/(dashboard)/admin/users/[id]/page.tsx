"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "../../../dashboard.module.css";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/ToastContext";

export default function AdminUserDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const toast = useToast();
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [impersonating, setImpersonating] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) return router.push("/login");

      const res = await api(`/admin/users/${id}`, { token });
      if (res.status === 200) {
        setUser(res.data.data);
      } else {
        toast.error("User not found");
        router.push("/admin/users");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load user details");
    } finally {
      setLoading(false);
    }
  };

  const handleImpersonate = async () => {
    if (!confirm(`Are you sure you want to login as ${user.name}? You will be logged out of your Admin session.`)) return;
    
    setImpersonating(true);
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) return;

      const res = await api(`/admin/users/${id}/impersonate`, {
        method: "POST",
        token,
      });

      if (res.status === 200) {
        localStorage.setItem("auth-token", res.data.token);
        localStorage.setItem("user-role", res.data.user.role?.slug || "customer");
        toast.success(`Successfully logged in as ${user.name}`);
        
        // Redirect based on role
        if (res.data.user.role?.slug === "vendor") {
          window.location.href = "/vendor/dashboard";
        } else {
          window.location.href = "/user/dashboard";
        }
      } else {
        toast.error(res.data.message || "Failed to impersonate user");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during impersonation");
    } finally {
      setImpersonating(false);
    }
  };

  if (loading) {
    return (
      <main className={styles.mainContent}>
        <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>Loading user details...</div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className={styles.mainContent}>
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <button 
            onClick={() => router.push("/admin/users")}
            style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", marginBottom: "8px", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.875rem" }}
          >
            &larr; Back to Users
          </button>
          <h1>User Profile: {user.name}</h1>
          <p>Detailed view and account management.</p>
        </div>
        <div className={styles.topBarRight}>
          <button 
            onClick={handleImpersonate}
            disabled={impersonating}
            style={{
              padding: "10px 20px",
              backgroundColor: "var(--brand-500)",
              color: "white",
              border: "none",
              borderRadius: "var(--radius-md)",
              fontWeight: 600,
              cursor: "pointer",
              opacity: impersonating ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            {impersonating ? "Logging in..." : "Login as User"}
          </button>
        </div>
      </div>

      <div className={styles.pageContent}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" }}>
          
          {/* Left Column: Basic Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div className={styles.contentCard} style={{ padding: "32px", textAlign: "center" }}>
              <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "var(--brand-100)", color: "var(--brand-600)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", fontWeight: 700, margin: "0 auto 16px" }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h2 style={{ margin: "0 0 4px", fontSize: "1.25rem" }}>{user.name}</h2>
              <span style={{ 
                display: "inline-block", 
                padding: "4px 12px", 
                borderRadius: "100px", 
                backgroundColor: "var(--surface-2)", 
                fontSize: "0.75rem", 
                fontWeight: 600, 
                textTransform: "uppercase", 
                color: "var(--text-secondary)",
                marginBottom: "16px"
              }}>
                {user.role?.name || 'Customer'}
              </span>

              <div style={{ textAlign: "left", marginTop: "24px", paddingTop: "24px", borderTop: "1px solid var(--border-light)", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Phone</div>
                  <div style={{ fontWeight: 500 }}>{user.phone}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Email</div>
                  <div style={{ fontWeight: 500 }}>{user.email || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Joined</div>
                  <div style={{ fontWeight: 500 }}>{new Date(user.created_at).toLocaleDateString()}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Status</div>
                  <div style={{ fontWeight: 600, color: user.is_active ? "var(--success-500)" : "var(--danger-500)" }}>{user.is_active ? "Active" : "Blocked"}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Stats based on Role */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            <div className={styles.statsGrid} style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
              <div className={styles.statCard}>
                <div className={styles.statTitle}>Wallet Balance</div>
                <div className={styles.statValue}>₹{parseFloat(user.wallet_balance || 0).toLocaleString()}</div>
              </div>
              
              {user.role?.slug === 'vendor' ? (
                <>
                  <div className={styles.statCard}>
                    <div className={styles.statTitle}>Products</div>
                    <div className={styles.statValue}>{user.products?.length || 0}</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statTitle}>Services</div>
                    <div className={styles.statValue}>{user.services?.length || 0}</div>
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.statCard}>
                    <div className={styles.statTitle}>Total Orders</div>
                    <div className={styles.statValue}>{user.orders?.length || 0}</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statTitle}>Referrals</div>
                    <div className={styles.statValue}>{user.referrals?.length || 0}</div>
                  </div>
                </>
              )}
            </div>

            {/* Vendor Profile Info if Vendor */}
            {user.role?.slug === 'vendor' && user.vendor_profile && (
              <div className={styles.contentCard} style={{ padding: "24px" }}>
                <h3 style={{ margin: "0 0 16px", fontSize: "1.125rem" }}>Vendor Profile</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "4px" }}>Store Name</div>
                    <div style={{ fontWeight: 500 }}>{user.vendor_profile.store_name || 'Not set'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "4px" }}>Business Type</div>
                    <div style={{ fontWeight: 500 }}>{user.vendor_profile.business_type || 'Not set'}</div>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "4px" }}>Store Description</div>
                    <div style={{ color: "var(--text-primary)" }}>{user.vendor_profile.store_description || 'No description provided.'}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Orders if Customer */}
            {user.orders && user.orders.length > 0 && (
              <div className={styles.contentCard}>
                <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-light)" }}>
                  <h3 style={{ margin: 0, fontSize: "1.125rem" }}>Order History</h3>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Order #</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {user.orders.slice(0, 5).map((order: any) => (
                        <tr key={order.id}>
                          <td style={{ fontWeight: 500 }}>{order.order_number}</td>
                          <td>{new Date(order.created_at).toLocaleDateString()}</td>
                          <td>₹{parseFloat(order.total_amount).toLocaleString()}</td>
                          <td>
                            <span style={{
                              padding: "2px 8px",
                              borderRadius: "100px",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              backgroundColor: order.status === 'completed' ? "rgba(34, 197, 94, 0.1)" : "rgba(234, 179, 8, 0.1)",
                              color: order.status === 'completed' ? "rgb(34, 197, 94)" : "rgb(202, 138, 4)"
                            }}>
                              {order.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </main>
  );
}
