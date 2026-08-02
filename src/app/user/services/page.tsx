"use client";
import { getImageUrl } from "@/lib/utils";
import { useState, useEffect } from "react";
import { api, multipartApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastContext";
import { useDialog } from "@/components/ui/DialogContext";
import { Plus, Edit, Trash2, LayoutGrid, Image as ImageIcon, Briefcase, MapPin, CheckCircle } from "lucide-react";

export default function UserServices() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const router = useRouter();
  const toast = useToast();
  const dialog = useDialog();

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    price_type: "fixed",
    category_id: 0,
    status: "active",
    pincode_mode: "all",
    pincodes: ""
  });

  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api("/marketplace/categories?type=service");
      if (res.status === 200) {
        setCategories(res.data.data);
        if (res.data.data.length > 0) {
          setFormData((prev) => ({ ...prev, category_id: res.data.data[0].id }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) {
        router.push("/login");
        return;
      }
      const res = await api("/user/services", { token });
      if (res.status === 200) {
        setServices(res.data.data);
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
      title: "", description: "", price: "", price_type: "fixed", category_id: categories.length > 0 ? categories[0].id : 1, status: "active", pincode_mode: "all", pincodes: ""
    });
    setImages([]);
    setExistingImages([]);
    setImagePreviews([]);
    setSaving(false);
  };

  const handleEdit = (service: any) => {
    setFormData({
      title: service.title,
      description: service.description || "",
      price: service.price,
      price_type: service.price_type,
      category_id: service.category_id || (categories.length > 0 ? categories[0].id : 1),
      status: service.status,
      pincode_mode: "all",
      pincodes: "",
    });
    setExistingImages(service.images || []);
    setEditingId(service.id);
    setShowAddForm(true);
  };

  const removeExistingImage = (index: number) => {
    const newImages = [...existingImages];
    newImages.splice(index, 1);
    setExistingImages(newImages);
  };

  const handleDelete = async (id: number) => {
    const confirmed = await dialog.confirm("Are you sure you want to delete this service?");
    if (!confirmed) return;
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) return;
      const res = await api(`/user/services/${id}`, {
        method: "DELETE",
        token,
      });
      if (res.status === 200) {
        toast.success("Service deleted successfully");
        fetchServices();
      } else {
        toast.error("Failed to delete service");
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
        toast.error("You must be logged in to save services.");
        router.push("/login");
        return;
      }

      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("description", formData.description);
      payload.append("price", formData.price);
      payload.append("price_type", formData.price_type);
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

      if (images) {
        Array.from(images).forEach((img) => {
          payload.append("images[]", img);
        });
      }

      const endpoint = editingId ? `/user/services/${editingId}` : "/user/services";
      const method = editingId ? "PUT" : "POST";

      const res = await multipartApi(endpoint, {
        method,
        body: payload,
        token,
      });

      if (res.status === 201 || res.status === 200) {
        toast.success(editingId ? "Service updated successfully!" : "Service created successfully!");
        resetForm();
        fetchServices();
      } else {
        toast.error(res.data?.message || "Failed to save service");
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
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "300px", background: "linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px", position: "relative", zIndex: 10 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
          <div>
            <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#1e293b", margin: 0, display: "flex", alignItems: "center", gap: "12px" }}>
              <Briefcase size={36} color="#059669" /> My Services
            </h1>
            <p style={{ color: "#64748b", marginTop: "8px", fontSize: "1.125rem" }}>Manage your professional services and bookings.</p>
          </div>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "12px 24px", backgroundColor: "#059669", color: "white",
                border: "none", borderRadius: "100px", fontSize: "1rem", fontWeight: 600,
                cursor: "pointer", boxShadow: "0 10px 15px -3px rgba(5, 150, 105, 0.3)",
                transition: "transform 0.2s, box-shadow 0.2s"
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 15px 20px -3px rgba(5, 150, 105, 0.4)"; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(5, 150, 105, 0.3)"; }}
            >
              <Plus size={20} /> Add Service
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
                {editingId ? "Edit Service" : "Create New Service"}
              </h2>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ padding: "40px", display: "flex", flexDirection: "column", gap: "40px" }}>

                {/* Basic Info */}
                <div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#1e293b", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <LayoutGrid size={20} color="#64748b" /> Basic Details
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontWeight: 500, color: "#334155" }}>Title <span style={{ color: "#ef4444" }}>*</span></label>
                      <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="E.g., Professional Plumbing Services"
                        style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "1rem", outline: "none", transition: "border-color 0.2s" }}
                        onFocus={(e) => e.target.style.borderColor = "#059669"} onBlur={(e) => e.target.style.borderColor = "#cbd5e1"}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontWeight: 500, color: "#334155" }}>Description</label>
                      <textarea rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe your service..."
                        style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "1rem", outline: "none", transition: "border-color 0.2s", fontFamily: "inherit", resize: "vertical" }}
                        onFocus={(e) => e.target.style.borderColor = "#059669"} onBlur={(e) => e.target.style.borderColor = "#cbd5e1"}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontWeight: 500, color: "#334155" }}>Category</label>
                      <select value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: parseInt(e.target.value) })}
                        style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "1rem", outline: "none", backgroundColor: "white" }}>
                        <option value="" >Select a category</option>
                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div style={{ height: "1px", backgroundColor: "#f1f5f9" }} />

                {/* Pricing */}
                <div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#1e293b", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <CheckCircle size={20} color="#64748b" /> Pricing Model
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontWeight: 500, color: "#334155" }}>Price (₹) <span style={{ color: "#ef4444" }}>*</span></label>
                      <input type="number" required min="0" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="0.00"
                        style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "1rem", outline: "none" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontWeight: 500, color: "#334155" }}>Price Type</label>
                      <select value={formData.price_type} onChange={(e) => setFormData({ ...formData, price_type: e.target.value })}
                        style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "1rem", outline: "none", backgroundColor: "white" }}>
                        <option value="fixed">Fixed Price</option>
                        <option value="hourly">Hourly Rate</option>
                        <option value="starting_at">Starting At</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ marginTop: "20px" }}>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: 500, color: "#334155" }}>Status</label>
                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "1rem", outline: "none", backgroundColor: "white" }}>
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div style={{ height: "1px", backgroundColor: "#f1f5f9" }} />

                {/* Location Settings */}
                {!editingId && (
                  <div>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#1e293b", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <MapPin size={20} color="#64748b" /> Service Area (Pincodes)
                    </h3>
                    <div style={{ backgroundColor: "#f8fafc", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
                        <div>
                          <label style={{ display: "block", marginBottom: "8px", fontWeight: 500, color: "#334155" }}>Pincode Mode</label>
                          <select value={formData.pincode_mode} onChange={(e) => setFormData({ ...formData, pincode_mode: e.target.value })}
                            style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "1rem", outline: "none", backgroundColor: "white" }}>
                            <option value="all">Anywhere (All Pincodes)</option>
                            <option value="whitelist">Only specific pincodes</option>
                            <option value="blacklist">Anywhere EXCEPT specific pincodes</option>
                          </select>
                        </div>
                        {formData.pincode_mode !== "all" && (
                          <div>
                            <label style={{ display: "block", marginBottom: "8px", fontWeight: 500, color: "#334155" }}>Pincodes (Comma separated)</label>
                            <input type="text" placeholder="e.g. 110001, 110002" value={formData.pincodes} onChange={(e) => setFormData({ ...formData, pincodes: e.target.value })}
                              style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "1rem", outline: "none" }} />
                            <p style={{ margin: "8px 0 0", fontSize: "0.875rem", color: "#64748b" }}>Separate multiple pincodes with a comma.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ height: "1px", backgroundColor: "#f1f5f9" }} />

                {/* Media */}
                <div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#1e293b", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <ImageIcon size={20} color="#64748b" /> Service Images
                  </h3>
                  <label style={{
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    padding: "40px", border: "2px dashed #cbd5e1", borderRadius: "16px", backgroundColor: "#f8fafc",
                    cursor: "pointer", transition: "all 0.2s"
                  }} onMouseOver={(e) => e.currentTarget.style.borderColor = "#059669"} onMouseOut={(e) => e.currentTarget.style.borderColor = "#cbd5e1"}>
                    <ImageIcon size={40} color="#94a3b8" style={{ marginBottom: "16px" }} />
                    <span style={{ fontSize: "1rem", fontWeight: 600, color: "#059669" }}>Click to upload images</span>
                    <span style={{ fontSize: "0.875rem", color: "#64748b", marginTop: "4px" }}>PNG, JPG, WEBP up to 2MB</span>
                    <input type="file" multiple accept="image/*" hidden onChange={handleImageChange} />
                  </label>

                  {(existingImages.length > 0 || imagePreviews.length > 0) && (
                    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "24px" }}>
                      {existingImages.map((img, idx) => (
                        <div key={`exist-${idx}`} style={{ position: "relative", width: "120px", height: "120px", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
                          <img src={getImageUrl(img)} alt="Service" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          <button type="button" onClick={() => removeExistingImage(idx)} style={{ position: "absolute", top: 8, right: 8, background: "rgba(239, 68, 68, 0.9)", color: "white", border: "none", borderRadius: "50%", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      {imagePreviews.map((src, idx) => (
                        <div key={`new-${idx}`} style={{ position: "relative", width: "120px", height: "120px", borderRadius: "12px", overflow: "hidden", border: "2px solid #059669", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
                          <img src={src} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "#059669", color: "white", fontSize: "0.7rem", textAlign: "center", padding: "4px 0", fontWeight: 600 }}>NEW</div>
                          <button type="button" onClick={() => removeNewImage(idx)} style={{ position: "absolute", top: 8, right: 8, background: "rgba(239, 68, 68, 0.9)", color: "white", border: "none", borderRadius: "50%", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

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
                    border: "none", backgroundColor: "#059669", color: "white", cursor: "pointer",
                    boxShadow: "0 4px 14px 0 rgba(5, 150, 105, 0.39)", transition: "opacity 0.2s", opacity: saving ? 0.7 : 1
                  }}>
                  {saving ? "Saving..." : (editingId ? "Update Service" : "Save Service")}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div>
            {loading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "100px", color: "#94a3b8" }}>
                Loading your services...
              </div>
            ) : services.length === 0 ? (
              <div style={{
                backgroundColor: "white", padding: "80px 40px", borderRadius: "24px",
                textAlign: "center", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)"
              }}>
                <div style={{ display: "inline-flex", padding: "20px", backgroundColor: "#f8fafc", borderRadius: "50%", marginBottom: "24px" }}>
                  <Briefcase size={48} color="#cbd5e1" />
                </div>
                <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1e293b", marginBottom: "12px" }}>No services yet</h3>
                <p style={{ color: "#64748b", fontSize: "1.125rem", marginBottom: "32px", maxWidth: "400px", margin: "0 auto 32px" }}>
                  You haven't listed any services. Start offering your professional skills to clients!
                </p>
                <button onClick={() => setShowAddForm(true)}
                  style={{
                    padding: "14px 32px", backgroundColor: "#059669", color: "white",
                    border: "none", borderRadius: "100px", fontSize: "1.125rem", fontWeight: 600,
                    cursor: "pointer", boxShadow: "0 10px 15px -3px rgba(5, 150, 105, 0.3)"
                  }}>
                  + Add Service
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
                {services.map((service) => (
                  <div key={service.id} style={{
                    backgroundColor: "white", borderRadius: "20px", overflow: "hidden",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)",
                    transition: "transform 0.2s, box-shadow 0.2s", display: "flex", flexDirection: "column"
                  }} onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.1)"; }} onMouseOut={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.05)"; }}>

                    <div style={{ height: "200px", position: "relative", backgroundColor: "#f1f5f9" }}>
                      {service.images && service.images.length > 0 ? (
                        <img src={getImageUrl(service.images[0])} alt={service.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <ImageIcon size={48} color="#cbd5e1" />
                        </div>
                      )}
                      <div style={{ position: "absolute", top: "12px", right: "12px", display: "flex", gap: "8px" }}>
                        <span style={{
                          padding: "4px 12px", borderRadius: "100px", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase",
                          backgroundColor: service.status === "active" ? "#dcfce7" : "#f1f5f9", color: service.status === "active" ? "#16a34a" : "#64748b"
                        }}>
                          {service.status}
                        </span>
                        <span style={{
                          padding: "4px 12px", borderRadius: "100px", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase",
                          backgroundColor: "white", color: "#0f172a", boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                        }}>
                          {service.price_type.replace("_", " ")}
                        </span>
                      </div>
                    </div>

                    <div style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column" }}>
                      <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#1e293b", margin: "0 0 8px 0" }}>{service.title}</h3>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: "16px" }}>
                        <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#059669" }}>
                          {service.price_type === 'starting_at' ? 'From ' : ''}₹{service.price}
                          {service.price_type === 'hourly' ? '/hr' : ''}
                        </div>
                      </div>
                    </div>

                    <div style={{ padding: "16px 24px", borderTop: "1px solid #f1f5f9", display: "flex", gap: "12px" }}>
                      <button onClick={() => handleEdit(service)} style={{
                        flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", backgroundColor: "white",
                        color: "#334155", fontSize: "0.938rem", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer", transition: "background-color 0.2s"
                      }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"} onMouseOut={(e) => e.currentTarget.style.backgroundColor = "white"}>
                        <Edit size={16} /> Edit
                      </button>
                      <button onClick={() => handleDelete(service.id)} style={{
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
