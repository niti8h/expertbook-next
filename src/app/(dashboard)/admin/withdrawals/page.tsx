"use client";

import { useState, useEffect } from "react";
import styles from "../../dashboard.module.css";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/ToastContext";

export default function AdminWithdrawalsPage() {
  const toast = useToast();
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) return;

      const res = await api("/admin/withdrawals", { token });
      if (res.status === 200) {
        setWithdrawals(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load withdrawals");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: number, action: "approve" | "reject") => {
    if (!confirm(`Are you sure you want to ${action} this withdrawal?`)) return;
    
    setProcessingId(id);
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) return;

      const res = await api(`/admin/withdrawals/${id}/${action}`, {
        method: "POST",
        token,
      });

      if (res.status === 200) {
        toast.success(`Withdrawal ${action}d successfully`);
        fetchWithdrawals();
      } else {
        toast.error(`Failed to ${action} withdrawal`);
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <main className={styles.mainContent}>
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <h1>Withdrawals</h1>
          <p>Review and process vendor payout requests.</p>
        </div>
      </div>

      <div className={styles.pageContent}>
        <div className={styles.contentCard} style={{ overflowX: "auto" }}>
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>Loading withdrawals...</div>
          ) : withdrawals.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>No withdrawal requests found.</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Vendor</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date Requested</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id}>
                    <td style={{ color: "var(--text-secondary)" }}>#{withdrawal.id}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{withdrawal.vendor?.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{withdrawal.vendor?.email}</div>
                    </td>
                    <td style={{ fontWeight: 600 }}>₹{parseFloat(withdrawal.amount || 0).toLocaleString()}</td>
                    <td>
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: "100px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        backgroundColor: withdrawal.status === 'completed' ? "rgba(34, 197, 94, 0.1)" : (withdrawal.status === 'rejected' ? "rgba(239, 68, 68, 0.1)" : "rgba(234, 179, 8, 0.1)"),
                        color: withdrawal.status === 'completed' ? "rgb(34, 197, 94)" : (withdrawal.status === 'rejected' ? "rgb(239, 68, 68)" : "rgb(202, 138, 4)")
                      }}>
                        {withdrawal.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                      {new Date(withdrawal.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      {withdrawal.status === "pending" ? (
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => handleAction(withdrawal.id, "approve")}
                            disabled={processingId === withdrawal.id}
                            style={{
                              padding: "4px 12px",
                              borderRadius: "var(--radius-sm)",
                              border: "none",
                              backgroundColor: "var(--success-500)",
                              color: "white",
                              fontSize: "0.813rem",
                              fontWeight: 500,
                              cursor: "pointer",
                              opacity: processingId === withdrawal.id ? 0.5 : 1
                            }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(withdrawal.id, "reject")}
                            disabled={processingId === withdrawal.id}
                            style={{
                              padding: "4px 12px",
                              borderRadius: "var(--radius-sm)",
                              border: "1px solid var(--danger-500)",
                              backgroundColor: "transparent",
                              color: "var(--danger-500)",
                              fontSize: "0.813rem",
                              fontWeight: 500,
                              cursor: "pointer",
                              opacity: processingId === withdrawal.id ? 0.5 : 1
                            }}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: "0.813rem", color: "var(--text-muted)" }}>Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}
