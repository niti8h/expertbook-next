"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";

export default function StoreProfile() {
  const { id } = useParams();
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchStore();
  }, [id]);

  const fetchStore = async () => {
    try {
      const res = await api(`/marketplace/store/${id}`);
      if (res.status === 200) {
        setStore(res.data.data.vendor);
        setProducts(res.data.data.products);
      }
    } catch (err) {
      console.error("Error fetching store:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "100px", minHeight: "60vh" }}>
        <div style={{ width: "40px", height: "40px", border: "3px solid var(--border-light)", borderTopColor: "var(--brand-600)", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
      </div>
    );
  }

  if (!store) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px", minHeight: "60vh" }}>
        <h2>Store Not Found</h2>
        <p style={{ color: "var(--text-secondary)", marginTop: "10px" }}>The store you are looking for does not exist or is currently inactive.</p>
        <Link href="/products" className="btn-primary" style={{ display: "inline-block", marginTop: "20px" }}>Browse Products</Link>
      </div>
    );
  }

  const storeName = store.store_name || store.name || "Vendor Store";
  const defaultBanner = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80";
  const getImageUrl = (path: string | undefined | null, fallback: string) => {
    if (!path) return fallback;
    if (path.startsWith('http')) return path;
    return `https://api.expertbook.in${path.startsWith('/') ? '' : '/'}${path}`;
  };

  return (
    <main style={{ backgroundColor: "var(--surface-0)", minHeight: "100vh" }}>
      {/* Store Banner */}
      <div style={{ position: "relative", width: "100%", height: "250px", backgroundColor: "var(--surface-200)" }}>
        <img 
          src={getImageUrl(store.store_banner, defaultBanner)} 
          alt={`${storeName} Banner`}
          style={{ objectFit: "cover", width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)" }}></div>
      </div>

      <div className="container" style={{ marginTop: "-60px", position: "relative", zIndex: 10, paddingBottom: "80px" }}>
        {/* Store Header Info */}
        <div style={{ backgroundColor: "var(--surface-0)", borderRadius: "var(--radius-lg)", padding: "30px", display: "flex", gap: "24px", alignItems: "flex-end", flexWrap: "wrap", boxShadow: "var(--shadow-md)", marginBottom: "40px" }}>
          <div style={{ width: "120px", height: "120px", backgroundColor: "white", borderRadius: "50%", border: "4px solid white", overflow: "hidden", position: "relative", flexShrink: 0, boxShadow: "var(--shadow-sm)" }}>
            <img 
              src={getImageUrl(store.store_logo || store.avatar, "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200&q=80")}
              alt={storeName}
              style={{ objectFit: "cover", width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
            />
          </div>
          <div style={{ flex: 1, paddingBottom: "10px" }}>
            <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: "0 0 8px 0", color: "var(--text-primary)" }}>
              {storeName}
            </h1>
            {store.store_description && (
              <p style={{ color: "var(--text-secondary)", margin: 0, maxWidth: "800px", lineHeight: 1.5 }}>
                {store.store_description}
              </p>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "24px", paddingBottom: "12px", borderBottom: "1px solid var(--border-light)" }}>
            Products from {storeName} ({products.length})
          </h2>

          {products.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", backgroundColor: "var(--surface-100)", borderRadius: "var(--radius-md)" }}>
              <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>This store doesn&apos;t have any active products yet.</p>
            </div>
          ) : (
            <div className="product-grid">
              {products.map(product => (
                <Link href={`/products/${product.slug}`} key={product.id} className="product-card" style={{ textDecoration: "none", color: "inherit" }}>
                  <div className="product-image-container" style={{ position: "relative" }}>
                    {product.images && product.images.length > 0 ? (
                      <img 
                        src={product.images[0].startsWith('http') ? product.images[0] : `https://api.expertbook.in${product.images[0]}`} 
                        alt={product.title} 
                        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} 
                      />
                    ) : (
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>No image</div>
                    )}
                  </div>
                  <div className="product-content">
                      <div style={{ color: "var(--brand-600)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", marginBottom: "8px" }}>
                        {product.category?.name}
                      </div>
                    <h3 className="product-title">
                      {product.title}
                    </h3>
                      <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)" }}>
                          ₹{parseFloat(product.price).toLocaleString("en-IN")}
                        </div>
                      </div>
                    </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
