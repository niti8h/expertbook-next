"use client";
import { useState, useEffect } from "react";
import styles from "../../dashboard.module.css";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/ToastContext";

export default function AdminOrdersPage() {
  const toast = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) return;

      const res = await api("/admin/orders", { token });
      if (res.status === 200) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.mainContent}>
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <h1>Order Management</h1>
          <p>View all platform orders and their current status.</p>
        </div>
      </div>

      <div className={styles.pageContent}>
        <div className={styles.contentCard} style={{ overflowX: "auto" }}>
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>Loading orders...</div>
          ) : orders.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>No orders found.</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order Number</th>
                  <th>Customer</th>
                  <th>Total Amount</th>
                  <th>Payment Status</th>
                  <th>Order Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 600 }}>{order.order_number}</td>
                    <td>{order.user?.name} <br/><span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{order.user?.email}</span></td>
                    <td style={{ fontWeight: 600 }}>₹{parseFloat(order.total_amount || 0).toLocaleString()}</td>
                    <td>
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: "100px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        backgroundColor: order.payment_status === 'paid' ? "rgba(34, 197, 94, 0.1)" : "rgba(234, 179, 8, 0.1)",
                        color: order.payment_status === 'paid' ? "rgb(34, 197, 94)" : "rgb(202, 138, 4)"
                      }}>
                        {order.payment_status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: "100px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        backgroundColor: order.status === 'completed' ? "rgba(34, 197, 94, 0.1)" : (order.status === 'cancelled' ? "rgba(239, 68, 68, 0.1)" : "rgba(59, 130, 246, 0.1)"),
                        color: order.status === 'completed' ? "rgb(34, 197, 94)" : (order.status === 'cancelled' ? "rgb(239, 68, 68)" : "rgb(59, 130, 246)")
                      }}>
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "var(--radius-sm)",
                          border: "1px solid var(--border-light)",
                          backgroundColor: "transparent",
                          color: "var(--text-primary)",
                          fontSize: "0.813rem",
                          fontWeight: 500,
                          cursor: "pointer"
                        }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ backgroundColor: "white", borderRadius: "var(--radius-lg)", width: "100%", maxWidth: "700px", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            
            <div style={{ padding: "24px", borderBottom: "1px solid var(--border-light)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ margin: "0 0 4px 0", fontSize: "1.25rem" }}>Order {selectedOrder.order_number}</h2>
                <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.875rem" }}>Placed on {new Date(selectedOrder.created_at).toLocaleString()}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "var(--text-secondary)" }}
              >
                &times;
              </button>
            </div>

            <div style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
                <div>
                  <h3 style={{ fontSize: "0.875rem", textTransform: "uppercase", color: "var(--text-secondary)", letterSpacing: "0.05em", marginBottom: "8px" }}>Customer</h3>
                  <p style={{ margin: "0 0 4px 0", fontWeight: 500 }}>{selectedOrder.user?.name}</p>
                  <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.875rem" }}>{selectedOrder.user?.email}</p>
                  <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.875rem" }}>{selectedOrder.user?.phone}</p>
                </div>
                <div>
                  <h3 style={{ fontSize: "0.875rem", textTransform: "uppercase", color: "var(--text-secondary)", letterSpacing: "0.05em", marginBottom: "8px" }}>Shipping Address</h3>
                  {selectedOrder.shipping_address ? (
                    <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                      <p style={{ margin: "0 0 4px 0", color: "var(--text-primary)", fontWeight: 500 }}>{selectedOrder.shipping_address.label}</p>
                      <p style={{ margin: "0 0 2px 0" }}>{selectedOrder.shipping_address.address_line_1}</p>
                      {selectedOrder.shipping_address.address_line_2 && <p style={{ margin: "0 0 2px 0" }}>{selectedOrder.shipping_address.address_line_2}</p>}
                      <p style={{ margin: 0 }}>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.postal_code}</p>
                    </div>
                  ) : (
                    <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.875rem" }}>No shipping address provided.</p>
                  )}
                </div>
              </div>

              <h3 style={{ fontSize: "0.875rem", textTransform: "uppercase", color: "var(--text-secondary)", letterSpacing: "0.05em", marginBottom: "12px" }}>Order Items</h3>
              <div style={{ border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", overflow: "hidden", marginBottom: "24px" }}>
                <table className={styles.table} style={{ margin: 0 }}>
                  <thead>
                    <tr style={{ backgroundColor: "var(--surface-2)" }}>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items?.map((item: any) => (
                      <tr key={item.id}>
                        <td>
                          <div style={{ fontWeight: 500 }}>{item.itemable?.title || 'Unknown Item'}</div>
                          {item.tracking_notes && (
                            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "4px" }}>Note: {item.tracking_notes}</div>
                          )}
                        </td>
                        <td>{item.quantity}</td>
                        <td>₹{parseFloat(item.unit_price || 0).toLocaleString()}</td>
                        <td>
                          <span style={{
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            backgroundColor: item.status === 'completed' ? "rgba(34, 197, 94, 0.1)" : (item.status === 'cancelled' ? "rgba(239, 68, 68, 0.1)" : "rgba(234, 179, 8, 0.1)"),
                            color: item.status === 'completed' ? "rgb(34, 197, 94)" : (item.status === 'cancelled' ? "rgb(239, 68, 68)" : "rgb(202, 138, 4)")
                          }}>
                            {item.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {!selectedOrder.items?.length && (
                      <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--text-muted)" }}>No items found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div style={{ width: "250px", borderTop: "1px solid var(--border-light)", paddingTop: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                    <span>Subtotal</span>
                    <span>₹{parseFloat(selectedOrder.total_amount).toLocaleString()}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600, fontSize: "1.125rem" }}>
                    <span>Total</span>
                    <span>₹{parseFloat(selectedOrder.total_amount).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </main>
  );
}
