"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function ProductDetails() {
  const { slug } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>("");

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    try {
      const res = await api(`/marketplace/products/${slug}`);
      if (res.status === 200) {
        const data = res.data.data;
        setProduct(data);
        if (data.images && data.images.length > 0) {
          setActiveImage(data.images[0]);
        }
      } else {
        router.push("/products"); // fallback
      }
    } catch (err) {
      console.error(err);
      router.push("/products");
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = () => {
    // We navigate to checkout, passing item details in query params or localStorage
    // For simplicity, using query params
    const query = new URLSearchParams({
      item_id: product.id,
      item_type: "product",
      quantity: "1"
    }).toString();
    
    router.push(`/checkout?${query}`);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "var(--background)" }}>
        <p style={{ fontSize: "1.125rem", color: "var(--text-secondary)" }}>Loading details...</p>
      </div>
    );
  }

  if (!product) return null;

  return (
    <main style={{ minHeight: "100vh", background: "var(--background)", padding: "40px 20px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Back navigation */}
        <button 
          onClick={() => router.back()} 
          style={{ background: "none", border: "none", color: "var(--brand-600)", fontWeight: 600, cursor: "pointer", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }}
        >
          &larr; Back to Marketplace
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", background: "var(--surface-0)", padding: "40px", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-md)" }}>
          
          {/* Image Gallery */}
          <div>
            <div style={{ width: "100%", height: "500px", borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--border-light)", marginBottom: "16px", background: "var(--surface-1)" }}>
              {activeImage ? (
                <img src={`https://api.expertbook.in${activeImage}`} alt={product.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>No Image</div>
              )}
            </div>
            
            {product.images && product.images.length > 1 && (
              <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "8px" }}>
                {product.images.map((img: string, idx: number) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveImage(img)}
                    style={{ 
                      flexShrink: 0,
                      width: "80px", 
                      height: "80px", 
                      borderRadius: "var(--radius-sm)", 
                      overflow: "hidden", 
                      border: activeImage === img ? "2px solid var(--brand-600)" : "1px solid var(--border-light)", 
                      background: "none", 
                      padding: 0, 
                      cursor: "pointer" 
                    }}
                  >
                    <img src={`https://api.expertbook.in${img}`} alt="thumbnail" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {product.category && (
              <span style={{ fontSize: "0.813rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--brand-600)", marginBottom: "8px" }}>
                {product.category.name}
              </span>
            )}
            
            <h1 style={{ fontSize: "2.5rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px", lineHeight: 1.2 }}>
              {product.title}
            </h1>
            
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", color: "var(--warning)", gap: "4px" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{product.average_rating || "New"}</span>
              </div>
              <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                ({product.total_reviews} reviews)
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: "16px", marginBottom: "32px", paddingBottom: "32px", borderBottom: "1px solid var(--border-light)" }}>
              <span style={{ fontSize: "2rem", fontWeight: 700, color: "var(--text-primary)" }}>₹{product.price}</span>
              {product.compare_price && (
                <span style={{ fontSize: "1.25rem", textDecoration: "line-through", color: "var(--text-muted)" }}>₹{product.compare_price}</span>
              )}
            </div>

            <div style={{ marginBottom: "32px" }}>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "12px" }}>Description</h3>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, whiteSpace: "pre-line" }}>
                {product.description || "No description provided."}
              </p>
            </div>

            <div style={{ marginTop: "auto" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                  Stock: {product.stock > 0 ? <span style={{ color: "var(--success)", fontWeight: 600 }}>{product.stock} Available</span> : <span style={{ color: "var(--danger)", fontWeight: 600 }}>Out of Stock</span>}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  Sold by: <span style={{ fontWeight: 600 }}>{product.vendor?.vendor_profile?.store_name || "Independent Seller"}</span>
                </span>
              </div>

              <button 
                onClick={handleBuyNow} 
                disabled={product.stock <= 0}
                style={{ 
                  width: "100%", 
                  padding: "16px", 
                  background: product.stock > 0 ? "var(--brand-600)" : "var(--surface-3)", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "var(--radius-md)", 
                  fontSize: "1.125rem", 
                  fontWeight: 600, 
                  cursor: product.stock > 0 ? "pointer" : "not-allowed",
                  boxShadow: product.stock > 0 ? "0 4px 12px rgba(99, 102, 241, 0.3)" : "none",
                  transition: "all 0.2s ease"
                }}
              >
                {product.stock > 0 ? "Buy Now" : "Out of Stock"}
              </button>
            </div>

          </div>
        </div>

        {/* Reviews Section */}
        <div style={{ marginTop: "40px", background: "var(--surface-0)", padding: "40px", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)" }}>
          <h3 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "24px", color: "var(--text-primary)" }}>Customer Reviews</h3>
          
          {product.reviews && product.reviews.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {product.reviews.map((review: any) => (
                <div key={review.id} style={{ paddingBottom: "24px", borderBottom: "1px solid var(--border-light)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--brand-100)", color: "var(--brand-700)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600 }}>
                      {review.user?.name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <h5 style={{ fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>{review.user?.name || "Anonymous User"}</h5>
                      <div style={{ color: "var(--warning)", fontSize: "0.875rem" }}>{"★".repeat(review.rating)}{"☆".repeat(5-review.rating)}</div>
                    </div>
                    <span style={{ marginLeft: "auto", fontSize: "0.813rem", color: "var(--text-muted)" }}>
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "var(--text-muted)" }}>No reviews yet. Be the first to purchase and leave a review!</p>
          )}
        </div>

      </div>
    </main>
  );
}
