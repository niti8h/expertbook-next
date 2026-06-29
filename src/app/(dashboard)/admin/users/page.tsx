"use client";

import { useState, useEffect } from "react";
import styles from "../../dashboard.module.css";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/ToastContext";

export default function AdminUsersPage() {
  const toast = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [togglingId, setTogglingId] = useState<number | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) return;

      const res = await api("/admin/users", { token });
      if (res.status === 200) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: number) => {
    setTogglingId(id);
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) return;

      const res = await api(`/admin/users/${id}/toggle-status`, {
        method: "POST",
        token,
      });

      if (res.status === 200) {
        setUsers(users.map(u => u.id === id ? { ...u, is_active: !u.is_active } : u));
        toast.success("User status updated successfully");
      } else {
        toast.error("Failed to update user status");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <main className={styles.mainContent}>
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <h1>User Management</h1>
          <p>Manage all platform users, vendors, and service providers.</p>
        </div>
      </div>

      <div className={styles.pageContent}>
        <div style={{ display: "flex", gap: "24px", marginBottom: "24px", borderBottom: "1px solid var(--border-light)", overflowX: "auto" }}>
          {["all", "customer", "vendor", "provider", "affiliate"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: "none",
                border: "none",
                padding: "0 0 12px 0",
                cursor: "pointer",
                fontWeight: activeTab === tab ? 600 : 500,
                color: activeTab === tab ? "var(--brand-500)" : "var(--text-secondary)",
                borderBottom: activeTab === tab ? "2px solid var(--brand-500)" : "2px solid transparent",
                textTransform: "capitalize",
                fontSize: "0.938rem",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap"
              }}
            >
              {tab === "all" ? "All Users" : `${tab}s`}
            </button>
          ))}
        </div>

        <div className={styles.contentCard} style={{ overflowX: "auto" }}>
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>Loading users...</div>
          ) : users.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>No users found.</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.filter(u => activeTab === "all" ? true : u.role?.slug === activeTab).map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, color: "var(--text-secondary)" }}>
                          {user.name?.charAt(0)}
                        </div>
                        <span style={{ fontWeight: 500 }}>{user.name}</span>
                      </div>
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>{user.email}</td>
                    <td>
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: "100px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        backgroundColor: "var(--surface-2)",
                        color: "var(--text-primary)",
                        textTransform: "capitalize"
                      }}>
                        {user.role?.name || 'Customer'}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: "100px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        backgroundColor: user.is_active ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                        color: user.is_active ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)"
                      }}>
                        {user.is_active ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => window.location.href = `/admin/users/${user.id}`}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "var(--radius-sm)",
                            border: "1px solid var(--border-light)",
                            backgroundColor: "transparent",
                            color: "var(--text-primary)",
                            fontSize: "0.813rem",
                            fontWeight: 500,
                            cursor: "pointer",
                          }}
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => toggleStatus(user.id)}
                          disabled={togglingId === user.id}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "var(--radius-sm)",
                            border: `1px solid ${user.is_active ? "var(--danger-500)" : "var(--success-500)"}`,
                            backgroundColor: "transparent",
                            color: user.is_active ? "var(--danger-500)" : "var(--success-500)",
                            fontSize: "0.813rem",
                            fontWeight: 500,
                            cursor: "pointer",
                            opacity: togglingId === user.id ? 0.5 : 1
                          }}
                        >
                          {user.is_active ? 'Block' : 'Unblock'}
                        </button>
                      </div>
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
