"use client";
import { useState, useEffect } from "react";
import styles from "../../dashboard.module.css";
import { api, multipartApi } from "@/lib/api";
import { useToast } from "@/components/ui/ToastContext";

export default function AdminSettingsPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const [settings, setSettings] = useState({
    site_name: "",
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    razorpay_key_id: "",
    razorpay_key_secret: "",
    referral_commission_percentage: "10",
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) return;

      const res = await api("/admin/settings", { token });
      if (res.status === 200) {
        const data = res.data.data || {};
        setSettings({
          site_name: data.site_name || "",
          meta_title: data.meta_title || "",
          meta_description: data.meta_description || "",
          meta_keywords: data.meta_keywords || "",
          razorpay_key_id: data.razorpay_key_id || "",
          razorpay_key_secret: data.razorpay_key_secret || "",
          referral_commission_percentage: data.referral_commission_percentage || "10",
        });
        
        if (data.site_logo) setLogoPreview(process.env.NEXT_PUBLIC_BACKEND_URL + data.site_logo);
        if (data.site_favicon) setFaviconPreview(process.env.NEXT_PUBLIC_BACKEND_URL + data.site_favicon);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      
      if (type === 'logo') {
        setLogoFile(file);
        setLogoPreview(previewUrl);
      } else {
        setFaviconFile(file);
        setFaviconPreview(previewUrl);
      }
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) return;

      const formData = new FormData();
      Object.entries(settings).forEach(([key, value]) => {
        formData.append(key, value as string);
      });

      if (logoFile) formData.append('site_logo', logoFile);
      if (faviconFile) formData.append('site_favicon', faviconFile);

      const res = await multipartApi("/admin/settings", {
        method: "POST",
        token,
        body: formData,
      });

      if (res.status === 200) {
        toast.success("Settings saved successfully!");
      } else {
        toast.error("Failed to save settings");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className={styles.mainContent}>
        <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>Loading settings...</div>
      </main>
    );
  }

  return (
    <main className={styles.mainContent}>
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <h1>Site Configuration</h1>
          <p>Manage your website's global settings, SEO, and integrations.</p>
        </div>
        <div className={styles.topBarRight}>
          <button 
            onClick={saveSettings}
            disabled={saving}
            className={styles.primaryBtn}
            style={{ opacity: saving ? 0.7 : 1 }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className={styles.pageContent}>
        <div style={{ display: "flex", gap: "24px", marginBottom: "24px", borderBottom: "1px solid var(--border-light)" }}>
          {["general", "seo", "payment"].map((tab) => (
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
              {tab} Settings
            </button>
          ))}
        </div>

        <div className={styles.contentCard} style={{ padding: "32px", maxWidth: "800px" }}>
          
          {/* GENERAL SETTINGS TAB */}
          {activeTab === "general" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>Website Name</label>
                <input 
                  type="text" 
                  name="site_name"
                  value={settings.site_name} 
                  onChange={handleInputChange} 
                  className={styles.input}
                  placeholder="e.g. Expert Book"
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>Referral Commission Percentage (Admin Profit Cut %)</label>
                <input 
                  type="number" 
                  name="referral_commission_percentage"
                  value={settings.referral_commission_percentage} 
                  onChange={handleInputChange} 
                  className={styles.input}
                  placeholder="e.g. 10"
                  min="0"
                  max="100"
                />
                <p style={{ margin: "4px 0 0", fontSize: "0.813rem", color: "var(--text-muted)" }}>
                  Percentage of the admin's profit margin given to the referrer when their invited user completes an order.
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>Site Logo</label>
                  <div style={{ border: "2px dashed var(--border-light)", borderRadius: "var(--radius-md)", padding: "20px", textAlign: "center", marginBottom: "8px" }}>
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" style={{ maxHeight: "60px", maxWidth: "100%", objectFit: "contain" }} />
                    ) : (
                      <span style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>No logo uploaded</span>
                    )}
                  </div>
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>Site Favicon</label>
                  <div style={{ border: "2px dashed var(--border-light)", borderRadius: "var(--radius-md)", padding: "20px", textAlign: "center", marginBottom: "8px" }}>
                    {faviconPreview ? (
                      <img src={faviconPreview} alt="Favicon" style={{ maxHeight: "40px", maxWidth: "100%", objectFit: "contain" }} />
                    ) : (
                      <span style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>No favicon uploaded</span>
                    )}
                  </div>
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'favicon')} />
                </div>
              </div>
            </div>
          )}

          {/* SEO SETTINGS TAB */}
          {activeTab === "seo" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>Meta Title</label>
                <input 
                  type="text" 
                  name="meta_title"
                  value={settings.meta_title} 
                  onChange={handleInputChange} 
                  className={styles.input}
                  placeholder="Global Title Tag"
                />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>Meta Keywords</label>
                <input 
                  type="text" 
                  name="meta_keywords"
                  value={settings.meta_keywords} 
                  onChange={handleInputChange} 
                  className={styles.input}
                  placeholder="e.g. ecommerce, shopping, multi-vendor"
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>Meta Description</label>
                <textarea 
                  name="meta_description"
                  value={settings.meta_description} 
                  onChange={handleInputChange} 
                  className={styles.input}
                  style={{ minHeight: "100px", resize: "vertical" }}
                  placeholder="Write a short description of your website..."
                />
              </div>
            </div>
          )}

          {/* PAYMENT SETTINGS TAB */}
          {activeTab === "payment" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              
              <div style={{ padding: "16px", backgroundColor: "rgba(59, 130, 246, 0.05)", border: "1px solid rgba(59, 130, 246, 0.2)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--brand-500)" }}>
                  <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
                </svg>
                <div>
                  <h4 style={{ margin: "0 0 4px", fontSize: "0.938rem" }}>Razorpay Integration</h4>
                  <p style={{ margin: 0, fontSize: "0.813rem", color: "var(--text-secondary)" }}>Enter your Razorpay API keys below to enable secure online payments.</p>
                </div>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>Razorpay Key ID</label>
                <input 
                  type="text" 
                  name="razorpay_key_id"
                  value={settings.razorpay_key_id} 
                  onChange={handleInputChange} 
                  className={styles.input}
                  placeholder="rzp_test_..."
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>Razorpay Key Secret</label>
                <input 
                  type="password" 
                  name="razorpay_key_secret"
                  value={settings.razorpay_key_secret} 
                  onChange={handleInputChange} 
                  className={styles.input}
                  placeholder="Secret Key"
                />
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
