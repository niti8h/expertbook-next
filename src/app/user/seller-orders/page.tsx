"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/ToastContext";

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  item_title: string;
  item_type: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  commission_amount: number;
  earned_amount: number;
  payment_method: string;
  payment_status: string;
  delivery_address: any;
  status: string;
  tracking_notes: string;
  created_at: string;
  order_date: string;
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  pending:    { bg: "#fffbeb", color: "#b45309", border: "#fde68a" },
  processing: { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  shipped:    { bg: "#eef2ff", color: "#4338ca", border: "#c7d2fe" },
  completed:  { bg: "#ecfdf5", color: "#047857", border: "#a7f3d0" },
  cancelled:  { bg: "#fef2f2", color: "#b91c1c", border: "#fecaca" },
};

export default function VendorOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  
  // Slide-out panel state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState("");
  const [updateNotes, setUpdateNotes] = useState("");
  
  const toast = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) return;
      const res = await api("/user/seller/orders", { token });
      if (res.status === 200) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (order: Order) => {
    setSelectedOrder(order);
    setUpdateStatus(order.status);
    setUpdateNotes(order.tracking_notes || "");
  };

  const handleUpdate = async () => {
    if (!selectedOrder) return;
    setIsUpdating(true);
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) return;
      const res = await api(`/user/seller/orders/${selectedOrder.id}`, {
        method: "PUT",
        token,
        body: { status: updateStatus, tracking_notes: updateNotes },
      });
      if (res.status === 200) {
        setOrders(prev =>
          prev.map(o => o.id === selectedOrder.id ? { ...o, status: updateStatus, tracking_notes: updateNotes } : o)
        );
        setSelectedOrder({ ...selectedOrder, status: updateStatus, tracking_notes: updateNotes });
        toast.success("Order updated successfully!");
      } else {
        toast.error("Failed to update order");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredOrders = filterStatus === "all" ? orders : orders.filter(o => o.status === filterStatus);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", padding: "40px 20px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative" }}>
        
        {/* Header Section */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", margin: "0 0 8px 0" }}>Store Orders</h1>
            <p style={{ color: "#64748b", margin: 0, fontSize: "1.125rem" }}>Manage and fulfill incoming orders for your products and services.</p>
          </div>
          
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#475569" }}>Filter:</span>
            <select 
              value={filterStatus} 
              onChange={e => setFilterStatus(e.target.value)}
              style={{
                padding: "12px 20px", borderRadius: "12px", border: "1px solid #cbd5e1",
                backgroundColor: "white", fontSize: "0.938rem", fontWeight: 500, outline: "none", cursor: "pointer",
                boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
              }}
            >
              <option value="all">All Orders</option>
              {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#64748b", backgroundColor: "white", borderRadius: "24px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}>
            Loading your orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ padding: "80px 40px", textAlign: "center", backgroundColor: "white", borderRadius: "24px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "inline-flex", padding: "20px", backgroundColor: "#f1f5f9", borderRadius: "50%", marginBottom: "20px" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
            </div>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1e293b", margin: "0 0 8px 0" }}>No Orders Yet</h3>
            <p style={{ color: "#64748b", margin: 0 }}>You don't have any orders matching your criteria.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {filteredOrders.map(order => {
              const statusStyle = STATUS_COLORS[order.status] || { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" };
              const isProduct = order.item_type === "Product";
              
              return (
                <div 
                  key={order.id} 
                  onClick={() => handleRowClick(order)}
                  style={{ 
                    backgroundColor: "white", padding: "24px", borderRadius: "20px", 
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
                    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px",
                    alignItems: "center", cursor: "pointer", border: "1px solid transparent",
                    transition: "all 0.2s ease"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 10px 25px -5px rgba(0, 0, 0, 0.1)";
                    e.currentTarget.style.borderColor = "#e2e8f0";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)";
                    e.currentTarget.style.borderColor = "transparent";
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                      <span style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>#{order.order_number}</span>
                      <span style={{ 
                        padding: "4px 10px", borderRadius: "100px", fontSize: "0.75rem", fontWeight: 700,
                        backgroundColor: isProduct ? "#f3e8ff" : "#e0f2fe", 
                        color: isProduct ? "#7e22ce" : "#0369a1",
                        border: `1px solid ${isProduct ? "#e9d5ff" : "#bae6fd"}`
                      }}>
                        {order.item_type}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.875rem", color: "#64748b", display: "flex", alignItems: "center", gap: "6px" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                      {order.order_date}
                    </div>
                  </div>

                  <div>
                    <h4 style={{ margin: "0 0 4px 0", fontSize: "1rem", fontWeight: 600, color: "#1e293b" }}>{order.item_title}</h4>
                    <p style={{ margin: 0, fontSize: "0.875rem", color: "#64748b" }}>Qty: {order.quantity} × ₹{Number(order.unit_price).toLocaleString("en-IN", {maximumFractionDigits:0})}</p>
                  </div>

                  <div>
                    <div style={{ fontSize: "0.813rem", fontWeight: 600, textTransform: "uppercase", color: "#94a3b8", letterSpacing: "0.5px", marginBottom: "4px" }}>Customer</div>
                    <div style={{ fontSize: "0.938rem", fontWeight: 600, color: "#334155" }}>{order.customer_name}</div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.813rem", fontWeight: 600, textTransform: "uppercase", color: "#94a3b8", letterSpacing: "0.5px", marginBottom: "4px" }}>Net Earnings</div>
                    <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#10b981" }}>₹{Number(order.earned_amount).toLocaleString("en-IN", {maximumFractionDigits:0})}</div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                    <span style={{ 
                      padding: "6px 14px", borderRadius: "100px", fontSize: "0.813rem", fontWeight: 700,
                      backgroundColor: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}`,
                      textTransform: "uppercase", letterSpacing: "0.5px"
                    }}>
                      {order.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Side Drawer Modal */}
      {selectedOrder && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", justifyContent: "flex-end" }}>
          
          {/* Backdrop */}
          <div 
            onClick={() => setSelectedOrder(null)}
            style={{ position: "absolute", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)" }}
            className="animate-in fade-in duration-200"
          />

          {/* Drawer Panel */}
          <div 
            style={{ 
              position: "relative", width: "100%", maxWidth: "550px", backgroundColor: "white", 
              height: "100%", display: "flex", flexDirection: "column", boxShadow: "-10px 0 30px rgba(0,0,0,0.1)",
              animation: "slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
            }}
          >
            {/* Drawer Header */}
            <div style={{ padding: "32px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ margin: "0 0 4px 0", fontSize: "0.875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Order Details</p>
                <h2 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 800, color: "#0f172a" }}>#{selectedOrder.order_number}</h2>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                style={{ background: "#f1f5f9", border: "none", width: "40px", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            {/* Drawer Content - Scrollable */}
            <div style={{ padding: "32px", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "32px" }}>
              
              {/* Item Info */}
              <div style={{ backgroundColor: "#f8fafc", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                  <div>
                    <h3 style={{ margin: "0 0 4px 0", fontSize: "1.125rem", fontWeight: 700, color: "#1e293b" }}>{selectedOrder.item_title}</h3>
                    <p style={{ margin: 0, color: "#64748b", fontSize: "0.938rem" }}>{selectedOrder.item_type}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "1.125rem", fontWeight: 700, color: "#0f172a" }}>₹{Number(selectedOrder.total_amount).toLocaleString("en-IN", {maximumFractionDigits:0})}</div>
                    <div style={{ color: "#64748b", fontSize: "0.875rem" }}>Qty: {selectedOrder.quantity} × ₹{Number(selectedOrder.unit_price).toLocaleString("en-IN", {maximumFractionDigits:0})}</div>
                  </div>
                </div>
                
                <div style={{ borderTop: "1px dashed #cbd5e1", paddingTop: "16px", display: "flex", justifyContent: "space-between", fontSize: "0.938rem" }}>
                  <span style={{ color: "#64748b" }}>Platform Commission:</span>
                  <span style={{ color: "#ef4444", fontWeight: 600 }}>- ₹{Number(selectedOrder.commission_amount).toLocaleString("en-IN", {maximumFractionDigits:0})}</span>
                </div>
                <div style={{ marginTop: "12px", display: "flex", justifyContent: "space-between", fontSize: "1.125rem", fontWeight: 800 }}>
                  <span style={{ color: "#0f172a" }}>Your Net Earning:</span>
                  <span style={{ color: "#10b981" }}>₹{Number(selectedOrder.earned_amount).toLocaleString("en-IN", {maximumFractionDigits:0})}</span>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h4 style={{ margin: "0 0 16px 0", fontSize: "1.125rem", fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  Customer Information
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  <div>
                    <p style={{ margin: "0 0 4px 0", fontSize: "0.813rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Name</p>
                    <p style={{ margin: 0, fontWeight: 600, color: "#334155" }}>{selectedOrder.customer_name}</p>
                  </div>
                  <div>
                    <p style={{ margin: "0 0 4px 0", fontSize: "0.813rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Email</p>
                    <p style={{ margin: 0, fontWeight: 600, color: "#334155" }}>{selectedOrder.customer_email}</p>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <p style={{ margin: "0 0 4px 0", fontSize: "0.813rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Shipping Address</p>
                    {selectedOrder.delivery_address ? (
                      <div style={{ padding: "16px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                        <p style={{ margin: "0 0 4px 0", fontWeight: 600 }}>{selectedOrder.delivery_address.fullName}</p>
                        <p style={{ margin: 0, color: "#475569", fontSize: "0.938rem", lineHeight: 1.5 }}>
                          {selectedOrder.delivery_address.addressLine1}<br/>
                          {selectedOrder.delivery_address.addressLine2 && <>{selectedOrder.delivery_address.addressLine2}<br/></>}
                          {selectedOrder.delivery_address.city}, {selectedOrder.delivery_address.state} - {selectedOrder.delivery_address.pincode}<br/>
                          Phone: {selectedOrder.delivery_address.phone}
                        </p>
                      </div>
                    ) : (
                      <p style={{ margin: 0, color: "#94a3b8", fontStyle: "italic" }}>No address provided</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Metadata */}
              <div>
                <h4 style={{ margin: "0 0 16px 0", fontSize: "1.125rem", fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  Order Details
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  <div>
                    <p style={{ margin: "0 0 4px 0", fontSize: "0.813rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Date Placed</p>
                    <p style={{ margin: 0, fontWeight: 600, color: "#334155" }}>{selectedOrder.order_date}</p>
                  </div>
                  <div>
                    <p style={{ margin: "0 0 4px 0", fontSize: "0.813rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Payment Method</p>
                    <p style={{ margin: 0, fontWeight: 600, color: "#334155", textTransform: "uppercase" }}>{selectedOrder.payment_method}</p>
                  </div>
                  <div>
                    <p style={{ margin: "0 0 4px 0", fontSize: "0.813rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Payment Status</p>
                    <span style={{ 
                      display: "inline-block", padding: "4px 10px", borderRadius: "100px", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase",
                      backgroundColor: selectedOrder.payment_status === "paid" ? "#dcfce7" : "#fef3c7",
                      color: selectedOrder.payment_status === "paid" ? "#16a34a" : "#d97706"
                    }}>
                      {selectedOrder.payment_status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Fulfillment Actions */}
              <div>
                <h4 style={{ margin: "0 0 16px 0", fontSize: "1.125rem", fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  Update Fulfillment
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontSize: "0.938rem", fontWeight: 600, color: "#334155" }}>Status</label>
                    <select 
                      value={updateStatus} 
                      onChange={e => setUpdateStatus(e.target.value)}
                      style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "1rem", backgroundColor: "white", outline: "none" }}
                    >
                      {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontSize: "0.938rem", fontWeight: 600, color: "#334155" }}>Tracking / Fulfillment Notes</label>
                    <textarea 
                      rows={3} 
                      placeholder="Add tracking link, courier details, or delivery notes..."
                      value={updateNotes} 
                      onChange={e => setUpdateNotes(e.target.value)}
                      style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "1rem", fontFamily: "inherit", outline: "none", resize: "vertical" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div style={{ padding: "24px 32px", borderTop: "1px solid #e2e8f0", backgroundColor: "#f8fafc", display: "flex", gap: "16px", justifyContent: "flex-end" }}>
              <button 
                onClick={() => setSelectedOrder(null)}
                style={{ padding: "14px 28px", borderRadius: "100px", border: "1px solid #cbd5e1", backgroundColor: "white", color: "#475569", fontWeight: 600, fontSize: "1rem", cursor: "pointer" }}
              >
                Close
              </button>
              <button 
                onClick={handleUpdate}
                disabled={isUpdating}
                style={{ padding: "14px 28px", borderRadius: "100px", border: "none", backgroundColor: "var(--brand-600)", color: "white", fontWeight: 600, fontSize: "1rem", cursor: isUpdating ? "not-allowed" : "pointer", boxShadow: "0 4px 14px rgba(79, 70, 229, 0.4)", opacity: isUpdating ? 0.7 : 1 }}
              >
                {isUpdating ? "Saving..." : "Save Updates"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global CSS for animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}} />
    </div>
  );
}
