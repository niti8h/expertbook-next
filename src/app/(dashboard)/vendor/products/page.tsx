"use client";

import { useState, useEffect } from "react";
import styles from "../../dashboard.module.css";
import { api, multipartApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastContext";
import { useDialog } from "@/components/ui/DialogContext";

export default function VendorProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const dialog = useDialog();

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    compare_price: "",
    type: "physical",
    stock: "",
    category_id: 1, 
    status: "active",
    pincode_mode: "all",
    pincodes: "",
    vendor_commission_rate: ""
  });
  
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [digitalFile, setDigitalFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchUser();
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) return;
      const res = await api("/auth/me", { token });
      if (res.status === 200) {
        setUser(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api("/marketplace/categories?type=product");
      if (res.status === 200) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) {
        router.push("/login");
        return;
      }
      const res = await api("/vendor/products", { token });
      if (res.status === 200) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const allFiles = [...images, ...newFiles];
      setImages(allFiles);
      
      const fileArray = allFiles.map((file) => URL.createObjectURL(file));
      setImagePreviews(fileArray);
    }
  };

  const removeNewImage = (index: number) => {
    const newImagesList = [...images];
    newImagesList.splice(index, 1);
    setImages(newImagesList);
    
    const newPreviews = [...imagePreviews];
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
  };

  const resetForm = () => {
    setShowAddForm(false);
    setEditingId(null);
    setFormData({
      title: "", description: "", price: "", compare_price: "", type: "physical", stock: "", category_id: categories.length > 0 ? categories[0].id : 1, status: "active", pincode_mode: "all", pincodes: "", vendor_commission_rate: ""
    });
    setImages([]);
    setExistingImages([]);
    setDigitalFile(null);
    setImagePreviews([]);
    setSaving(false);
  };

  const handleEdit = (product: any) => {
    setFormData({
      title: product.title,
      description: product.description || "",
      price: product.price,
      compare_price: product.compare_price || "",
      type: product.type,
      stock: product.stock,
      category_id: product.category_id || (categories.length > 0 ? categories[0].id : 1),
      status: product.status,
      vendor_commission_rate: product.vendor_commission_rate || "",
      pincode_mode: "all", // this is from profile usually, keep default for edit
      pincodes: "",
    });
    setExistingImages(product.images || []);
    setEditingId(product.id);
    setShowAddForm(true);
  };

  const removeExistingImage = (index: number) => {
    const newImages = [...existingImages];
    newImages.splice(index, 1);
    setExistingImages(newImages);
  };

  const handleDelete = async (id: number) => {
    const confirmed = await dialog.confirm("Are you sure you want to delete this product?");
    if (!confirmed) return;
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) return;
      const res = await api(`/vendor/products/${id}`, {
        method: "DELETE",
        token,
      });
      if (res.status === 200) {
        toast.success("Product deleted successfully");
        fetchProducts();
      } else {
        toast.error("Failed to delete product");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) {
        toast.error("You must be logged in to save products.");
        router.push("/login");
        return;
      }

      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("description", formData.description);
      payload.append("price", formData.price);
      if (formData.compare_price) payload.append("compare_price", formData.compare_price);
      payload.append("type", formData.type);
      payload.append("stock", formData.stock);
      payload.append("category_id", formData.category_id.toString());
      payload.append("status", formData.status);
      if (formData.vendor_commission_rate) payload.append("vendor_commission_rate", formData.vendor_commission_rate);
      
      if (!editingId) {
        payload.append("pincode_mode", formData.pincode_mode);
        if (formData.pincodes) payload.append("pincodes", formData.pincodes);
      } else {
        existingImages.forEach((img, idx) => {
          payload.append(`existing_images[${idx}]`, img);
        });
      }

      if (images && images.length > 0) {
        images.forEach((img) => {
          payload.append("images[]", img);
        });
      }
      
      if (digitalFile) {
        payload.append("digital_file", digitalFile);
      }

      const endpoint = editingId ? `/vendor/products/${editingId}` : "/vendor/products";
      const method = editingId ? "PUT" : "POST";

      const res = await multipartApi(endpoint, {
        method,
        body: payload,
        token,
      });

      if (res.status === 201 || res.status === 200) {
        toast.success(editingId ? "Product updated successfully!" : "Product created successfully!");
        resetForm();
        fetchProducts();
      } else {
        toast.error(res.data?.message || "Failed to save product");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <main className={styles.mainContent} style={{ position: "relative" }}>
        <div className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <h1>Products</h1>
            <p>Manage your physical and digital product catalog.</p>
          </div>
          <div className={styles.topBarRight}>
            {!showAddForm && (
              <button className="btn-primary" onClick={() => {
                if (user && !user.has_complete_vendor_profile) {
                  toast.error("You must complete your vendor profile first before posting products. Please go to the Profile section and fill in your Store Name.");
                  router.push("/vendor/profile");
                  return;
                }
                setShowAddForm(true);
              }}>
                + Add Product
              </button>
            )}
          </div>
        </div>

        <div className={styles.pageContent} style={{ paddingBottom: showAddForm ? "100px" : "0" }}>
          {showAddForm ? (
            <form onSubmit={handleSubmit}>
              <div style={{ 
                maxWidth: "800px", 
                margin: "0 auto", 
                backgroundColor: "var(--surface-0)", 
                borderRadius: "16px", 
                overflow: "hidden", 
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)"
              }}>
                <div style={{ padding: "32px", borderBottom: "1px solid var(--border-light)" }}>
                  <h2 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                    {editingId ? "Edit Product" : "Create New Product"}
                  </h2>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", margin: "4px 0 0 0" }}>
                    Fill out the details below to {editingId ? "update your" : "add a new"} product to your store.
                  </p>
                </div>

                <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
                  
                  {/* Basic Information */}
                  <div style={{ background: "var(--surface-1)", padding: "24px", borderRadius: "12px", border: "1px solid var(--border-light)" }}>
                    <h4 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "20px", color: "var(--text-primary)" }}>Basic Information</h4>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                      <div>
                        <label style={{ display: "block", marginBottom: "8px", fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)" }}>Title <span style={{color: "var(--danger)"}}>*</span></label>
                        <input 
                          type="text" 
                          required 
                          style={{ 
                            width: "100%", padding: "12px 16px", border: "1px solid var(--border-light)", 
                            borderRadius: "8px", fontSize: "0.938rem", transition: "border-color 0.2s",
                            backgroundColor: "var(--surface-0)"
                          }}
                          value={formData.title}
                          onChange={(e) => setFormData({...formData, title: e.target.value})}
                          placeholder="e.g. Handmade Ceramic Mug"
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", marginBottom: "8px", fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)" }}>Description</label>
                        <textarea 
                          rows={4}
                          style={{ 
                            width: "100%", padding: "12px 16px", border: "1px solid var(--border-light)", 
                            borderRadius: "8px", fontSize: "0.938rem", fontFamily: "inherit", transition: "border-color 0.2s",
                            backgroundColor: "var(--surface-0)", resize: "vertical"
                          }}
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          placeholder="Describe your product..."
                        />
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        <div>
                          <label style={{ display: "block", marginBottom: "8px", fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)" }}>Category</label>
                          <select 
                            style={{ 
                              width: "100%", padding: "12px 16px", border: "1px solid var(--border-light)", 
                              borderRadius: "8px", fontSize: "0.938rem", backgroundColor: "var(--surface-0)"
                            }}
                            value={formData.category_id}
                            onChange={(e) => setFormData({...formData, category_id: parseInt(e.target.value)})}
                          >
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label style={{ display: "block", marginBottom: "8px", fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)" }}>Type</label>
                          <select 
                            style={{ 
                              width: "100%", padding: "12px 16px", border: "1px solid var(--border-light)", 
                              borderRadius: "8px", fontSize: "0.938rem", backgroundColor: "var(--surface-0)"
                            }}
                            value={formData.type}
                            onChange={(e) => setFormData({...formData, type: e.target.value})}
                          >
                            <option value="physical">Physical Product</option>
                            <option value="digital">Digital Product</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Inventory */}
                  <div style={{ background: "var(--surface-1)", padding: "24px", borderRadius: "12px", border: "1px solid var(--border-light)" }}>
                    <h4 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "20px", color: "var(--text-primary)" }}>Pricing & Inventory</h4>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
                      <div>
                        <label style={{ display: "block", marginBottom: "8px", fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)" }}>Price (₹) <span style={{color: "var(--danger)"}}>*</span></label>
                        <input 
                          type="number" 
                          required 
                          min="0" step="0.01"
                          style={{ 
                            width: "100%", padding: "12px 16px", border: "1px solid var(--border-light)", 
                            borderRadius: "8px", fontSize: "0.938rem", backgroundColor: "var(--surface-0)"
                          }}
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: e.target.value})}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: "8px", fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)" }}>Compare Price</label>
                        <input 
                          type="number" 
                          min="0" step="0.01"
                          style={{ 
                            width: "100%", padding: "12px 16px", border: "1px solid var(--border-light)", 
                            borderRadius: "8px", fontSize: "0.938rem", backgroundColor: "var(--surface-0)"
                          }}
                          value={formData.compare_price}
                          onChange={(e) => setFormData({...formData, compare_price: e.target.value})}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: "8px", fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)" }}>Stock <span style={{color: "var(--danger)"}}>*</span></label>
                        <input 
                          type="number" 
                          required 
                          min="0"
                          style={{ 
                            width: "100%", padding: "12px 16px", border: "1px solid var(--border-light)", 
                            borderRadius: "8px", fontSize: "0.938rem", backgroundColor: "var(--surface-0)"
                          }}
                          value={formData.stock}
                          onChange={(e) => setFormData({...formData, stock: e.target.value})}
                          placeholder="10"
                        />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px" }}>
                      <div>
                        <label style={{ display: "block", marginBottom: "8px", fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)" }}>Status</label>
                        <select 
                          style={{ 
                            width: "100%", padding: "12px 16px", border: "1px solid var(--border-light)", 
                            borderRadius: "8px", fontSize: "0.938rem", backgroundColor: "var(--surface-0)"
                          }}
                          value={formData.status}
                          onChange={(e) => setFormData({...formData, status: e.target.value})}
                        >
                          <option value="draft">Draft</option>
                          <option value="active">Active</option>
                          <option value="out_of_stock">Out of Stock</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: "8px", fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)" }}>Commission Rate (%)</label>
                        <input 
                          type="number" 
                          min="0" step="0.01" max="100"
                          style={{ 
                            width: "100%", padding: "12px 16px", border: "1px solid var(--border-light)", 
                            borderRadius: "8px", fontSize: "0.938rem", backgroundColor: "var(--surface-0)"
                          }}
                          value={formData.vendor_commission_rate}
                          onChange={(e) => setFormData({...formData, vendor_commission_rate: e.target.value})}
                          placeholder="Default"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Media */}
                  <div style={{ background: "var(--surface-1)", padding: "24px", borderRadius: "12px", border: "1px solid var(--border-light)" }}>
                    <h4 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "20px", color: "var(--text-primary)" }}>Product Images</h4>
                    
                    <div style={{ marginBottom: "16px" }}>
                      <label style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "32px",
                        border: "2px dashed var(--brand-600)",
                        borderRadius: "12px",
                        backgroundColor: "rgba(79, 70, 229, 0.05)",
                        cursor: "pointer",
                        transition: "background-color 0.2s"
                      }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--brand-600)" strokeWidth="2" style={{ marginBottom: "12px" }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        <span style={{ fontSize: "0.938rem", fontWeight: 600, color: "var(--brand-600)" }}>Click to upload images</span>
                        <span style={{ fontSize: "0.813rem", color: "var(--text-secondary)", marginTop: "4px" }}>PNG, JPG, WEBP up to 2MB</span>
                        <input 
                          type="file" 
                          multiple 
                          accept="image/*"
                          hidden
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>

                    {(existingImages.length > 0 || imagePreviews.length > 0) && (
                      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "20px" }}>
                        {existingImages.map((img, idx) => (
                          <div key={`exist-${idx}`} style={{ position: "relative", width: "100px", height: "100px", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--border-light)", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                            <img src={`http://localhost:8000${img}`} alt="Product" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            <button 
                              type="button" 
                              onClick={() => removeExistingImage(idx)}
                              style={{ position: "absolute", top: 4, right: 4, background: "rgba(255, 0, 0, 0.8)", color: "white", border: "none", borderRadius: "50%", width: "24px", height: "24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                          </div>
                        ))}
                        {imagePreviews.map((src, idx) => (
                          <div key={`new-${idx}`} style={{ position: "relative", width: "100px", height: "100px", borderRadius: "8px", overflow: "hidden", border: "2px solid var(--brand-600)", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                            <img src={src} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(79, 70, 229, 0.8)", color: "white", fontSize: "0.625rem", textAlign: "center", padding: "2px 0", fontWeight: 600 }}>NEW</div>
                            <button 
                              type="button" 
                              onClick={() => removeNewImage(idx)}
                              style={{ position: "absolute", top: 4, right: 4, background: "rgba(255, 0, 0, 0.8)", color: "white", border: "none", borderRadius: "50%", width: "24px", height: "24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Digital & Delivery */}
                  {formData.type === "digital" && (
                    <div style={{ background: "var(--surface-1)", padding: "24px", borderRadius: "12px", border: "1px solid var(--border-light)" }}>
                      <h4 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px", color: "var(--text-primary)" }}>Digital Attachment</h4>
                      <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "16px" }}>Upload the file that the customer will receive upon purchase.</p>
                      <input 
                        type="file" 
                        style={{ 
                          width: "100%", padding: "12px", border: "1px dashed var(--border-light)", 
                          borderRadius: "8px", backgroundColor: "var(--surface-0)" 
                        }}
                        onChange={(e) => setDigitalFile(e.target.files ? e.target.files[0] : null)}
                      />
                    </div>
                  )}

                  {!editingId && formData.type === "physical" && (
                    <div style={{ background: "var(--surface-1)", padding: "24px", borderRadius: "12px", border: "1px solid var(--border-light)" }}>
                      <h4 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "20px", color: "var(--text-primary)" }}>Delivery Rules</h4>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px" }}>
                        <div>
                          <label style={{ display: "block", marginBottom: "8px", fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)" }}>Delivery Mode</label>
                          <select 
                            style={{ 
                              width: "100%", padding: "12px 16px", border: "1px solid var(--border-light)", 
                              borderRadius: "8px", fontSize: "0.938rem", backgroundColor: "var(--surface-0)"
                            }}
                            value={formData.pincode_mode}
                            onChange={(e) => setFormData({...formData, pincode_mode: e.target.value})}
                          >
                            <option value="all">Deliver Everywhere</option>
                            <option value="whitelist">Only specific pincodes</option>
                            <option value="blacklist">Everywhere EXCEPT these</option>
                          </select>
                        </div>
                        {formData.pincode_mode !== "all" && (
                          <div>
                            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)" }}>Pincodes (Comma separated)</label>
                            <input 
                              type="text" 
                              placeholder="e.g. 110001, 110002"
                              style={{ 
                                width: "100%", padding: "12px 16px", border: "1px solid var(--border-light)", 
                                borderRadius: "8px", fontSize: "0.938rem", backgroundColor: "var(--surface-0)"
                              }}
                              value={formData.pincodes}
                              onChange={(e) => setFormData({...formData, pincodes: e.target.value})}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Sticky Save Bar */}
              <div style={{
                position: "fixed",
                bottom: "24px",
                left: "50%",
                transform: "translateX(calc(-50% + 125px))",
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(12px)",
                padding: "16px 32px",
                borderRadius: "100px",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0,0,0,0.05)",
                display: "flex",
                alignItems: "center",
                gap: "24px",
                zIndex: 100
              }}>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={resetForm}
                  style={{ padding: "10px 24px", borderRadius: "100px", fontSize: "0.938rem", border: "none", backgroundColor: "transparent" }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={saving}
                  style={{ 
                    padding: "10px 24px", 
                    borderRadius: "100px",
                    fontSize: "0.938rem",
                    boxShadow: "0 4px 14px 0 rgba(79, 70, 229, 0.39)"
                  }}
                >
                  {saving ? "Saving Product..." : (editingId ? "Update Product" : "Save Product")}
                </button>
              </div>
            </form>
          ) : (
            <div className={styles.contentCard} style={{ overflowX: "auto" }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Product</th>
                    <th>Type</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>Loading your products...</td></tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: "80px 20px" }}>
                        <svg style={{ margin: "0 auto 16px" }} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--border-light)" strokeWidth="1"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                        <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "8px" }}>No products yet</h3>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "20px" }}>Get started by creating your first product.</p>
                        <button className="btn-primary" onClick={() => setShowAddForm(true)}>+ Add Product</button>
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product.id}>
                        <td style={{ width: "80px" }}>
                          {product.images && product.images.length > 0 ? (
                            <img src={`http://localhost:8000${product.images[0]}`} alt="img" style={{ width: "48px", height: "48px", borderRadius: "8px", objectFit: "cover", border: "1px solid var(--border-light)" }} />
                          ) : (
                            <div style={{ width: "48px", height: "48px", borderRadius: "8px", background: "var(--surface-2)", border: "1px solid var(--border-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                            </div>
                          )}
                        </td>
                        <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{product.title}</td>
                        <td style={{ textTransform: "capitalize", color: "var(--text-secondary)" }}>{product.type}</td>
                        <td style={{ fontWeight: 500 }}>₹{product.price}</td>
                        <td>
                          <span style={{ 
                            padding: "4px 8px", 
                            borderRadius: "12px", 
                            backgroundColor: product.stock > 0 ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                            color: product.stock > 0 ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)",
                            fontSize: "0.75rem",
                            fontWeight: 600
                          }}>
                            {product.stock} in stock
                          </span>
                        </td>
                        <td>
                          <span className={`${styles.statusBadge} ${product.status === 'active' ? styles.statusCompleted : styles.statusPending}`}>
                            {product.status}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button onClick={() => handleEdit(product)} style={{ background: "none", border: "none", color: "var(--brand-600)", fontWeight: 600, cursor: "pointer", marginRight: "16px" }}>Edit</button>
                          <button onClick={() => handleDelete(product.id)} style={{ background: "none", border: "none", color: "var(--danger)", fontWeight: 600, cursor: "pointer" }}>Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
