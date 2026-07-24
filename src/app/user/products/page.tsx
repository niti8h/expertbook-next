"use client";
import { getImageUrl } from "@/lib/utils";
import { useState, useEffect } from "react";
import { api, multipartApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastContext";
import { useDialog } from "@/components/ui/DialogContext";
import { Plus, Edit, Trash2, Box, Image as ImageIcon, Package, CheckCircle } from "lucide-react";

export default function UserProducts() {
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
    pincodes: ""
  });
  
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [digitalFile, setDigitalFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

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
      const res = await api("/user/products", { token });
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
      title: "", description: "", price: "", compare_price: "", type: "physical", stock: "", category_id: categories.length > 0 ? categories[0].id : 1, status: "active", pincode_mode: "all", pincodes: ""
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
      pincode_mode: "all",
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
      const res = await api(`/user/products/${id}`, {
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

      const endpoint = editingId ? `/user/products/${editingId}` : "/user/products";
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
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", paddingBottom: "120px", position: "relative" }}>
      {/* Background Decor */}
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "300px", background: "linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(234, 179, 8, 0.05) 100%)", pointerEvents: "none" }} />
      
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px", position: "relative", zIndex: 10 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
          <div>
            <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#1e293b", margin: 0, display: "flex", alignItems: "center", gap: "12px" }}>
              <Package size={36} color="var(--brand-600)" /> My Products
            </h1>
            <p style={{ color: "#64748b", marginTop: "8px", fontSize: "1.125rem" }}>Manage your physical and digital product catalog.</p>
          </div>
          {!showAddForm && (
            <button 
              onClick={() => setShowAddForm(true)}
              style={{ 
                display: "flex", alignItems: "center", gap: "8px",
                padding: "12px 24px", backgroundColor: "var(--brand-600)", color: "white", 
                border: "none", borderRadius: "100px", fontSize: "1rem", fontWeight: 600, 
                cursor: "pointer", boxShadow: "0 10px 15px -3px rgba(79, 70, 229, 0.3)",
                transition: "transform 0.2s, box-shadow 0.2s"
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 15px 20px -3px rgba(79, 70, 229, 0.4)"; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(79, 70, 229, 0.3)"; }}
            >
              <Plus size={20} /> Add Product
            </button>
          )}
        </div>

        {showAddForm ? (
          <div style={{ 
            backgroundColor: "white", borderRadius: "24px", 
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)",
            overflow: "hidden"
          }}>
            <div style={{ padding: "32px 40px", borderBottom: "1px solid #f1f5f9", backgroundColor: "#f8fafc" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, color: "#0f172a" }}>
                {editingId ? "Edit Product" : "Create New Product"}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div style={{ padding: "40px", display: "flex", flexDirection: "column", gap: "40px" }}>
                
                {/* Basic Info */}
                <div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#1e293b", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Box size={20} color="#64748b" /> Basic Details
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontWeight: 500, color: "#334155" }}>Title <span style={{color:"#ef4444"}}>*</span></label>
                      <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="E.g., Handmade Ceramic Mug"
                        style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "1rem", outline: "none", transition: "border-color 0.2s" }}
                        onFocus={(e) => e.target.style.borderColor = "var(--brand-500)"} onBlur={(e) => e.target.style.borderColor = "#cbd5e1"}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontWeight: 500, color: "#334155" }}>Description</label>
                      <textarea rows={4} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Describe your product..."
                        style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "1rem", outline: "none", transition: "border-color 0.2s", fontFamily: "inherit", resize: "vertical" }}
                        onFocus={(e) => e.target.style.borderColor = "var(--brand-500)"} onBlur={(e) => e.target.style.borderColor = "#cbd5e1"}
                      />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                      <div>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: 500, color: "#334155" }}>Category</label>
                        <select value={formData.category_id} onChange={(e) => setFormData({...formData, category_id: parseInt(e.target.value)})}
                          style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "1rem", outline: "none", backgroundColor: "white" }}>
                          {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: 500, color: "#334155" }}>Product Type</label>
                        <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}
                          style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "1rem", outline: "none", backgroundColor: "white" }}>
                          <option value="physical">Physical Product</option>
                          <option value="digital">Digital Product</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ height: "1px", backgroundColor: "#f1f5f9" }} />

                {/* Pricing & Inventory */}
                <div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#1e293b", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <CheckCircle size={20} color="#64748b" /> Pricing & Inventory
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontWeight: 500, color: "#334155" }}>Price (₹) <span style={{color:"#ef4444"}}>*</span></label>
                      <input type="number" required min="0" step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} placeholder="0.00"
                        style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "1rem", outline: "none" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontWeight: 500, color: "#334155" }}>Compare Price (₹)</label>
                      <input type="number" min="0" step="0.01" value={formData.compare_price} onChange={(e) => setFormData({...formData, compare_price: e.target.value})} placeholder="0.00"
                        style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "1rem", outline: "none" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontWeight: 500, color: "#334155" }}>Stock <span style={{color:"#ef4444"}}>*</span></label>
                      <input type="number" required min="0" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} placeholder="10"
                        style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "1rem", outline: "none" }} />
                    </div>
                  </div>
                  <div style={{ marginTop: "20px" }}>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: 500, color: "#334155" }}>Status</label>
                    <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}
                      style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "1rem", outline: "none", backgroundColor: "white" }}>
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="out_of_stock">Out of Stock</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div style={{ height: "1px", backgroundColor: "#f1f5f9" }} />

                {/* Media */}
                <div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#1e293b", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <ImageIcon size={20} color="#64748b" /> Product Images
                  </h3>
                  <label style={{
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    padding: "40px", border: "2px dashed #cbd5e1", borderRadius: "16px", backgroundColor: "#f8fafc",
                    cursor: "pointer", transition: "all 0.2s"
                  }} onMouseOver={(e) => e.currentTarget.style.borderColor = "var(--brand-500)"} onMouseOut={(e) => e.currentTarget.style.borderColor = "#cbd5e1"}>
                    <ImageIcon size={40} color="#94a3b8" style={{ marginBottom: "16px" }} />
                    <span style={{ fontSize: "1rem", fontWeight: 600, color: "var(--brand-600)" }}>Click to upload images</span>
                    <span style={{ fontSize: "0.875rem", color: "#64748b", marginTop: "4px" }}>PNG, JPG, WEBP up to 2MB</span>
                    <input type="file" multiple accept="image/*" hidden onChange={handleImageChange} />
                  </label>
                  
                  {(existingImages.length > 0 || imagePreviews.length > 0) && (
                    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "24px" }}>
                      {existingImages.map((img, idx) => (
                        <div key={`exist-${idx}`} style={{ position: "relative", width: "120px", height: "120px", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
                          <img src={getImageUrl(img)} alt="Product" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          <button type="button" onClick={() => removeExistingImage(idx)} style={{ position: "absolute", top: 8, right: 8, background: "rgba(239, 68, 68, 0.9)", color: "white", border: "none", borderRadius: "50%", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      {imagePreviews.map((src, idx) => (
                        <div key={`new-${idx}`} style={{ position: "relative", width: "120px", height: "120px", borderRadius: "12px", overflow: "hidden", border: "2px solid var(--brand-500)", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
                          <img src={src} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "var(--brand-600)", color: "white", fontSize: "0.7rem", textAlign: "center", padding: "4px 0", fontWeight: 600 }}>NEW</div>
                          <button type="button" onClick={() => removeNewImage(idx)} style={{ position: "absolute", top: 8, right: 8, background: "rgba(239, 68, 68, 0.9)", color: "white", border: "none", borderRadius: "50%", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Digital / Delivery Logic */}
                {formData.type === "digital" && (
                  <>
                    <div style={{ height: "1px", backgroundColor: "#f1f5f9" }} />
                    <div>
                      <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#1e293b", marginBottom: "12px" }}>Digital Attachment</h3>
                      <p style={{ color: "#64748b", marginBottom: "16px" }}>Upload the file that the customer will receive upon purchase.</p>
                      <input type="file" onChange={(e) => setDigitalFile(e.target.files ? e.target.files[0] : null)}
                        style={{ width: "100%", padding: "14px", border: "1px dashed #cbd5e1", borderRadius: "12px", backgroundColor: "#f8fafc" }} />
                    </div>
                  </>
                )}
                {!editingId && formData.type === "physical" && (
                  <>
                    <div style={{ height: "1px", backgroundColor: "#f1f5f9" }} />
                    <div>
                      <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#1e293b", marginBottom: "20px" }}>Delivery Rules</h3>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px" }}>
                        <div>
                          <label style={{ display: "block", marginBottom: "8px", fontWeight: 500, color: "#334155" }}>Delivery Mode</label>
                          <select value={formData.pincode_mode} onChange={(e) => setFormData({...formData, pincode_mode: e.target.value})}
                            style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "1rem", outline: "none", backgroundColor: "white" }}>
                            <option value="all">Deliver Everywhere</option>
                            <option value="whitelist">Only specific pincodes</option>
                            <option value="blacklist">Everywhere EXCEPT these</option>
                          </select>
                        </div>
                        {formData.pincode_mode !== "all" && (
                          <div>
                            <label style={{ display: "block", marginBottom: "8px", fontWeight: 500, color: "#334155" }}>Pincodes (Comma separated)</label>
                            <input type="text" placeholder="e.g. 110001, 110002" value={formData.pincodes} onChange={(e) => setFormData({...formData, pincodes: e.target.value})}
                              style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "1rem", outline: "none" }} />
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Floating Save Bar */}
              <div style={{
                position: "fixed", bottom: "110px", left: "50%", transform: "translateX(-50%)",
                backgroundColor: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(16px)",
                padding: "16px 32px", borderRadius: "100px",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0,0,0,0.05)",
                display: "flex", alignItems: "center", justifyContent: "space-between", 
                width: "90%", maxWidth: "500px", zIndex: 100
              }}>
                <button type="button" onClick={resetForm}
                  style={{ padding: "12px 24px", borderRadius: "100px", fontSize: "1rem", fontWeight: 600, border: "none", backgroundColor: "transparent", color: "#64748b", cursor: "pointer" }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  style={{ 
                    padding: "12px 32px", borderRadius: "100px", fontSize: "1rem", fontWeight: 600, 
                    border: "none", backgroundColor: "var(--brand-600)", color: "white", cursor: "pointer",
                    boxShadow: "0 4px 14px 0 rgba(79, 70, 229, 0.39)", transition: "opacity 0.2s", opacity: saving ? 0.7 : 1
                  }}>
                  {saving ? "Saving..." : (editingId ? "Update Product" : "Save Product")}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div>
            {loading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "100px", color: "#94a3b8" }}>
                Loading your products...
              </div>
            ) : products.length === 0 ? (
              <div style={{ 
                backgroundColor: "white", padding: "80px 40px", borderRadius: "24px", 
                textAlign: "center", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)"
              }}>
                <div style={{ display: "inline-flex", padding: "20px", backgroundColor: "#f8fafc", borderRadius: "50%", marginBottom: "24px" }}>
                  <Package size={48} color="#cbd5e1" />
                </div>
                <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1e293b", marginBottom: "12px" }}>No products yet</h3>
                <p style={{ color: "#64748b", fontSize: "1.125rem", marginBottom: "32px", maxWidth: "400px", margin: "0 auto 32px" }}>
                  You haven't added any products to your store. Create your first product to start selling!
                </p>
                <button onClick={() => setShowAddForm(true)}
                  style={{ 
                    padding: "14px 32px", backgroundColor: "var(--brand-600)", color: "white", 
                    border: "none", borderRadius: "100px", fontSize: "1.125rem", fontWeight: 600, 
                    cursor: "pointer", boxShadow: "0 10px 15px -3px rgba(79, 70, 229, 0.3)"
                  }}>
                  + Add Product
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
                {products.map((product) => (
                  <div key={product.id} style={{ 
                    backgroundColor: "white", borderRadius: "20px", overflow: "hidden", 
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)",
                    transition: "transform 0.2s, box-shadow 0.2s", display: "flex", flexDirection: "column"
                  }} onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.1)"; }} onMouseOut={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.05)"; }}>
                    
                    <div style={{ height: "200px", position: "relative", backgroundColor: "#f1f5f9" }}>
                      {product.images && product.images.length > 0 ? (
                        <img src={getImageUrl(product.images[0])} alt={product.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <ImageIcon size={48} color="#cbd5e1" />
                        </div>
                      )}
                      <div style={{ position: "absolute", top: "12px", right: "12px", display: "flex", gap: "8px" }}>
                        <span style={{ 
                          padding: "4px 12px", borderRadius: "100px", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase",
                          backgroundColor: product.status === "active" ? "#dcfce7" : "#f1f5f9", color: product.status === "active" ? "#16a34a" : "#64748b"
                        }}>
                          {product.status}
                        </span>
                        <span style={{ 
                          padding: "4px 12px", borderRadius: "100px", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase",
                          backgroundColor: "white", color: "#0f172a", boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                        }}>
                          {product.type}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column" }}>
                      <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#1e293b", margin: "0 0 8px 0" }}>{product.title}</h3>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: "16px" }}>
                        <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--brand-600)" }}>₹{product.price}</div>
                        <div style={{ fontSize: "0.875rem", fontWeight: 600, color: product.stock > 0 ? "#16a34a" : "#ef4444" }}>
                          {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                        </div>
                      </div>
                    </div>

                    <div style={{ padding: "16px 24px", borderTop: "1px solid #f1f5f9", display: "flex", gap: "12px" }}>
                      <button onClick={() => handleEdit(product)} style={{ 
                        flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", backgroundColor: "white",
                        color: "#334155", fontSize: "0.938rem", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer", transition: "background-color 0.2s"
                      }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"} onMouseOut={(e) => e.currentTarget.style.backgroundColor = "white"}>
                        <Edit size={16} /> Edit
                      </button>
                      <button onClick={() => handleDelete(product.id)} style={{ 
                        flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #fee2e2", backgroundColor: "#fef2f2",
                        color: "#ef4444", fontSize: "0.938rem", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer", transition: "background-color 0.2s"
                      }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#fee2e2"} onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#fef2f2"}>
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
