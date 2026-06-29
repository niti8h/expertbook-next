"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Link from "next/link";
import { useToast } from "@/components/ui/ToastContext";

export default function UserOrdersPage() {
  const router = useRouter();
  const toast = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewImage, setReviewImage] = useState<File | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) {
        router.push("/login");
        return;
      }
      const res = await api("/user/orders", { token });
      if (res.status === 200) {
        setOrders(res.data.data.data || res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openReviewModal = (item: any) => {
    setSelectedItemId(item.id);
    const existingReview = item.itemable?.reviews?.[0];
    if (existingReview) {
      setEditingReviewId(existingReview.id);
      setRating(existingReview.rating);
      setComment(existingReview.comment || "");
    } else {
      setEditingReviewId(null);
      setRating(5);
      setComment("");
    }
    setReviewImage(null);
    setReviewModalOpen(true);
  };

  const submitReview = async () => {
    if (!selectedItemId) return;
    setSubmittingReview(true);
    try {
      const token = localStorage.getItem("auth-token");
      
      const formData = new FormData();
      if (!editingReviewId) {
        formData.append("order_item_id", selectedItemId.toString());
      }
      formData.append("rating", rating.toString());
      if (comment) formData.append("comment", comment);
      if (reviewImage) formData.append("image", reviewImage);

      const url = editingReviewId 
        ? `http://localhost:8000/api/user/reviews/${editingReviewId}` 
        : "http://localhost:8000/api/user/reviews";

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        toast.success(editingReviewId ? "Review updated successfully!" : "Review submitted successfully!");
        setReviewModalOpen(false);
        fetchOrders(); // refresh to get the updated review
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to submit review");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--surface-0)", color: "var(--text-primary)" }}>
      <div style={{ backgroundColor: "var(--surface-1)", padding: "40px", borderBottom: "1px solid var(--border-light)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: 0 }}>My Orders</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "8px" }}>View and track your purchase history.</p>
        </div>
      </div>

      <main style={{ maxWidth: "1200px", margin: "40px auto", padding: "0 40px", position: "relative" }}>
        {loading ? (
          <div style={{ padding: "60px", textAlign: "center", color: "var(--text-muted)" }}>Loading orders...</div>
        ) : orders.length === 0 ? (
          <div style={{ padding: "80px", textAlign: "center", backgroundColor: "white", borderRadius: "var(--radius-md)", border: "1px solid var(--border-light)" }}>
            <svg style={{ margin: "0 auto 16px" }} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--border-light)" strokeWidth="1"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "8px" }}>No orders yet</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>Looks like you haven't made any purchases.</p>
            <Link href="/products" className="btn-primary" style={{ textDecoration: "none" }}>Start Shopping</Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {orders.map((order) => (
              <div key={order.id} style={{ backgroundColor: "white", borderRadius: "var(--radius-md)", border: "1px solid var(--border-light)", overflow: "hidden" }}>
                <div style={{ padding: "16px 24px", backgroundColor: "var(--surface-1)", borderBottom: "1px solid var(--border-light)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: "32px" }}>
                    <div>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.5px", margin: "0 0 4px 0" }}>Order Number</p>
                      <p style={{ fontSize: "0.938rem", fontWeight: 500, margin: 0 }}>{order.order_number}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.5px", margin: "0 0 4px 0" }}>Total Amount</p>
                      <p style={{ fontSize: "0.938rem", fontWeight: 600, margin: 0, color: "var(--text-primary)" }}>₹{order.total_amount}</p>
                    </div>
                  </div>
                  <div>
                    {/* Removed overall order status since statuses are per-item */}
                  </div>
                </div>
                
                <div style={{ padding: "24px" }}>
                  {order.items?.map((item: any) => (
                    <div key={item.id}>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px", paddingBottom: "16px", borderBottom: "1px solid var(--surface-2)", marginBottom: "16px" }}>
                      <div style={{ width: "64px", height: "64px", backgroundColor: "var(--surface-1)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", overflow: "hidden" }}>
                         <img src={`http://localhost:8000${item.itemable?.images?.[0] || item.itemable?.store_banner || ''}`} alt="Item" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: "1rem", fontWeight: 600, margin: "0 0 4px 0" }}>{item.itemable?.title}</h4>
                        <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", margin: 0 }}>Sold by: {item.vendor?.vendor_profile?.store_name || "Vendor"}</p>
                      </div>
                      <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                        <div>
                          <p style={{ fontSize: "0.938rem", fontWeight: 600, margin: "0 0 4px 0" }}>₹{item.unit_price}</p>
                          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", margin: 0 }}>Qty: {item.quantity}</p>
                        </div>
                        {item.status && (
                          <span style={{ 
                            padding: "4px 8px", 
                            borderRadius: "100px", 
                            fontSize: "0.7rem", 
                            fontWeight: 600,
                            backgroundColor: item.status === 'completed' ? "rgba(34, 197, 94, 0.1)" : "rgba(234, 179, 8, 0.1)",
                            color: item.status === 'completed' ? "rgb(34, 197, 94)" : "rgb(202, 138, 4)",
                            marginBottom: "4px"
                          }}>
                            {item.status.toUpperCase()}
                          </span>
                        )}
                        {item.status === 'completed' && (
                          item.itemable?.reviews?.[0] ? (
                            <div style={{ textAlign: "right" }}>
                              <div style={{ display: "flex", gap: "2px", justifyContent: "flex-end", marginBottom: "4px" }}>
                                {[1, 2, 3, 4, 5].map(star => (
                                  <span key={star} style={{ color: star <= item.itemable.reviews[0].rating ? "#eab308" : "#d1d5db", fontSize: "12px" }}>★</span>
                                ))}
                              </div>
                              <button 
                                onClick={() => openReviewModal(item)}
                                style={{ 
                                  padding: "4px 12px", 
                                  fontSize: "0.813rem", 
                                  backgroundColor: "transparent", 
                                  border: "1px solid var(--brand-500)",
                                  color: "var(--brand-500)",
                                  borderRadius: "4px", 
                                  cursor: "pointer" 
                                }}>
                                Edit Review
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => openReviewModal(item)}
                              style={{ 
                                padding: "4px 12px", 
                                fontSize: "0.813rem", 
                                backgroundColor: "white", 
                                border: "1px solid var(--border-light)", 
                                borderRadius: "4px", 
                                cursor: "pointer" 
                              }}>
                              Rate & Review
                            </button>
                          )
                        )}
                      </div>
                      </div>
                      {item.tracking_notes && (
                        <div style={{ padding: "12px 16px", backgroundColor: "var(--surface-1)", borderRadius: "var(--radius-sm)", marginBottom: "16px", fontSize: "0.875rem" }}>
                          <strong style={{ color: "var(--text-primary)" }}>Vendor Notes:</strong> <span style={{ color: "var(--text-secondary)" }}>{item.tracking_notes}</span>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: "24px" }}>
                    <div>
                      <h4 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "8px", color: "var(--text-primary)" }}>Shipping Address</h4>
                      <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                        {order.shipping_address?.address}<br />
                        {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.pincode}
                      </p>
                    </div>
                    <div>
                      <h4 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "8px", color: "var(--text-primary)" }}>Payment</h4>
                      <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", margin: 0, textTransform: "uppercase" }}>{order.payment_method}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Review Modal */}
      {reviewModalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ backgroundColor: "white", borderRadius: "var(--radius-lg)", width: "100%", maxWidth: "500px", padding: "32px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)" }}>
            <h2 style={{ margin: "0 0 24px 0", fontSize: "1.5rem" }}>Write a Review</h2>
            
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>Rating</label>
              <div style={{ display: "flex", gap: "8px" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star}
                    onClick={() => setRating(star)}
                    style={{ 
                      background: "none", 
                      border: "none", 
                      cursor: "pointer", 
                      fontSize: "24px",
                      color: star <= rating ? "#eab308" : "#d1d5db"
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>Your Feedback</label>
              <textarea 
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="What did you like or dislike?"
                style={{ width: "100%", padding: "12px", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", minHeight: "100px", fontFamily: "inherit" }}
              />
            </div>

            <div style={{ marginBottom: "32px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>Add a Photo (Optional)</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={e => {
                  if (e.target.files && e.target.files.length > 0) {
                    setReviewImage(e.target.files[0]);
                  }
                }}
                style={{ width: "100%", padding: "8px", border: "1px dashed var(--border-light)", borderRadius: "var(--radius-md)" }}
              />
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button 
                onClick={() => setReviewModalOpen(false)}
                style={{ padding: "10px 20px", background: "none", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", cursor: "pointer", fontWeight: 500 }}
              >
                Cancel
              </button>
              <button 
                onClick={submitReview}
                disabled={submittingReview}
                className="btn-primary"
                style={{ padding: "10px 20px", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", fontWeight: 500, opacity: submittingReview ? 0.7 : 1 }}
              >
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
