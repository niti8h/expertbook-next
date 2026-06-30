"use client";

import { useState, useEffect } from "react";
import styles from "../../dashboard.module.css";
import { api, multipartApi } from "@/lib/api";
import { useToast } from "@/components/ui/ToastContext";
import { useDialog } from "@/components/ui/DialogContext";

export default function VendorPortfolio() {
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ average_rating: 0, total_reviews: 0 });
  const [loading, setLoading] = useState(true);
  
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const toast = useToast();
  const dialog = useDialog();

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) return;

      const res = await api("/vendor/portfolios", { token });
      if (res.status === 200) {
        setPortfolios(res.data.data.portfolios);
        setStats({
          average_rating: res.data.data.average_rating,
          total_reviews: res.data.data.total_reviews,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) return;

      const payload = new FormData();
      payload.append("media", file);
      if (description) payload.append("description", description);

      const res = await multipartApi("/vendor/portfolios", {
        method: "POST",
        body: payload,
        token,
      });

      if (res.status === 201) {
        setFile(null);
        setDescription("");
        toast.success("Media uploaded successfully");
        fetchPortfolio();
      } else {
        toast.error(res.data?.message || "Failed to upload media");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = await dialog.confirm("Delete this portfolio item?");
    if (!confirmed) return;
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) return;

      const res = await api(`/vendor/portfolios/${id}`, {
        method: "DELETE",
        token,
      });

      if (res.status === 200) {
        toast.success("Media deleted successfully");
        fetchPortfolio();
      } else {
        toast.error("Failed to delete media");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className={styles.mainContent}>
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <h1>Portfolio & Reputation</h1>
          <p>Showcase your past work and monitor customer feedback.</p>
        </div>
      </div>

      <div className={styles.pageContent}>
        {/* Reputation Summary */}
        <div style={{ display: "flex", gap: "20px", marginBottom: "32px" }}>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Average Rating</p>
            <h2 className={styles.statValue}>⭐ {stats.average_rating} <span style={{ fontSize: "1rem", color: "var(--text-secondary)" }}>/ 5</span></h2>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Total Reviews</p>
            <h2 className={styles.statValue}>{stats.total_reviews}</h2>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" }}>
          {/* Upload Form */}
          <div className={styles.contentCard} style={{ height: "fit-content" }}>
            <div className={styles.contentCardHeader}>
              <h3>Add to Portfolio</h3>
            </div>
            <div className={styles.contentCardBody}>
              <form onSubmit={handleUpload} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "0.875rem", fontWeight: 600 }}>Media (Image or Video)</label>
                  <input 
                    type="file" 
                    required 
                    accept="image/*,video/*"
                    style={{ width: "100%", padding: "10px", border: "1px dashed var(--border-light)", borderRadius: "var(--radius-sm)", background: "var(--surface-1)" }}
                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                  />
                  <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "4px" }}>Max 20MB. Formats: JPG, PNG, GIF, MP4.</p>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "0.875rem", fontWeight: 600 }}>Description (Optional)</label>
                  <textarea 
                    rows={3}
                    style={{ width: "100%", padding: "12px", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)" }}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn-primary" disabled={uploading}>
                  {uploading ? "Uploading..." : "Upload Media"}
                </button>
              </form>
            </div>
          </div>

          {/* Portfolio Grid */}
          <div className={styles.contentCard}>
            <div className={styles.contentCardHeader}>
              <h3>Your Work</h3>
            </div>
            <div className={styles.contentCardBody}>
              {loading ? (
                <p>Loading...</p>
              ) : portfolios.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
                  <p>No portfolio items yet. Upload your first image or video!</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
                  {portfolios.map(item => (
                    <div key={item.id} style={{ border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)", overflow: "hidden", position: "relative" }}>
                      {item.media_type === "video" ? (
                        <video src={`https://api.expertbook.in${item.media_path}`} controls style={{ width: "100%", height: "150px", objectFit: "cover", background: "black" }} />
                      ) : (
                        <img src={`https://api.expertbook.in${item.media_path}`} alt="Portfolio" style={{ width: "100%", height: "150px", objectFit: "cover" }} />
                      )}
                      <div style={{ padding: "12px" }}>
                        <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "8px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {item.description || "No description"}
                        </p>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          style={{ fontSize: "0.813rem", color: "var(--danger)", background: "none", border: "none", cursor: "pointer", fontWeight: 600, padding: 0 }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
