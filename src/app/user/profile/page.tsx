"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api, multipartApi } from "@/lib/api";
import { useToast } from "@/components/ui/ToastContext";
import { getImageUrl } from "@/lib/utils";

export default function UserProfilePage() {
  const router = useRouter();
  const toast = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [avatar, setAvatar] = useState<File | null>(null);
  const [existingAvatar, setExistingAvatar] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await api("/auth/me", { token });
      if (res.status === 200) {
        const u = res.data.data;
        setFormData({
          name: u.name || "",
          email: u.email || "",
          address: u.address || "",
          city: u.city || "",
          state: u.state || "",
          pincode: u.pincode || "",
        });
        setExistingAvatar(u.avatar || "");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load profile");
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
      payload.append("_method", "PUT");
      payload.append("name", formData.name);
      payload.append("email", formData.email);
      payload.append("address", formData.address);
      payload.append("city", formData.city);
      payload.append("state", formData.state);
      payload.append("pincode", formData.pincode);
      if (avatar) payload.append("avatar", avatar);

      const res = await multipartApi("/auth/profile", {
        method: "POST", // spoofing PUT
        body: payload,
        token,
      });

      if (res.status === 200) {
        toast.success("Profile updated successfully!");
        fetchProfile(); // reload avatar
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

  const avatarPreviewUrl = avatar ? URL.createObjectURL(avatar) : (existingAvatar ? getImageUrl(existingAvatar) : 'https://ui-avatars.com/api/?name=User&background=random');

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "100px 0" }}>
        <div className="spinner" style={{ width: "40px", height: "40px", border: "3px solid var(--border-light)", borderTopColor: "var(--brand-600)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  return (
    <div style={{ padding: "40px 20px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "32px" }}>
        <button onClick={() => router.back()} style={{ color: "var(--brand-600)", border: "none", background: "none", cursor: "pointer", display: "inline-block", marginBottom: "8px", fontSize: "0.875rem", fontWeight: 600 }}>&larr; Go Back</button>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: "8px 0" }}>Profile Settings</h1>
        <p style={{ color: "var(--text-secondary)", margin: 0 }}>Manage your account details and public avatar.</p>
      </div>
      
      <form onSubmit={handleSubmit} style={{ background: "var(--surface-0)", border: "1px solid var(--border-light)", borderRadius: "20px", overflow: "hidden", boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}>
        <div style={{ padding: "40px", display: "flex", flexDirection: "column", alignItems: "center", borderBottom: "1px solid var(--border-light)", background: "var(--surface-1)" }}>
          <div style={{ position: "relative", width: "120px", height: "120px", borderRadius: "50%", border: "4px solid var(--surface-0)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginBottom: "16px" }}>
            <img src={avatarPreviewUrl} alt="Avatar" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
            <label style={{ position: "absolute", bottom: "0", right: "0", width: "36px", height: "36px", borderRadius: "50%", background: "var(--brand-600)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", transition: "transform 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              <input type="file" style={{ display: "none" }} accept="image/*" onChange={(e) => { if (e.target.files && e.target.files[0]) setAvatar(e.target.files[0]); }} />
            </label>
          </div>
          <h3 style={{ margin: "0", fontSize: "1.25rem" }}>Profile Avatar</h3>
          <p style={{ margin: "4px 0 0 0", color: "var(--text-secondary)", fontSize: "0.875rem" }}>This will be visible on your public articles.</p>
        </div>

        <div style={{ padding: "32px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)" }}>Full Name</label>
            <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required style={{ padding: "12px 16px", borderRadius: "12px", border: "1px solid var(--border-light)", background: "var(--surface-1)", fontSize: "0.938rem", outline: "none", transition: "border-color 0.2s" }} onFocus={e => e.target.style.borderColor = "var(--brand-500)"} onBlur={e => e.target.style.borderColor = "var(--border-light)"} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)" }}>Email Address</label>
            <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required style={{ padding: "12px 16px", borderRadius: "12px", border: "1px solid var(--border-light)", background: "var(--surface-1)", fontSize: "0.938rem", outline: "none", transition: "border-color 0.2s" }} onFocus={e => e.target.style.borderColor = "var(--brand-500)"} onBlur={e => e.target.style.borderColor = "var(--border-light)"} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px", gridColumn: "1 / -1" }}>
            <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)" }}>Address</label>
            <input type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} style={{ padding: "12px 16px", borderRadius: "12px", border: "1px solid var(--border-light)", background: "var(--surface-1)", fontSize: "0.938rem", outline: "none", transition: "border-color 0.2s" }} onFocus={e => e.target.style.borderColor = "var(--brand-500)"} onBlur={e => e.target.style.borderColor = "var(--border-light)"} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)" }}>City</label>
            <input type="text" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} style={{ padding: "12px 16px", borderRadius: "12px", border: "1px solid var(--border-light)", background: "var(--surface-1)", fontSize: "0.938rem", outline: "none", transition: "border-color 0.2s" }} onFocus={e => e.target.style.borderColor = "var(--brand-500)"} onBlur={e => e.target.style.borderColor = "var(--border-light)"} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)" }}>State</label>
            <input type="text" value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} style={{ padding: "12px 16px", borderRadius: "12px", border: "1px solid var(--border-light)", background: "var(--surface-1)", fontSize: "0.938rem", outline: "none", transition: "border-color 0.2s" }} onFocus={e => e.target.style.borderColor = "var(--brand-500)"} onBlur={e => e.target.style.borderColor = "var(--border-light)"} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)" }}>Pincode</label>
            <input type="text" value={formData.pincode} onChange={e => setFormData({ ...formData, pincode: e.target.value })} style={{ padding: "12px 16px", borderRadius: "12px", border: "1px solid var(--border-light)", background: "var(--surface-1)", fontSize: "0.938rem", outline: "none", transition: "border-color 0.2s" }} onFocus={e => e.target.style.borderColor = "var(--brand-500)"} onBlur={e => e.target.style.borderColor = "var(--border-light)"} />
          </div>
        </div>
        
        <div style={{ padding: "24px 32px", borderTop: "1px solid var(--border-light)", background: "var(--surface-1)", display: "flex", justifyContent: "flex-end" }}>
          <button type="submit" disabled={saving} style={{ padding: "12px 32px", borderRadius: "12px", background: "var(--brand-600)", color: "white", border: "none", fontWeight: 600, fontSize: "1rem", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, transition: "background-color 0.2s" }} onMouseEnter={(e) => !saving && (e.currentTarget.style.background = "var(--brand-700)")} onMouseLeave={(e) => !saving && (e.currentTarget.style.background = "var(--brand-600)")}>
            {saving ? "Saving Changes..." : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
