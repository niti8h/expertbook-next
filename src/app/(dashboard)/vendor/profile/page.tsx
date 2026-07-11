"use client";
import { useState, useEffect } from "react";
import styles from "../../dashboard.module.css";
import { api, multipartApi } from "@/lib/api";
import { useToast } from "@/components/ui/ToastContext";

export default function VendorProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  // Profile Form State
  const [formData, setFormData] = useState({
    store_name: "",
    store_description: "",
    contact_phone: "",
    support_email: "",
    state_id: "",
    city_id: "",
  });

  const [logo, setLogo] = useState<File | null>(null);
  const [banner, setBanner] = useState<File | null>(null);

  const [existingLogo, setExistingLogo] = useState("");
  const [existingBanner, setExistingBanner] = useState("");

  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) return;

      const res = await api("/auth/me", { token });
      if (res.status === 200 && res.data.data.vendor_profile) {
        const vp = res.data.data.vendor_profile;
        setFormData({
          store_name: vp.store_name || "",
          store_description: vp.store_description || "",
          contact_phone: vp.contact_phone || "",
          support_email: vp.support_email || "",
          state_id: vp.state_id || "",
          city_id: vp.city_id || "",
        });
        setExistingLogo(vp.store_logo || "");
        setExistingBanner(vp.store_banner || "");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) return;

      const payload = new FormData();
      payload.append("store_name", formData.store_name);
      payload.append("store_description", formData.store_description);
      payload.append("contact_phone", formData.contact_phone);
      payload.append("support_email", formData.support_email);
      if (formData.state_id) payload.append("state_id", formData.state_id);
      if (formData.city_id) payload.append("city_id", formData.city_id);

      if (logo) payload.append("logo", logo);
      if (banner) payload.append("banner", banner);

      const res = await multipartApi("/auth/vendor-profile", {
        method: "POST", // using POST for file upload spoofing PUT
        body: payload,
        token,
      });

      if (res.status === 200) {
        toast.success("Profile updated successfully!");
        fetchProfile();
      } else {
        toast.error(res.data?.message || "Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  // Previews
  const bannerPreviewUrl = banner ? URL.createObjectURL(banner) : (existingBanner ? `https://api.expertbook.in${existingBanner}` : 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=1200');
  const logoPreviewUrl = logo ? URL.createObjectURL(logo) : (existingLogo ? `https://api.expertbook.in${existingLogo}` : 'https://ui-avatars.com/api/?name=Store&background=random');

  return (
    <main className={styles.mainContent} style={{ position: "relative" }}>
      
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <h1>Store Profile</h1>
          <p>Manage your public vendor identity and contact details.</p>
        </div>
      </div>

      <div className={styles.pageContent} style={{ paddingBottom: "100px" }}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>Loading profile...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ 
              maxWidth: "800px", 
              margin: "0 auto", 
              backgroundColor: "var(--surface-0)", 
              borderRadius: "16px", 
              overflow: "hidden", 
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)"
            }}>
              {/* Banner Section */}
              <div style={{ position: "relative", width: "100%", height: "200px" }}>
                <img 
                  src={bannerPreviewUrl} 
                  alt="Banner" 
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                />
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.4))" }}></div>
                
                <label style={{
                  position: "absolute",
                  bottom: "16px",
                  right: "16px",
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  backdropFilter: "blur(4px)",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  fontSize: "0.813rem",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  Change Cover
                  <input type="file" hidden accept="image/*" onChange={(e) => setBanner(e.target.files ? e.target.files[0] : null)} />
                </label>
              </div>

              {/* Profile Details */}
              <div style={{ padding: "0 32px 32px" }}>
                
                {/* Avatar Section */}
                <div style={{ display: "flex", alignItems: "flex-end", marginBottom: "32px" }}>
                  <div style={{ position: "relative", width: "100px", height: "100px", marginTop: "-50px" }}>
                    <img 
                      src={logoPreviewUrl} 
                      alt="Logo" 
                      style={{ 
                        width: "100%", 
                        height: "100%", 
                        borderRadius: "50%", 
                        objectFit: "cover", 
                        border: "4px solid var(--surface-0)",
                        backgroundColor: "var(--surface-0)",
                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)"
                      }} 
                    />
                    <label style={{
                      position: "absolute",
                      bottom: "0",
                      right: "0",
                      backgroundColor: "var(--brand-600)",
                      color: "white",
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      border: "2px solid var(--surface-0)",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      <input type="file" hidden accept="image/*" onChange={(e) => setLogo(e.target.files ? e.target.files[0] : null)} />
                    </label>
                  </div>
                  <div style={{ marginLeft: "20px", paddingBottom: "10px" }}>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>{formData.store_name || "Your Store Name"}</h2>
                    <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", margin: "4px 0 0 0" }}>Update your business details below.</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  
                  <div style={{ background: "var(--surface-1)", padding: "24px", borderRadius: "12px", border: "1px solid var(--border-light)" }}>
                    <h4 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "20px", color: "var(--text-primary)" }}>Basic Information</h4>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                      <div>
                        <label style={{ display: "block", marginBottom: "8px", fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)" }}>Store Name <span style={{color: "var(--danger)"}}>*</span></label>
                        <input 
                          type="text" 
                          required 
                          style={{ 
                            width: "100%", padding: "12px 16px", border: "1px solid var(--border-light)", 
                            borderRadius: "8px", fontSize: "0.938rem", transition: "border-color 0.2s",
                            backgroundColor: "var(--surface-0)"
                          }}
                          value={formData.store_name}
                          onChange={(e) => setFormData({...formData, store_name: e.target.value})}
                          placeholder="e.g. Trendy Boutique"
                        />
                      </div>
                      
                      <div>
                        <label style={{ display: "block", marginBottom: "8px", fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)" }}>Store Description</label>
                        <textarea 
                          rows={4}
                          style={{ 
                            width: "100%", padding: "12px 16px", border: "1px solid var(--border-light)", 
                            borderRadius: "8px", fontSize: "0.938rem", fontFamily: "inherit", transition: "border-color 0.2s",
                            backgroundColor: "var(--surface-0)", resize: "vertical"
                          }}
                          value={formData.store_description}
                          onChange={(e) => setFormData({...formData, store_description: e.target.value})}
                          placeholder="Tell customers about your business, what you sell, and your values..."
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ background: "var(--surface-1)", padding: "24px", borderRadius: "12px", border: "1px solid var(--border-light)" }}>
                    <h4 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "20px", color: "var(--text-primary)" }}>Contact Details</h4>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                      <div>
                        <label style={{ display: "block", marginBottom: "8px", fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)" }}>Support Email</label>
                        <input 
                          type="email" 
                          style={{ 
                            width: "100%", padding: "12px 16px", border: "1px solid var(--border-light)", 
                            borderRadius: "8px", fontSize: "0.938rem", transition: "border-color 0.2s",
                            backgroundColor: "var(--surface-0)"
                          }}
                          value={formData.support_email}
                          onChange={(e) => setFormData({...formData, support_email: e.target.value})}
                          placeholder="support@yourstore.com"
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: "8px", fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)" }}>Contact Phone</label>
                        <input 
                          type="text" 
                          style={{ 
                            width: "100%", padding: "12px 16px", border: "1px solid var(--border-light)", 
                            borderRadius: "8px", fontSize: "0.938rem", transition: "border-color 0.2s",
                            backgroundColor: "var(--surface-0)"
                          }}
                          value={formData.contact_phone}
                          onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                          placeholder="+91 9876543210"
                        />
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Sticky Save Bar */}
            <div style={{
              position: "fixed",
              bottom: "24px",
              left: "50%",
              transform: "translateX(calc(-50% + 125px))", // Offset by roughly half sidebar width
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
              <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                Unsaved changes will be lost
              </span>
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
                {saving ? "Saving Profile..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
