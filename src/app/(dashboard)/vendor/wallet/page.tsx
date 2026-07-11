"use client";
import { useState, useEffect } from "react";
import styles from "../../dashboard.module.css";
import Link from "next/link";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastContext";

export default function VendorWallet() {
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
      const res = await api("/vendor/wallet", { token });
      if (res.status === 200) {
        setWalletData(res.data);
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
      const res = await api("/vendor/wallet/withdraw", {
        method: "POST",
        body: { 
          amount: parseFloat(withdrawAmount),
          ...bankDetails
        },
        token,
      });

      if (res.status === 201) {
        setWithdrawAmount("");
        setBankDetails({ payout_bank_account_name: "", bank_account_number: "", ifsc_code: "" });
        toast.success("Withdrawal requested successfully!");
        fetchWallet(); // refresh balance
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
    <>

      <main className={styles.mainContent}>
        <div className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <h1>Wallet</h1>
            <p>Manage your earnings, commissions, and payouts.</p>
          </div>
        </div>

        <div className={styles.pageContent}>
          {loading ? (
            <div>Loading wallet data...</div>
          ) : (
            <>
              {/* Financial Summary */}
              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: "24px", marginBottom: "32px" }}>
                <div className={styles.statCard} style={{ backgroundColor: "var(--brand-600)", color: "white", borderColor: "transparent" }}>
                  <div className={styles.statHeader}>
                    <div style={{ padding: "8px", backgroundColor: "rgba(255,255,255,0.2)", borderRadius: "var(--radius-sm)" }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                    </div>
                  </div>
                  <div className={styles.statValue} style={{ color: "white", fontSize: "2.5rem" }}>₹{parseFloat(walletData?.balance || 0).toFixed(2)}</div>
                  <div className={styles.statLabel} style={{ color: "rgba(255,255,255,0.8)" }}>Available Balance</div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statHeader}>
                    <div className={styles.statIcon} style={{ color: "var(--warning)" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    </div>
                  </div>
                  <div className={styles.statValue}>₹{parseFloat(walletData?.pending_balance || 0).toFixed(2)}</div>
                  <div className={styles.statLabel}>Pending Clearance</div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statHeader}>
                    <div className={styles.statIcon} style={{ color: "var(--success)" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    </div>
                  </div>
                  <div className={styles.statValue}>₹{parseFloat(walletData?.total_earned || 0).toFixed(2)}</div>
                  <div className={styles.statLabel}>Total Earned</div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statHeader}>
                    <div className={styles.statIcon} style={{ color: "var(--text-muted)" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
                    </div>
                  </div>
                  <div className={styles.statValue}>₹{parseFloat(walletData?.total_withdrawn || 0).toFixed(2)}</div>
                  <div className={styles.statLabel}>Total Withdrawn</div>
                </div>
              </div>

              {/* Action and History */}
              <div className={styles.gridTwoCols}>
                <div className={styles.contentCard}>
                  <div className={styles.contentCardHeader}>
                    <h3>Request Payout</h3>
                  </div>
                  <div className={styles.contentCardBody}>
                    <form onSubmit={handleWithdraw} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                      <div>
                        <label style={{ display: "block", marginBottom: "8px", fontSize: "0.875rem", fontWeight: 600 }}>Withdrawal Amount (₹)</label>
                        <input 
                          type="number" 
                          required 
                          min="100" 
                          step="0.01"
                          max={walletData?.balance || 0}
                          placeholder="Min ₹100"
                          style={{ width: "100%", padding: "12px", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)" }}
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <label style={{ display: "block", marginBottom: "8px", fontSize: "0.875rem", fontWeight: 600 }}>Account Holder Name</label>
                        <input 
                          type="text" 
                          required 
                          style={{ width: "100%", padding: "12px", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)" }}
                          value={bankDetails.payout_bank_account_name}
                          onChange={(e) => setBankDetails({...bankDetails, payout_bank_account_name: e.target.value})}
                        />
                      </div>
                      
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        <div>
                          <label style={{ display: "block", marginBottom: "8px", fontSize: "0.875rem", fontWeight: 600 }}>Account Number</label>
                          <input 
                            type="text" 
                            required 
                            style={{ width: "100%", padding: "12px", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)" }}
                            value={bankDetails.bank_account_number}
                            onChange={(e) => setBankDetails({...bankDetails, bank_account_number: e.target.value})}
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", marginBottom: "8px", fontSize: "0.875rem", fontWeight: 600 }}>IFSC Code</label>
                          <input 
                            type="text" 
                            required 
                            style={{ width: "100%", padding: "12px", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)" }}
                            value={bankDetails.ifsc_code}
                            onChange={(e) => setBankDetails({...bankDetails, ifsc_code: e.target.value})}
                          />
                        </div>
                      </div>
                      <div style={{ fontSize: "0.813rem", color: "var(--text-secondary)" }}>
                        Funds will be transferred to your registered bank account within 2-3 business days.
                      </div>
                      <button type="submit" className="btn-primary" disabled={withdrawing || parseFloat(walletData?.balance || 0) < 100}>
                        {withdrawing ? "Processing..." : "Withdraw Funds"}
                      </button>
                    </form>
                  </div>
                </div>

                <div className={styles.contentCard}>
                  <div className={styles.contentCardHeader}>
                    <h3>Recent Earnings</h3>
                  </div>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Item</th>
                        <th style={{ textAlign: "right" }}>Earned (After Comm.)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!walletData?.recent_earnings || walletData.recent_earnings.length === 0 ? (
                        <tr><td colSpan={3} style={{ textAlign: "center", padding: "20px" }}>No recent earnings yet. Mark an order as "Completed" to receive earnings!</td></tr>
                      ) : (
                        walletData.recent_earnings.map((item: any) => (
                          <tr key={item.id}>
                            <td style={{ fontSize: "0.813rem", color: "var(--text-secondary)" }}>{item.order_number}</td>
                            <td style={{ fontWeight: 500 }}>{item.item_name}</td>
                            <td style={{ textAlign: "right", color: "var(--success)", fontWeight: 600 }}>+₹{parseFloat(item.earned_amount).toFixed(2)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
