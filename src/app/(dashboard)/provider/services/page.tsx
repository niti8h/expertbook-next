"use client";

import { useState, useEffect } from "react";
import styles from "../../dashboard.module.css";
import { api, multipartApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastContext";
import { useDialog } from "@/components/ui/DialogContext";

export default function ProviderServices() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
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
    lat: "",
    lng: "",
    radius_km: "10",
  });
  
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    fetchProfile();
    fetchServices();
    fetchCategories();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) return;
      const res = await api("/auth/me", { token });
      if (res.status === 200) {
        setHasProfile(res.data.data.has_complete_vendor_profile);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProfileLoading(false);
    }
  };

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
      const res = await api("/provider/services", { token });
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

  const fetchLocation = async () => {
    toast.success("Fetching location...");

    const fallbackToIP = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        if (data.latitude && data.longitude) {
          setFormData((prev) => ({
            ...prev,
            lat: data.latitude.toString(),
            lng: data.longitude.toString(),
          }));
          toast.success("Approximate location fetched via IP!");
        } else {
          toast.error("Failed to fetch location automatically. Please enter manually.");
        }
      } catch (err) {
        toast.error("Failed to fetch location automatically. Please enter manually.");
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            lat: position.coords.latitude.toString(),
            lng: position.coords.longitude.toString(),
          }));
          toast.success("Location fetched successfully!");
        },
        (error) => {
          console.error("Browser geolocation failed:", error);
          toast.info("Browser location denied. Trying approximate IP location...");
          fallbackToIP();
        },
        { timeout: 10000 }
      );
    } else {
      toast.info("Geolocation not supported. Trying approximate IP location...");
      fallbackToIP();
    }
  };

  const resetForm = () => {
    setShowAddForm(false);
    setEditingId(null);
    setFormData({
      title: "", description: "", price: "", price_type: "fixed", category_id: categories.length > 0 ? categories[0].id : 1, status: "active", lat: "", lng: "", radius_km: "10", vendor_commission_rate: ""
    });
    setImages(null);
    setExistingImages([]);
    setImagePreviews([]);
  };

  const handleEdit = (service: any) => {
    setFormData({
      title: service.title,
      description: service.description || "",
      price: service.price,
      price_type: service.price_type,
      category_id: service.category_id || 1,
      status: service.status,
      vendor_commission_rate: service.vendor_commission_rate || "",
      lat: "", // Location defaults omitted on edit by backend logic
      lng: "",
      radius_km: "10",
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
      const res = await api(`/provider/services/${id}`, {
        method: "DELETE",
        token,
      });
      if (res.status === 200) {
        fetchServices();
      } else {
        toast.error("Failed to delete service");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      if (formData.vendor_commission_rate) payload.append("vendor_commission_rate", formData.vendor_commission_rate);
      
      if (!editingId) {
        if (formData.lat) payload.append("lat", formData.lat);
        if (formData.lng) payload.append("lng", formData.lng);
        if (formData.radius_km) payload.append("radius_km", formData.radius_km);
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

      const endpoint = editingId ? `/provider/services/${editingId}` : "/provider/services";
      const method = editingId ? "PUT" : "POST";

      const res = await multipartApi(endpoint, {
        method,
        body: payload,
        token,
      });

      if (res.status === 201 || res.status === 200) {
        resetForm();
        fetchServices();
      } else {
        toast.error(res.data?.message || "Failed to save service");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <main className={styles.mainContent}>
        <div className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <h1>Services</h1>
            <p>Manage your professional services and bookings.</p>
          </div>
          <div className={styles.topBarRight}>
            <button className="btn-primary" onClick={() => {
              if (showAddForm) {
                resetForm();
              } else {
                if (!hasProfile) {
                  toast.error("Please complete your store profile before adding services.");
                  router.push("/provider/profile");
                  return;
                }
                setShowAddForm(true);
              }
            }}>
              {showAddForm ? "Cancel" : "+ Add Service"}
            </button>
          </div>
        </div>

        {profileLoading ? (
          <div style={{ padding: "40px", textAlign: "center" }}>Loading profile status...</div>
        ) : !hasProfile && !showAddForm ? (
          <div className={styles.contentCard} style={{ padding: "40px", textAlign: "center", backgroundColor: "#fffbeb", border: "1px solid #fde68a" }}>
            <h3 style={{ color: "#92400e", marginBottom: "8px" }}>Profile Incomplete</h3>
            <p style={{ color: "#b45309", marginBottom: "20px" }}>You must complete your Store Profile before you can start posting services.</p>
            <button className="btn-primary" onClick={() => router.push("/provider/profile")}>
              Complete Profile
            </button>
          </div>
        ) : (
          <div className={styles.pageContent}>
          {showAddForm ? (
            <div className={styles.contentCard} style={{ maxWidth: "800px", margin: "0 auto" }}>
              <div className={styles.contentCardHeader}>
                <h3>{editingId ? "Edit Service" : "Create New Service"}</h3>
              </div>
              <div className={styles.contentCardBody}>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontSize: "0.875rem", fontWeight: 600 }}>Title</label>
                    <input 
                      type="text" 
                      required 
                      style={{ width: "100%", padding: "12px", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)" }}
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontSize: "0.875rem", fontWeight: 600 }}>Price (₹)</label>
                      <input 
                        type="number" 
                        required 
                        min="0" step="0.01"
                        style={{ width: "100%", padding: "12px", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)" }}
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontSize: "0.875rem", fontWeight: 600 }}>Price Type</label>
                      <select 
                        required 
                        style={{ width: "100%", padding: "12px", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)", backgroundColor: "white" }}
                        value={formData.price_type}
                        onChange={(e) => setFormData({...formData, price_type: e.target.value})}
                      >
                        <option value="fixed">Fixed Price</option>
                        <option value="hourly">Hourly Rate</option>
                        <option value="starting_at">Starting At</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontSize: "0.875rem", fontWeight: 600 }}>Status</label>
                      <select 
                        style={{ width: "100%", padding: "12px", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)", backgroundColor: "white" }}
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                      >
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontSize: "0.875rem", fontWeight: 600 }}>Vendor Commission Rate (%)</label>
                      <input 
                        type="number" 
                        min="0" step="0.01" max="100"
                        placeholder="e.g. 15.00"
                        style={{ width: "100%", padding: "12px", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)" }}
                        value={formData.vendor_commission_rate}
                        onChange={(e) => setFormData({...formData, vendor_commission_rate: e.target.value})}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontSize: "0.875rem", fontWeight: 600 }}>Category</label>
                      <select 
                        style={{ width: "100%", padding: "12px", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)", backgroundColor: "white" }}
                        value={formData.category_id}
                        onChange={(e) => setFormData({...formData, category_id: parseInt(e.target.value)})}
                      >
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontSize: "0.875rem", fontWeight: 600 }}>Images</label>
                    {existingImages.length > 0 && (
                      <div style={{ marginBottom: "16px" }}>
                        <p style={{ fontSize: "0.813rem", color: "var(--text-secondary)", marginBottom: "8px" }}>Currently Saved Images:</p>
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "10px" }}>
                          {existingImages.map((img, idx) => (
                            <div key={idx} style={{ position: "relative", width: "80px", height: "80px", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--border-light)" }}>
                              <img src={`http://localhost:8000${img}`} alt="Service" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              <button 
                                type="button" 
                                onClick={() => removeExistingImage(idx)}
                                style={{ position: "absolute", top: 2, right: 2, background: "rgba(0,0,0,0.5)", color: "white", border: "none", borderRadius: "50%", width: "20px", height: "20px", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}
                              >×</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {imagePreviews.length > 0 && (
                      <div style={{ marginBottom: "16px" }}>
                        <p style={{ fontSize: "0.813rem", color: "var(--brand-600)", marginBottom: "8px", fontWeight: 500 }}>New Images to Upload:</p>
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                          {imagePreviews.map((src, idx) => (
                            <div key={idx} style={{ width: "80px", height: "80px", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--border-light)" }}>
                              <img src={src} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <input 
                      type="file" 
                      multiple 
                      accept="image/*"
                      style={{ width: "100%", padding: "10px", border: "1px dashed var(--border-light)", borderRadius: "var(--radius-sm)", background: "var(--surface-1)" }}
                      onChange={handleImageChange}
                    />
                  </div>

                  {!editingId && (
                    <div style={{ padding: "16px", background: "var(--surface-1)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <h4 style={{ fontSize: "0.938rem", fontWeight: 600 }}>Service Location</h4>
                        <button type="button" onClick={fetchLocation} className="btn-secondary" style={{ padding: "6px 12px", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "6px" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                          Fetch Location
                        </button>
                      </div>
                      <p style={{ marginBottom: "16px", fontSize: "0.813rem", color: "var(--text-secondary)" }}>Set the center of your service area and how far you are willing to travel.</p>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
                        <div>
                          <label style={{ display: "block", marginBottom: "8px", fontSize: "0.875rem", fontWeight: 600 }}>Latitude</label>
                          <input 
                            type="number" 
                            step="0.000001"
                            placeholder="e.g. 28.6139"
                            style={{ width: "100%", padding: "12px", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)" }}
                            value={formData.lat}
                            onChange={(e) => setFormData({...formData, lat: e.target.value})}
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", marginBottom: "8px", fontSize: "0.875rem", fontWeight: 600 }}>Longitude</label>
                          <input 
                            type="number" 
                            step="0.000001"
                            placeholder="e.g. 77.2090"
                            style={{ width: "100%", padding: "12px", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)" }}
                            value={formData.lng}
                            onChange={(e) => setFormData({...formData, lng: e.target.value})}
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", marginBottom: "8px", fontSize: "0.875rem", fontWeight: 600 }}>Radius (km)</label>
                          <input 
                            type="number" 
                            min="1"
                            style={{ width: "100%", padding: "12px", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)" }}
                            value={formData.radius_km}
                            onChange={(e) => setFormData({...formData, radius_km: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontSize: "0.875rem", fontWeight: 600 }}>Description</label>
                    <textarea 
                      rows={4}
                      style={{ width: "100%", padding: "12px", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)", fontFamily: "inherit" }}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
                    <button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button>
                    <button type="submit" className="btn-primary">{editingId ? "Update Service" : "Save Service"}</button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className={styles.contentCard} style={{ overflowX: "auto" }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Service</th>
                    <th>Price</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} style={{ textAlign: "center", padding: "40px" }}>Loading...</td></tr>
                  ) : services.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: "center", padding: "40px" }}>No services found. Click &quot;Add Service&quot; to create one.</td></tr>
                  ) : (
                    services.map((service) => (
                      <tr key={service.id}>
                        <td style={{ width: "60px" }}>
                          {service.images && service.images.length > 0 ? (
                            <img src={`http://localhost:8000${service.images[0]}`} alt="img" style={{ width: "40px", height: "40px", borderRadius: "8px", objectFit: "cover" }} />
                          ) : (
                            <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "var(--surface-2)" }}></div>
                          )}
                        </td>
                        <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{service.title}</td>
                        <td>₹{service.price}</td>
                        <td style={{ textTransform: "capitalize" }}>{service.price_type.replace('_', ' ')}</td>
                        <td>
                          <span className={`${styles.statusBadge} ${service.status === 'active' ? styles.statusCompleted : styles.statusPending}`}>
                            {service.status}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button onClick={() => handleEdit(service)} style={{ background: "none", border: "none", color: "var(--brand-600)", fontWeight: 600, cursor: "pointer", marginRight: "12px" }}>Edit</button>
                          <button onClick={() => handleDelete(service.id)} style={{ background: "none", border: "none", color: "var(--danger)", fontWeight: 600, cursor: "pointer" }}>Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
        )}
      </main>
    </>
  );
}
