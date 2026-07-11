"use client";
import { useState, useEffect } from "react";
import styles from "../../dashboard.module.css";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/ToastContext";

interface Order {
  id: number;
  order_number: string;
  status: string;
  tracking_notes?: string;
  [key: string]: any;
}

interface ModalState {
  open: boolean;
  orderId: number | null;
  orderNumber: string;
  currentStatus: string;
  newStatus: string;
  notes: string;
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending:    { bg: "#fef3c7", color: "#92400e" },
  processing: { bg: "#dbeafe", color: "#1e40af" },
  shipped:    { bg: "#e0e7ff", color: "#3730a3" },
  completed:  { bg: "#d1fae5", color: "#065f46" },
  cancelled:  { bg: "#fee2e2", color: "#991b1b" },
};

export default function VendorOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [modal, setModal] = useState<ModalState>({
    open: false,
    orderId: null,
    orderNumber: "",
    currentStatus: "",
    newStatus: "",
    notes: "",
  });
  const toast = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) return;

      const res = await api("/vendor/orders", { token });
      if (res.status === 200) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (order: Order) => {
    setModal({
      open: true,
      orderId: order.id,
      orderNumber: order.order_number,
      currentStatus: order.status,
      newStatus: order.status,
      notes: order.tracking_notes || "",
    });
  };

  const closeModal = () => {
    setModal({
      open: false,
      orderId: null,
      orderNumber: "",
      currentStatus: "",
      newStatus: "",
      notes: "",
    });
  };

  const updateStatus = async () => {
    const { orderId, newStatus, notes } = modal;
    if (!orderId) return;

    setUpdatingId(orderId);
    closeModal();

    try {
      const token = localStorage.getItem("auth-token");
      if (!token) return;

      const res = await api(`/vendor/orders/${orderId}`, {
        method: "PUT",
        token,
        body: { status: newStatus, tracking_notes: notes },
      });

      if (res.status === 200) {
        setOrders(prev =>
          prev.map(o =>
            o.id === orderId
              ? { ...o, status: newStatus, tracking_notes: notes || o.tracking_notes }
              : o
          )
        );
        toast.success("Status updated successfully");
      } else {
        toast.error("Failed to update status");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while updating status");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = filterStatus === "all" ? orders : orders.filter(o => o.status === filterStatus);

  return (
    <main className={styles.mainContent}>
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <h1>Orders</h1>
          <p>Manage fulfillment for your items.</p>
        </div>
        <div className={styles.topBarRight}>
          <select 
            value={filterStatus} 
            onChange={e => setFilterStatus(e.target.value)}
            style={{
              padding: "10px 16px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-light)",
              backgroundColor: "var(--surface-0)",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer"
            }}
          >
            <option value="all">All Orders</option>
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.pageContent}>
        <div className={styles.contentCard} style={{ overflowX: "auto" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px" }}>Loading orders…</div>
          ) : filteredOrders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px" }}>No orders found.</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Earned</th>
                  <th>Status</th>
                  <th>Tracking Notes</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => {
                  const statusStyle = STATUS_COLORS[order.status] || { bg: "#f3f4f6", color: "#374151" };
                return (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 600 }}>
                      {order.order_number}
                    </td>
                    <td>
                      {order.customer_name || order.user?.name || "—"}
                    </td>
                    <td>
                      {order.total_amount !== undefined
                        ? `₹${Number(order.total_amount).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
                        : "—"}
                    </td>
                    <td style={{ color: "var(--success)", fontWeight: 600 }}>
                      {order.earned_amount !== undefined
                        ? `₹${Number(order.earned_amount).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
                        : "—"}
                    </td>
                    <td>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 10px",
                          borderRadius: "999px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          textTransform: "capitalize",
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.color,
                        }}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td style={{ maxWidth: 200, color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                      {order.tracking_notes || <span style={{ opacity: 0.4 }}>—</span>}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        onClick={() => openModal(order)}
                        disabled={updatingId === order.id}
                        style={{ background: "none", border: "none", color: "var(--brand-600)", fontWeight: 600, cursor: "pointer", fontSize: "0.875rem" }}
                      >
                        {updatingId === order.id ? "Updating…" : "Update Status"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
      )}

      {/* ── Inline Status Update Modal ── */}
      {modal.open && (
        <div
          onClick={closeModal}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.55)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            padding: "16px",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              boxShadow: "0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.1)",
              padding: "32px",
              width: "100%",
              maxWidth: "440px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: "0.75rem", fontWeight: 500, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                  Update Order
                </p>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#111827", margin: 0 }}>
                  #{modal.orderNumber}
                </h2>
              </div>
              <button
                onClick={closeModal}
                aria-label="Close modal"
                style={{
                  background: "#f3f4f6",
                  border: "none",
                  borderRadius: "8px",
                  width: 36,
                  height: 36,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.1rem",
                  color: "#6b7280",
                  transition: "background 0.15s",
                }}
              >
                ✕
              </button>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "#f0f0f0" }} />

            {/* Status Select */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label
                htmlFor="modal-status-select"
                style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em" }}
              >
                Order Status
              </label>
              <div style={{ position: "relative" }}>
                <select
                  id="modal-status-select"
                  value={modal.newStatus}
                  onChange={e => setModal(m => ({ ...m, newStatus: e.target.value }))}
                  style={{
                    width: "100%",
                    appearance: "none",
                    WebkitAppearance: "none",
                    padding: "10px 40px 10px 14px",
                    borderRadius: "10px",
                    border: "1.5px solid #e5e7eb",
                    fontSize: "0.9rem",
                    fontWeight: 500,
                    color: "#111827",
                    background: "#f9fafb",
                    cursor: "pointer",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = "#6366f1")}
                  onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")}
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {/* Custom dropdown arrow */}
                <span
                  style={{
                    position: "absolute",
                    right: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                    color: "#9ca3af",
                    fontSize: "0.75rem",
                  }}
                >
                  ▼
                </span>
              </div>
            </div>

            {/* Tracking Notes Textarea */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label
                htmlFor="modal-notes-textarea"
                style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em" }}
              >
                Remarks / Tracking Notes
              </label>
              <textarea
                id="modal-notes-textarea"
                rows={4}
                placeholder="Add tracking info, shipment details, or any remarks…"
                value={modal.notes}
                onChange={e => setModal(m => ({ ...m, notes: e.target.value }))}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "1.5px solid #e5e7eb",
                  fontSize: "0.875rem",
                  color: "#111827",
                  background: "#f9fafb",
                  resize: "vertical",
                  outline: "none",
                  fontFamily: "inherit",
                  lineHeight: 1.6,
                  transition: "border-color 0.2s",
                  boxSizing: "border-box",
                }}
                onFocus={e => (e.currentTarget.style.borderColor = "#6366f1")}
                onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "4px" }}>
              <button
                onClick={closeModal}
                style={{
                  padding: "10px 20px",
                  borderRadius: "10px",
                  border: "1.5px solid #e5e7eb",
                  background: "#ffffff",
                  color: "#374151",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  transition: "background 0.15s, border-color 0.15s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "#f9fafb";
                  e.currentTarget.style.borderColor = "#d1d5db";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "#ffffff";
                  e.currentTarget.style.borderColor = "#e5e7eb";
                }}
              >
                Cancel
              </button>
              <button
                onClick={updateStatus}
                disabled={updatingId !== null}
                style={{
                  padding: "10px 24px",
                  borderRadius: "10px",
                  border: "none",
                  background: updatingId !== null ? "#9ca3af" : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  cursor: updatingId !== null ? "not-allowed" : "pointer",
                  boxShadow: updatingId !== null ? "none" : "0 4px 12px rgba(99,102,241,0.35)",
                  transition: "opacity 0.15s, transform 0.1s",
                }}
                onMouseEnter={e => {
                  if (updatingId === null) {
                    e.currentTarget.style.opacity = "0.9";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={e => {
                  if (updatingId === null) {
                    e.currentTarget.style.opacity = "1";
                    e.currentTarget.style.transform = "translateY(0)";
                  }
                }}
              >
                {updatingId !== null ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
          </div>
        </div>
    </main>
  );
}
