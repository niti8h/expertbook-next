"use client";
import { getImageUrl } from "../../../lib/utils";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/ToastContext";
import Link from "next/link";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const toast = useToast();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>("");

  useEffect(() => {
    if (slug) fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await api(`/marketplace/products/${slug}`);
      if (res.status === 200) {
        setProduct(res.data.data);
        if (res.data.data.images && res.data.data.images.length > 0) {
          setActiveImage(res.data.data.images[0]);
        }
      } else {
        toast.error("Product not found");
        router.push("/products");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching product");
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = () => {
    const token = localStorage.getItem("auth-token");
    if (!token) {
      toast.error("You must be logged in to purchase.");
      router.push("/login");
      return;
    }
    router.push(`/checkout?item_id=${product.id}&type=product`);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "var(--surface-0)" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "1.125rem" }}>Loading product details...</p>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--surface-0)", color: "var(--text-primary)" }}>
      {/* Breadcrumbs */}
      <div style={{ backgroundColor: "var(--surface-1)", padding: "16px 40px", borderBottom: "1px solid var(--border-light)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
          <Link href="/products" style={{ color: "var(--brand-600)", textDecoration: "none" }}>Products</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          {product.category?.name || "Category"}
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: "var(--text-primary)" }}>{product.title}</span>
        </div>
      </div>

      <main className="responsive-padding" style={{ maxWidth: "1200px", margin: "40px auto" }}>
        <div className="detail-layout">
          
          {/* Left Column: Image Gallery */}
          <div style={{ display: "flex", gap: "16px" }}>
            {/* Thumbnails (Vertical) */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "80px" }}>
              {product.images && product.images.length > 0 ? (
                product.images.map((img: string, idx: number) => (
                  <div 
                    key={idx} 
                    onClick={() => setActiveImage(img)}
                    style={{ 
                      width: "80px", 
                      height: "80px", 
                      borderRadius: "var(--radius-sm)", 
                      overflow: "hidden", 
                      cursor: "pointer",
                      border: activeImage === img ? "2px solid var(--brand-600)" : "1px solid var(--border-light)",
                      opacity: activeImage === img ? 1 : 0.6,
                      transition: "all 0.2s"
                    }}
                  >
                    <img src={getImageUrl(img)} alt={`Thumbnail ${idx}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))
              ) : (
                <div style={{ width: "80px", height: "80px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", backgroundColor: "var(--surface-1)" }}></div>
              )}
            </div>

            {/* Main Image */}
            <div style={{ flex: 1, height: "600px", borderRadius: "var(--radius-md)", overflow: "hidden", backgroundColor: "var(--surface-1)", border: "1px solid var(--border-light)" }}>
              {activeImage ? (
                <img src={getImageUrl(activeImage)} alt={product.title} style={{ width: "100%", height: "100%", objectFit: "contain", backgroundColor: "white" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>No Image Available</div>
              )}
            </div>
          </div>

          {/* Right Column: Details */}
          <div>
            <div style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <span style={{ fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600, color: "var(--brand-600)" }}>{product.category?.name}</span>
                {product.stock > 0 ? (
                  <span style={{ backgroundColor: "rgba(34, 197, 94, 0.1)", color: "rgb(34, 197, 94)", padding: "4px 8px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600 }}>In Stock</span>
                ) : (
                  <span style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "rgb(239, 68, 68)", padding: "4px 8px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600 }}>Out of Stock</span>
                )}
              </div>
              <h1 style={{ fontSize: "2.5rem", fontWeight: 700, lineHeight: 1.2, marginBottom: "16px", color: "var(--text-primary)" }}>{product.title}</h1>
              
              <div style={{ display: "flex", alignItems: "flex-end", gap: "16px", marginBottom: "32px" }}>
                <span style={{ fontSize: "2rem", fontWeight: 700, color: "var(--text-primary)" }}>₹{product.price}</span>
                {product.compare_price && (
                  <span style={{ fontSize: "1.25rem", color: "var(--text-muted)", textDecoration: "line-through", paddingBottom: "4px" }}>₹{product.compare_price}</span>
                )}
              </div>
            </div>

            <div style={{ marginBottom: "40px", padding: "24px", backgroundColor: "white", borderRadius: "var(--radius-md)", border: "1px solid var(--border-light)", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px", color: "var(--text-primary)" }}>Product Description</h3>
              <p style={{ fontSize: "0.938rem", color: "var(--text-secondary)", lineHeight: 1.6, whiteSpace: "pre-line" }}>
                {product.description || "No description provided."}
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "40px" }}>
              <Link href={`/store/${product.vendor?.id}/${(product.vendor?.vendor_profile?.store_name || product.vendor?.name || 'store').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}`} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px 24px", backgroundColor: "var(--surface-1)", borderRadius: "var(--radius-md)", flex: 1, border: "1px solid var(--border-light)", textDecoration: "none", transition: "background-color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--surface-2)"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "var(--surface-1)"}
              >
                <div style={{ width: "48px", height: "48px", borderRadius: "50%", overflow: "hidden", backgroundColor: "var(--surface-2)" }}>
                  {product.vendor?.vendor_profile?.store_logo ? (
                    <img src={getImageUrl(product.vendor.vendor_profile.store_logo)} alt="Store Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>
                  )}
                </div>
                <div>
                  <p style={{ fontSize: "0.813rem", color: "var(--text-secondary)", margin: 0 }}>Sold by</p>
                  <p style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
                    {product.vendor?.vendor_profile?.store_name || product.vendor?.name}
                  </p>
                </div>
              </Link>
              <button 
                onClick={handleBuy} 
                className="btn-primary" 
                disabled={product.stock <= 0}
                style={{ 
                  padding: "16px 40px", 
                  fontSize: "1.125rem", 
                  height: "82px",
                  opacity: product.stock <= 0 ? 0.5 : 1,
                  boxShadow: product.stock > 0 ? "0 4px 14px 0 rgba(79, 70, 229, 0.39)" : "none"
                }}
              >
                {product.stock > 0 ? "Buy Now" : "Out of Stock"}
              </button>
            </div>

          </div>
        </div>

        {/* Customer Reviews Section */}
        <div style={{ marginTop: "60px", paddingTop: "40px", borderTop: "1px solid var(--border-light)" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "32px" }}>
            <div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 8px 0" }}>Customer Reviews</h2>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "1.25rem", color: "#eab308" }}>★</span>
                <span style={{ fontSize: "1.125rem", fontWeight: 600 }}>{product.average_rating || 0}</span>
                <span style={{ color: "var(--text-secondary)" }}>({product.total_reviews || 0} reviews)</span>
              </div>
            </div>
          </div>

          {!product.reviews || product.reviews.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", backgroundColor: "var(--surface-1)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-light)" }}>
              <p style={{ color: "var(--text-secondary)", margin: 0 }}>There are no reviews for this product yet.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {product.reviews.map((review: any) => (
                <div key={review.id} style={{ padding: "24px", backgroundColor: "var(--surface-0)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-light)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "var(--surface-2)", overflow: "hidden" }}>
                        {review.user?.avatar ? (
                          <img src={getImageUrl(review.user.avatar)} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "1.2rem", fontWeight: 600 }}>
                            {review.user?.name?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, margin: "0 0 4px 0" }}>{review.user?.name}</p>
                        <div style={{ display: "flex", gap: "2px" }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} style={{ color: star <= review.rating ? "#eab308" : "#d1d5db", fontSize: "0.875rem" }}>★</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <span style={{ fontSize: "0.813rem", color: "var(--text-muted)" }}>
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {review.comment && (
                    <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 16px 0" }}>
                      {review.comment}
                    </p>
                  )}

                  {review.image && (
                    <div style={{ marginBottom: "16px" }}>
                      <img src={getImageUrl(review.image)} alt="Review photo" style={{ borderRadius: "var(--radius-sm)", maxHeight: "150px", border: "1px solid var(--border-light)" }} />
                    </div>
                  )}

                  {review.vendor_reply && (
                    <div style={{ marginTop: "16px", padding: "16px", backgroundColor: "var(--surface-1)", borderRadius: "var(--radius-md)", borderLeft: "4px solid var(--brand-500)" }}>
                      <p style={{ fontSize: "0.813rem", fontWeight: 600, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 8px 0" }}>
                        Response from Vendor
                      </p>
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.938rem", margin: 0, lineHeight: 1.5 }}>
                        {review.vendor_reply}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
