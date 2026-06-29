"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/ToastContext";
import { useDialog } from "@/components/ui/DialogContext";

export default function UserAddressesPage() {
  const router = useRouter();
  const toast = useToast();
  const dialog = useDialog();

  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [pincodeValid, setPincodeValid] = useState<boolean | null>(null);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    address: "",
    city: "",
    district: "",
    state: "",
    pincode: "",
    is_default: false
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) {
        router.push("/login");
        return;
      }
      const res = await api("/user/addresses", { token });
      if (res.status === 200) {
        setAddresses(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setFormData(prev => ({ ...prev, pincode: val }));
    setPincodeValid(null);
    
    if (val.length === 6) {
      setPincodeLoading(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${val}`);
        const result = await res.json();
        if (result && result.length > 0 && result[0].Status === "Success" && result[0].PostOffice && result[0].PostOffice.length > 0) {
          const post = result[0].PostOffice[0];
          setFormData(prev => ({
            ...prev,
            district: post.District,
            state: post.State
          }));
          setPincodeValid(true);
        } else {
          setPincodeValid(false);
        }
      } catch (err) {
        console.error("Pincode lookup failed", err);
        setPincodeValid(false);
      } finally {
        setPincodeLoading(false);
      }
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) return;
      const res = await api("/user/addresses", {
        method: "POST",
        body: formData,
        token
      });

      if (res.status === 201) {
        toast.success("Address added successfully!");
        setShowForm(false);
        setFormData({ address: "", city: "", state: "", pincode: "", is_default: false });
        fetchAddresses();
      } else {
        toast.error("Failed to add address.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error adding address.");
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = await dialog.confirm("Are you sure you want to delete this address?");
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("auth-token");
      if (!token) return;
      const res = await api(`/user/addresses/${id}`, {
        method: "DELETE",
        token
      });

      if (res.status === 200) {
        toast.success("Address deleted.");
        fetchAddresses();
      } else {
        toast.error("Failed to delete address.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting address.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--surface-0)", color: "var(--text-primary)" }}>
      <div style={{ backgroundColor: "var(--surface-1)", padding: "40px", borderBottom: "1px solid var(--border-light)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: 0 }}>My Addresses</h1>
            <p style={{ color: "var(--text-secondary)", marginTop: "8px" }}>Manage your shipping addresses.</p>
          </div>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "+ Add New Address"}
          </button>
        </div>
      </div>

      <main style={{ maxWidth: "1200px", margin: "40px auto", padding: "0 40px" }}>
        {showForm && (
          <div style={{ marginBottom: "40px", padding: "32px", backgroundColor: "white", borderRadius: "var(--radius-md)", border: "1px solid var(--border-light)", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "24px" }}>Add New Address</h3>
            <form onSubmit={handleAddAddress} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "0.875rem", fontWeight: 600 }}>Pincode</label>
                  <div style={{ position: "relative" }}>
                    <input 
                      type="text" required maxLength={6}
                      placeholder="Enter 6-digit pincode"
                      style={{ 
                        width: "100%", padding: "12px 44px 12px 12px", 
                        border: pincodeValid === true ? "1px solid rgb(34,197,94)" : pincodeValid === false ? "1px solid var(--danger)" : "1px solid var(--border-light)", 
                        borderRadius: "var(--radius-sm)", fontSize: "0.938rem",
                        transition: "border-color 0.2s"
                      }}
                      value={formData.pincode} onChange={handlePincodeChange}
                    />
                    <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)" }}>
                      {pincodeLoading && <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: "2px solid #ccc", borderTopColor: "#000", animation: "spin 0.7s linear infinite" }} />}
                      {!pincodeLoading && pincodeValid === true && (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(34,197,94)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/>
                        </svg>
                      )}
                      {!pincodeLoading && pincodeValid === false && (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                        </svg>
                      )}
                    </div>
                  </div>
                  {pincodeValid === true && <p style={{ margin: "6px 0 0", fontSize: "0.813rem", color: "rgb(34,197,94)" }}>Location detected automatically ✓</p>}
                  {pincodeValid === false && <p style={{ margin: "6px 0 0", fontSize: "0.813rem", color: "var(--danger)" }}>Invalid pincode. Please check and try again.</p>}
                </div>
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "0.875rem", fontWeight: 600 }}>Street Address</label>
                <input 
                  type="text" required 
                  style={{ width: "100%", padding: "12px", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)", fontSize: "0.938rem" }}
                  value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "0.875rem", fontWeight: 600 }}>City</label>
                  <input 
                    type="text" required 
                    placeholder="Your city"
                    style={{ width: "100%", padding: "12px", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)", fontSize: "0.938rem" }}
                    value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}
                  />
                </div>
                <div>
                  <label style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.875rem", fontWeight: 600 }}>
                    <span>District</span>
                    {formData.district && pincodeValid === true && <span style={{ fontSize: "0.75rem", color: "rgb(34,197,94)", fontWeight: 400 }}>Auto-filled</span>}
                  </label>
                  <input 
                    type="text"
                    style={{ width: "100%", padding: "12px", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)", fontSize: "0.938rem", backgroundColor: formData.district && pincodeValid === true ? "rgba(34,197,94,0.04)" : "white" }}
                    value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.875rem", fontWeight: 600 }}>
                  <span>State</span>
                  {formData.state && pincodeValid === true && <span style={{ fontSize: "0.75rem", color: "rgb(34,197,94)", fontWeight: 400 }}>Auto-filled</span>}
                </label>
                <input 
                  type="text" required 
                  style={{ width: "100%", padding: "12px", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)", fontSize: "0.938rem", backgroundColor: formData.state && pincodeValid === true ? "rgba(34,197,94,0.04)" : "white" }}
                  value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})}
                />
              </div>
              <div>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.875rem" }}>
                  <input 
                    type="checkbox" 
                    checked={formData.is_default} 
                    onChange={e => setFormData({...formData, is_default: e.target.checked})} 
                    style={{ width: "16px", height: "16px" }}
                  />
                  Set as default address
                </label>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
                <button type="submit" className="btn-primary" style={{ padding: "12px 32px" }}>Save Address</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div style={{ padding: "60px", textAlign: "center", color: "var(--text-muted)" }}>Loading addresses...</div>
        ) : addresses.length === 0 ? (
          <div style={{ padding: "80px", textAlign: "center", backgroundColor: "white", borderRadius: "var(--radius-md)", border: "1px solid var(--border-light)" }}>
            <svg style={{ margin: "0 auto 16px" }} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--border-light)" strokeWidth="1"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "8px" }}>No saved addresses</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>Add an address to speed up checkout.</p>
            <button className="btn-primary" onClick={() => setShowForm(true)}>Add Address</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "24px" }}>
            {addresses.map((addr) => (
              <div key={addr.id} style={{ padding: "24px", backgroundColor: "white", borderRadius: "var(--radius-md)", border: addr.is_default ? "2px solid var(--brand-600)" : "1px solid var(--border-light)", position: "relative" }}>
                {addr.is_default && (
                  <span style={{ position: "absolute", top: "24px", right: "24px", fontSize: "0.75rem", backgroundColor: "rgba(79, 70, 229, 0.1)", color: "var(--brand-600)", padding: "4px 8px", borderRadius: "100px", fontWeight: 600 }}>Default</span>
                )}
                <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", marginBottom: "20px" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ marginTop: "2px" }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <div>
                    <p style={{ margin: "0 0 4px 0", fontSize: "1rem", color: "var(--text-primary)", lineHeight: 1.5 }}>
                      {addr.address}
                    </p>
                    <p style={{ margin: 0, fontSize: "0.938rem", color: "var(--text-secondary)" }}>
                      {addr.city}, {addr.state} {addr.pincode}
                    </p>
                  </div>
                </div>
                <div style={{ borderTop: "1px solid var(--surface-2)", paddingTop: "16px", display: "flex", gap: "16px" }}>
                  <button onClick={() => handleDelete(addr.id)} style={{ background: "none", border: "none", color: "var(--danger)", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", padding: 0 }}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
