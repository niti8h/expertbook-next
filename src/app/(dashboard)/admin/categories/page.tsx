"use client";

import { useState, useEffect } from "react";
import styles from "../../dashboard.module.css";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/ToastContext";

export default function AdminCategoriesPage() {
  const toast = useToast();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState("product");
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) return;

      const res = await api("/admin/categories", { token });
      if (res.status === 200) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setName("");
    setType("product");
    setIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = (cat: any) => {
    setEditingId(cat.id);
    setName(cat.name);
    setType(cat.type || "product");
    setIsActive(cat.is_active === 1 || cat.is_active === true);
    setModalOpen(true);
  };

  const saveCategory = async () => {
    if (!name.trim()) return toast.error("Name is required");
    setSubmitting(true);
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) return;

      const url = editingId ? `/admin/categories/${editingId}` : "/admin/categories";
      const method = editingId ? "PUT" : "POST";

      const res = await api(url, {
        method,
        token,
        body: { name, type, is_active: isActive },
      });

      if (res.status === 200 || res.status === 201) {
        toast.success(editingId ? "Category updated" : "Category created");
        setModalOpen(false);
        fetchCategories();
      } else {
        toast.error("Failed to save category");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteCategory = async (id: number) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) return;

      const res = await api(`/admin/categories/${id}`, {
        method: "DELETE",
        token,
      });

      if (res.status === 200) {
        toast.success("Category deleted");
        fetchCategories();
      } else {
        toast.error("Failed to delete category");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    }
  };

  return (
    <main className={styles.mainContent}>
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <h1>Category Management</h1>
          <p>Organize products and services into categories.</p>
        </div>
        <div className={styles.topBarRight}>
          <button onClick={openAddModal} className={styles.primaryBtn}>Add Category</button>
        </div>
      </div>

      <div className={styles.pageContent}>
        <div style={{ display: "flex", gap: "24px", marginBottom: "24px", borderBottom: "1px solid var(--border-light)" }}>
          {["all", "product", "service"].map((tab) => (
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
                transition: "all 0.2s ease"
              }}
            >
              {tab === "all" ? "All Categories" : `${tab}s`}
            </button>
          ))}
        </div>

        <div className={styles.contentCard} style={{ overflowX: "auto" }}>
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>Loading categories...</div>
          ) : categories.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>No categories found.</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.filter(cat => activeTab === "all" ? true : cat.type === activeTab).map((cat) => (
                  <tr key={cat.id}>
                    <td style={{ fontWeight: 500 }}>{cat.name}</td>
                    <td style={{ color: "var(--text-secondary)" }}>{cat.slug}</td>
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
                        {cat.type}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: "100px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        backgroundColor: cat.is_active ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                        color: cat.is_active ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)"
                      }}>
                        {cat.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "12px" }}>
                        <button onClick={() => openEditModal(cat)} style={{ background: "none", border: "none", color: "var(--brand-500)", cursor: "pointer", fontWeight: 500 }}>Edit</button>
                        <button onClick={() => deleteCategory(cat.id)} style={{ background: "none", border: "none", color: "var(--danger-500)", cursor: "pointer", fontWeight: 500 }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Category Modal */}
      {modalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ backgroundColor: "white", borderRadius: "var(--radius-lg)", width: "100%", maxWidth: "400px", padding: "32px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <h2 style={{ margin: "0 0 24px 0", fontSize: "1.5rem" }}>{editingId ? "Edit Category" : "Add Category"}</h2>
            
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className={styles.input}
                placeholder="e.g. Electronics"
              />
            </div>
            
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>Type</label>
              <select value={type} onChange={e => setType(e.target.value)} className={styles.input}>
                <option value="product">Product</option>
                <option value="service">Service</option>
              </select>
            </div>
            
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>Status</label>
              <select value={isActive ? "true" : "false"} onChange={e => setIsActive(e.target.value === "true")} className={styles.input}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button 
                onClick={() => setModalOpen(false)}
                style={{ padding: "10px 20px", background: "none", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", cursor: "pointer", fontWeight: 500 }}
              >
                Cancel
              </button>
              <button 
                onClick={saveCategory}
                disabled={submitting}
                style={{ padding: "10px 20px", backgroundColor: "var(--brand-500)", color: "white", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", fontWeight: 500, opacity: submitting ? 0.7 : 1 }}
              >
                {submitting ? "Saving..." : "Save Category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
