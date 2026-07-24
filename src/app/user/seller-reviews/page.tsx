"use client";
import { getImageUrl } from "@/lib/utils";

import { useState, useEffect } from "react";
import styles from "../../(dashboard)/dashboard.module.css";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/ToastContext";

export default function VendorReviews() {
  const toast = useToast();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) return;

      const res = await api("/user/seller/reviews", { token });
      if (res.status === 200) {
        setReviews(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openReplyModal = (review: any) => {
    setSelectedReviewId(review.id);
    setReplyText(review.vendor_reply || "");
    setReplyModalOpen(true);
  };

  const submitReply = async () => {
    if (!selectedReviewId) return;
    setSubmittingReply(true);
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) return;

      const res = await api(`/user/seller/reviews/${selectedReviewId}/reply`, {
        method: "PUT",
        token,
        body: { vendor_reply: replyText },
      });

      if (res.status === 200) {
        setReviews(reviews.map(r => r.id === selectedReviewId ? { ...r, vendor_reply: replyText } : r));
        setReplyModalOpen(false);
        toast.success("Reply submitted successfully");
      } else {
        toast.error("Failed to submit reply");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <main className={styles.mainContent}>
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <h1>Customer Reviews</h1>
          <p>View and respond to feedback from your customers.</p>
        </div>
      </div>

      <div className={styles.pageContent}>

      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className={styles.emptyState}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <h3>No Reviews Yet</h3>
          <p>You haven't received any reviews yet.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {reviews.map((review) => (
            <div key={review.id} className={styles.contentCard} style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "var(--surface-2)", overflow: "hidden" }}>
                    {review.user?.avatar ? (
                      <img src={getImageUrl(review.user.avatar)} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "1.2rem", fontWeight: 600 }}>
                        {review.user?.name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, margin: "0 0 4px 0" }}>{review.user?.name}</p>
                    <div style={{ display: "flex", gap: "2px" }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} style={{ color: star <= review.rating ? "#eab308" : "#d1d5db", fontSize: "0.875rem" }}>★</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                  <span style={{ fontSize: "0.813rem", color: "var(--text-muted)" }}>
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                  <p style={{ fontSize: "0.875rem", margin: 0, fontWeight: 500 }}>
                    For: {review.reviewable?.title}
                  </p>
                </div>
              </div>

              {review.comment && (
                <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 16px 0" }}>
                  {review.comment}
                </p>
              )}

              {review.image && (
                <div style={{ marginBottom: "16px" }}>
                  <img src={getImageUrl(review.image)} alt="Review photo" style={{ borderRadius: "var(--radius-sm)", maxHeight: "150px", border: "1px solid var(--border-light)" }} />
                </div>
              )}

              <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--surface-2)" }}>
                {review.vendor_reply ? (
                  <div style={{ backgroundColor: "var(--surface-1)", padding: "16px", borderRadius: "var(--radius-md)", borderLeft: "4px solid var(--brand-500)", position: "relative" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <p style={{ fontSize: "0.813rem", fontWeight: 600, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>
                        Your Response
                      </p>
                      <button 
                        onClick={() => openReplyModal(review)}
                        style={{ background: "none", border: "none", color: "var(--brand-500)", cursor: "pointer", fontSize: "0.875rem", fontWeight: 500 }}
                      >
                        Edit
                      </button>
                    </div>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.938rem", margin: 0, lineHeight: 1.5 }}>
                      {review.vendor_reply}
                    </p>
                  </div>
                ) : (
                  <button 
                    onClick={() => openReplyModal(review)}
                    style={{ 
                      padding: "8px 16px", 
                      background: "white", 
                      border: "1px solid var(--border-light)", 
                      borderRadius: "var(--radius-md)", 
                      cursor: "pointer", 
                      fontWeight: 500,
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>
                    Reply to Review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply Modal */}
      {replyModalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ backgroundColor: "white", borderRadius: "var(--radius-lg)", width: "100%", maxWidth: "500px", padding: "32px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)" }}>
            <h2 style={{ margin: "0 0 24px 0", fontSize: "1.5rem" }}>Reply to Review</h2>
            
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>Your Response</label>
              <textarea 
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Thank the customer or address their concerns..."
                style={{ width: "100%", padding: "12px", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", minHeight: "120px", fontFamily: "inherit" }}
              />
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button 
                onClick={() => setReplyModalOpen(false)}
                style={{ padding: "10px 20px", background: "none", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", cursor: "pointer", fontWeight: 500 }}
              >
                Cancel
              </button>
              <button 
                onClick={submitReply}
                disabled={submittingReply}
                style={{ padding: "10px 20px", backgroundColor: "var(--brand-500)", color: "white", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", fontWeight: 500, opacity: submittingReply ? 0.7 : 1 }}
              >
                {submittingReply ? "Submitting..." : "Submit Reply"}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </main>
  );
}
