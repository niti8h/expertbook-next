"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Heart, Trash2 } from "lucide-react";
import styles from "../../dashboard.module.css";
import { useToast } from "@/components/ui/ToastContext";

export default function WishlistPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) return;

      const res = await api("/user/wishlist", { token });
      if (res.status === 200) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeLike = async (productId: number) => {
    const token = localStorage.getItem("auth-token");
    if (!token) return;

    // Optimistic remove
    setProducts(prev => prev.filter(p => p.id !== productId));

    try {
      const res = await api(`/product/${productId}/like`, { method: "POST", token });
      if (res.status === 200) {
        toast.success("Removed from wishlist");
      } else {
        fetchWishlist(); // Revert on failure
        toast.error("Failed to remove from wishlist");
      }
    } catch (err) {
      fetchWishlist(); // Revert on failure
      toast.error("An error occurred");
    }
  };

  if (loading) return <div className={styles.loading}>Loading wishlist...</div>;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--surface-0)", color: "var(--text-primary)" }}>
      <div style={{ backgroundColor: "var(--surface-1)", padding: "40px", borderBottom: "1px solid var(--border-light)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: 0 }}>My Wishlist</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "8px" }}>Products you have saved for later.</p>
        </div>
      </div>

      <main style={{ maxWidth: "1200px", margin: "40px auto", padding: "0 24px", position: "relative" }}>

      {products.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 24px", backgroundColor: "var(--surface-0)", borderRadius: "var(--radius-xl)", border: "1px dashed var(--border-light)", marginTop: "32px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "linear-gradient(135deg, var(--brand-100) 0%, var(--brand-50) 100%)", color: "var(--brand-600)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", boxShadow: "0 8px 32px rgba(99, 102, 241, 0.15)" }}>
            <Heart size={40} />
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "12px", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Your wishlist is empty</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "32px", fontSize: "1.125rem", maxWidth: "400px" }}>Save the items you love by clicking the heart icon on any product.</p>
          <Link href="/products" className="btn-primary" style={{ display: "inline-flex", padding: "16px 32px", textDecoration: "none", borderRadius: "100px", fontWeight: 600, fontSize: "1rem", boxShadow: "0 4px 14px rgba(99, 102, 241, 0.4)", transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="product-grid" style={{ marginTop: "32px" }}>
          {products.map(product => (
            <div key={product.id} className="product-card" style={{ display: "flex", flexDirection: "column", borderRadius: "var(--radius-xl)", overflow: "hidden", backgroundColor: "white", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", border: "1px solid var(--border-light)", position: "relative" }}>
              <button
                onClick={() => removeLike(product.id)}
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(8px)",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  zIndex: 10,
                  color: "var(--error)",
                  transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)"
                }}
                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
              >
                <Trash2 size={18} />
              </button>

              <Link href={`/products/${product.slug}`} style={{ textDecoration: "none", color: "inherit", flex: 1, display: "flex", flexDirection: "column" }}>
                <div
                  className="product-image-container"
                  style={{ backgroundImage: `url(${process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.expertbook.in"}${product.images?.[0] || ''})` }}
                >
                  {!product.images?.[0] && <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No Image</div>}
                </div>
                <div className="product-content">
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 700 }}>
                    {product.category?.name || "Product"}
                  </div>
                  <h3 className="product-title" style={{ fontWeight: 700, marginBottom: "8px", lineHeight: 1.4, fontSize: "1.125rem" }}>
                    {product.title}
                  </h3>
                  
                  <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "2px", fontWeight: 500, textTransform: "uppercase" }}>Price</span>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "4px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)" }}>₹{product.price}</span>
                        {product.compare_price && (
                          <span style={{ fontSize: "0.813rem", color: "var(--text-muted)", textDecoration: "line-through", fontWeight: 500 }}>₹{product.compare_price}</span>
                        )}
                      </div>
                    </div>
                    
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href=`/checkout?item_id=${product.id}&type=${product.type || 'product'}`; }} className="btn-primary" style={{ padding: "8px 16px", fontSize: "0.875rem", fontWeight: 600, borderRadius: "100px", flexShrink: 0 }}>
                      Buy Now
                    </button>
                  </div>
                </div>
              </Link>
              
              {/* Vendor Footer as separate Link */}
              {product.vendor?.id && (
                <Link href={`/store/${product.vendor.id}/${(product.vendor?.vendor_profile?.store_name || product.vendor?.name || 'store').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}`} style={{ textDecoration: "none", display: "block" }}>
                  <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border-light)", backgroundColor: "var(--surface-0)", transition: "background-color 0.2s" }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--surface-1)"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--surface-0)"}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden" }}>
                      {product.vendor?.vendor_profile?.store_logo ? (
                        <img src={`https://api.expertbook.in${product.vendor.vendor_profile.store_logo}`} alt="logo" style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover", border: "1px solid var(--border-light)", flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "var(--brand-100)", color: "var(--brand-700)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>
                          {(product.vendor?.vendor_profile?.store_name || product.vendor?.name || "V").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: "0.813rem", fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {product.vendor?.vendor_profile?.store_name || product.vendor?.name}
                        </p>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </div>
                  </div>
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
      </main>
    </div>
  );
}
