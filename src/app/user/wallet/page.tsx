"use client";

import { useState, useEffect } from "react";
import styles from "../../(dashboard)/dashboard.module.css";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastContext";

export default function UserWallet() {
  const [walletData, setWalletData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    payout_bank_account_name: "",
    bank_account_number: "",
    ifsc_code: "",
  });
  const router = useRouter();
  const toast = useToast();

  const [withdrawals, setWithdrawals] = useState<any[]>([]);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) {
        router.push("/login");
        return;
      }

      const [walletRes, historyRes] = await Promise.all([
        api("/user/wallet", { token }),
        api("/user/withdrawals", { token }).catch(() => ({ status: 500, data: { data: [] } }))
      ]);

      if (walletRes.status === 200) {
        setWalletData({ balance: walletRes.data.balance });
      }

      if (historyRes.status === 200) {
        setWithdrawals(historyRes.data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || parseFloat(withdrawAmount) < 100) {
      toast.error("Minimum withdrawal is ₹100");
      return;
    }
    setWithdrawing(true);
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) {
        toast.error("You must be logged in to request withdrawal.");
        router.push("/login");
        return;
      }
      const res = await api("/user/wallet/withdraw", {
        method: "POST",
        body: {
          amount: parseFloat(withdrawAmount),
          ...bankDetails,
        },
        token,
      });
      if (res.status === 201) {
        setWithdrawAmount("");
        setBankDetails({ payout_bank_account_name: "", bank_account_number: "", ifsc_code: "" });
        toast.success("Withdrawal requested successfully!");
        fetchWallet();
      } else {
        toast.error(res.data?.message || "Failed to request withdrawal");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <div style={{ backgroundColor: "var(--surface-50)", minHeight: "calc(100vh - 64px)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px 16px" }}>
        <main className={styles.mainContent} style={{ margin: 0, padding: 0 }}>
          <div className={styles.topBar}>
            <div className={styles.topBarLeft}>
              <h1>Wallet</h1>
              <p>Manage your referral earnings and request payouts.</p>
            </div>
          </div>
          <div className={styles.pageContent} style={{ padding: "0" }}>
            {loading ? (
              <div>Loading wallet data...</div>
            ) : (
              <div className={styles.gridTwoCols}>
                <div style={{ display: "grid", gap: "24px", alignContent: "start" }}>
                  <div className={styles.statCard} style={{ backgroundColor: "var(--brand-600)", color: "white" }}>
                    <div className={styles.statHeader}>
                      <div style={{ padding: "8px", backgroundColor: "rgba(255,255,255,0.2)", borderRadius: "var(--radius-sm)" }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><polyline points="17 11 19 13 23 9" /></svg>
                      </div>
                    </div>
                    <div className={styles.statValue} style={{ fontSize: "2rem", color: 'white' }}>₹{parseFloat(walletData?.balance || 0).toFixed(2)}</div>
                    <div className={styles.statLabel}>Available Balance</div>
                  </div>

                  <div className={styles.contentCard}>
                    <div className={styles.contentCardHeader}>
                      <h3>Request Payout</h3>
                    </div>
                    <div className={styles.contentCardBody}>
                      <form onSubmit={handleWithdraw} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div>
                          <label style={{ display: "block", marginBottom: "4px" }}>Withdrawal Amount (₹)</label>
                          <input
                            type="number"
                            required
                            min="100"
                            step="0.01"
                            max={walletData?.balance || 0}
                            placeholder="Min ₹100"
                            className="input-primary"
                            value={withdrawAmount}
                            onChange={e => setWithdrawAmount(e.target.value)}
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", marginBottom: "4px" }}>Account Holder Name</label>
                          <input
                            type="text"
                            required
                            className="input-primary"
                            value={bankDetails.payout_bank_account_name}
                            onChange={e => setBankDetails({ ...bankDetails, payout_bank_account_name: e.target.value })}
                          />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                          <div>
                            <label style={{ display: "block", marginBottom: "4px" }}>Account Number</label>
                            <input
                              type="text"
                              required
                              className="input-primary"
                              value={bankDetails.bank_account_number}
                              onChange={e => setBankDetails({ ...bankDetails, bank_account_number: e.target.value })}
                            />
                          </div>
                          <div>
                            <label style={{ display: "block", marginBottom: "4px" }}>IFSC Code</label>
                            <input
                              type="text"
                              required
                              className="input-primary"
                              value={bankDetails.ifsc_code}
                              onChange={e => setBankDetails({ ...bankDetails, ifsc_code: e.target.value })}
                            />
                          </div>
                        </div>
                        <button type="submit" className="btn-primary" disabled={withdrawing || parseFloat(walletData?.balance || 0) < 100}>
                          {withdrawing ? "Processing..." : "Withdraw Funds"}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>

                {/* History Table */}
                <div className={styles.contentCard} style={{ overflow: "hidden" }}>
                  <div className={styles.contentCardHeader}>
                    <h3>Withdrawal History</h3>
                  </div>
                  {withdrawals.length === 0 ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                      No withdrawal requests yet.
                    </div>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {withdrawals.map((w: any) => (
                            <tr key={w.id}>
                              <td style={{ whiteSpace: "nowrap" }}>{new Date(w.created_at).toLocaleDateString()}</td>
                              <td style={{ fontWeight: 600 }}>₹{parseFloat(w.amount).toFixed(2)}</td>
                              <td>
                                <span style={{
                                  padding: "4px 8px",
                                  borderRadius: "100px",
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                  textTransform: "capitalize",
                                  backgroundColor: w.status === 'completed' || w.status === 'approved' ? 'var(--success-50)' : w.status === 'rejected' ? 'var(--danger-50)' : 'var(--warning-50)',
                                  color: w.status === 'completed' || w.status === 'approved' ? 'var(--success)' : w.status === 'rejected' ? 'var(--danger)' : 'var(--warning-700)'
                                }}>
                                  {w.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
