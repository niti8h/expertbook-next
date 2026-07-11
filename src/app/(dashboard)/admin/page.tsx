"use client";
import { useState, useEffect } from "react";
import styles from "../dashboard.module.css";
import { api } from "@/lib/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("auth-token");
        if (!token) return;

        const res = await api("/admin/dashboard", { token });
        if (res.status === 200) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <main className={styles.mainContent}>
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <h1>Admin Dashboard</h1>
          <p>Platform overview — metrics in real-time.</p>
        </div>
      </div>

      <div className={styles.pageContent}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>Loading stats...</div>
        ) : !stats ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--danger-500)" }}>Failed to load stats.</div>
        ) : (
          <>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ color: "var(--brand-500)", backgroundColor: "var(--surface-2)" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
                </div>
                <div className={styles.statInfo}>
                  <p className={styles.statLabel}>Total Users</p>
                  <p className={styles.statValue}>{stats.total_users}</p>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ color: "#eab308", backgroundColor: "rgba(234, 179, 8, 0.1)" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>
                </div>
                <div className={styles.statInfo}>
                  <p className={styles.statLabel}>Total Vendors</p>
                  <p className={styles.statValue}>{stats.total_vendors}</p>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ color: "#22c55e", backgroundColor: "rgba(34, 197, 94, 0.1)" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                </div>
                <div className={styles.statInfo}>
                  <p className={styles.statLabel}>Total Sales</p>
                  <p className={styles.statValue}>₹{parseFloat(stats.total_sales || 0).toLocaleString()}</p>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ color: "#3b82f6", backgroundColor: "rgba(59, 130, 246, 0.1)" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                </div>
                <div className={styles.statInfo}>
                  <p className={styles.statLabel}>Total Orders</p>
                  <p className={styles.statValue}>{stats.total_orders}</p>
                </div>
              </div>
            </div>

            <div className={styles.contentCard} style={{ marginTop: "32px", padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ fontSize: "1.125rem", fontWeight: 600 }}>Recent Orders</h3>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recent_orders?.map((order: any) => (
                      <tr key={order.id}>
                        <td style={{ fontWeight: 500 }}>{order.order_number}</td>
                        <td>{order.user?.name}</td>
                        <td style={{ fontWeight: 600 }}>₹{parseFloat(order.total_amount || 0).toLocaleString()}</td>
                        <td>
                          <span style={{
                            padding: "4px 8px",
                            borderRadius: "100px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            backgroundColor: order.status === 'completed' ? "rgba(34, 197, 94, 0.1)" : "rgba(234, 179, 8, 0.1)",
                            color: order.status === 'completed' ? "rgb(34, 197, 94)" : "rgb(202, 138, 4)"
                          }}>
                            {order.status.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ color: "var(--text-secondary)" }}>
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                    {(!stats.recent_orders || stats.recent_orders.length === 0) && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: "center", padding: "24px", color: "var(--text-muted)" }}>
                          No recent orders.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
