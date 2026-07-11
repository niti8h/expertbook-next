"use client";
import styles from "../dashboard.module.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

const STATUS_STYLES: Record<string, string> = {
  completed: styles.statusCompleted,
  shipped:   styles.statusCompleted,
  pending:   styles.statusPending,
  processing:styles.statusPending,
  cancelled: styles.statusCancelled,
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "just now";
  if (mins < 60)  return `${mins} minute${mins > 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export default function VendorDashboard() {
  const router = useRouter();
  const [orders, setOrders]     = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth-token");
    if (!token) { router.push("/login"); return; }
    fetchOrders(token);
  }, [router]);

  const fetchOrders = async (token: string) => {
    try {
      const res = await api("/vendor/orders", { token });
      if (res.status === 200) setOrders(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const recentOrders   = orders.slice(0, 5);
  const totalRevenue   = orders.reduce((s: number, o: any) => s + parseFloat(o.total_price || 0), 0);
  const totalOrders    = orders.length;
  const pendingOrders  = orders.filter((o: any) => ["pending","processing"].includes(o.status)).length;

  return (
    <>
      <main className={styles.mainContent}>
        <div className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <h1>Dashboard</h1>
            <p>Welcome back — here&apos;s what&apos;s happening with your store today.</p>
          </div>
          <div className={styles.topBarRight}>
            <button className={styles.topBarIconBtn} aria-label="Notifications">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
              <span className={styles.notifDot}></span>
            </button>
            <button className="btn-primary" onClick={() => router.push('/vendor/products')} style={{ fontSize: "0.813rem", padding: "10px 20px" }}>
              + Add Product
            </button>
          </div>
        </div>

        <div className={styles.pageContent}>
          {/* Stats */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <div className={`${styles.statIcon} ${styles.statIconBrand}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E27516" strokeWidth="1.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                </div>
              </div>
              <div className={styles.statValue}>
                {loading ? "—" : `₹${totalRevenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
              </div>
              <div className={styles.statLabel}>Total Earnings</div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <div className={`${styles.statIcon} ${styles.statIconBlue}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                </div>
              </div>
              <div className={styles.statValue}>{loading ? "—" : totalOrders}</div>
              <div className={styles.statLabel}>Total Orders</div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.5"><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>
                </div>
              </div>
              <div className={styles.statValue}>{loading ? "—" : pendingOrders}</div>
              <div className={styles.statLabel}>Pending Orders</div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <div className={`${styles.statIcon} ${styles.statIconSlate}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                </div>
              </div>
              <div className={styles.statValue}>
                {loading ? "—" : orders.filter((o:any) => o.status === "completed").length}
              </div>
              <div className={styles.statLabel}>Completed Orders</div>
            </div>
          </div>

          {/* Two column layout */}
          <div className={styles.gridTwoCols}>
            {/* Recent Orders */}
            <div className={styles.contentCard}>
              <div className={styles.contentCardHeader}>
                <h3>Recent Orders</h3>
                <Link href="/vendor/orders" className="btn-secondary" style={{ padding: "8px 16px", fontSize: "0.75rem" }}>View All</Link>
              </div>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={4} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>Loading...</td></tr>
                  ) : recentOrders.length === 0 ? (
                    <tr><td colSpan={4} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>No orders yet</td></tr>
                  ) : (
                    recentOrders.map(order => (
                      <tr key={order.id}>
                        <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{order.order_number}</td>
                        <td>{order.customer_name}</td>
                        <td>₹{parseFloat(order.total_price || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</td>
                        <td>
                          <span className={`${styles.statusBadge} ${STATUS_STYLES[order.status] || styles.statusPending}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Recent Activity */}
            <div className={styles.contentCard}>
              <div className={styles.contentCardHeader}>
                <h3>Recent Activity</h3>
              </div>
              <div className={styles.contentCardBody}>
                <div className={styles.activityList}>
                  {loading ? (
                    <p style={{ color: "var(--text-muted)", padding: "20px 0" }}>Loading...</p>
                  ) : orders.length === 0 ? (
                    <p style={{ color: "var(--text-muted)", padding: "20px 0" }}>No recent activity</p>
                  ) : (
                    orders.slice(0, 6).map(order => {
                      const dotClass =
                        order.status === "completed" || order.status === "shipped" ? styles.dotGreen :
                        order.status === "cancelled" ? styles.dotBrand :
                        styles.dotBlue;
                      return (
                        <div key={order.id} className={styles.activityItem}>
                          <div className={`${styles.activityDot} ${dotClass}`}></div>
                          <div>
                            <div className={styles.activityText}>
                              <strong>{order.customer_name}</strong>{" "}
                              {order.status === "completed"
                                ? "completed order "
                                : order.status === "cancelled"
                                ? "cancelled order "
                                : "placed order "}
                              <strong>{order.order_number}</strong>
                              {order.item_title ? ` for ${order.item_title}` : ""}
                            </div>
                            <div className={styles.activityTime}>{timeAgo(order.created_at)}</div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
