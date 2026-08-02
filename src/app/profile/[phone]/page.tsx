"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function UserProfile() {
  const { phone } = useParams();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"products" | "services" | "blogs">("products");

  useEffect(() => {
    if (phone) {
      api(`/profile/${phone}`).then(res => {
        if (res.status === 200) {
          setProfileData(res.data.data);
        }
      }).catch(err => {
        console.error(err);
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [phone]);

  if (loading) {
    return (
      <>
        <Header />
        <div style={{ minHeight: "60vh", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafc" }}>
          <div style={{ color: "#64748b", fontSize: "1.125rem" }}>Loading profile...</div>
        </div>
        <Footer />
      </>
    );
  }

  if (!profileData || !profileData.user) {
    return (
      <>
        <Header />
        <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafc" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>Profile Not Found</h2>
          <p style={{ color: "#64748b", marginBottom: "24px" }}>We couldn't find a user with this mobile number.</p>
          <Link href="/" style={{ padding: "12px 24px", backgroundColor: "var(--brand-600)", color: "white", borderRadius: "100px", textDecoration: "none", fontWeight: 600 }}>Back Home</Link>
        </div>
        <Footer />
      </>
    );
  }

  const { user, products, services, blogs } = profileData;

  return (
    <>
      <Header />
      <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", paddingBottom: "80px" }}>
        {/* Banner */}
        <div style={{ 
          height: "250px", 
          backgroundColor: "#e2e8f0", 
          backgroundImage: user.banner ? `url(${user.banner})` : "linear-gradient(135deg, #f0f9ff 0%, #cffafe 100%)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative"
        }}>
          {/* Avatar positioning */}
          <div style={{ position: "absolute", bottom: "-60px", left: "max(20px, calc((100% - 1200px) / 2))" }}>
            <div style={{ 
              width: "120px", height: "120px", borderRadius: "50%", backgroundColor: "white", 
              border: "4px solid white", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
              overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center",
              backgroundImage: user.avatar ? `url(${user.avatar})` : "none"
            }}>
              {!user.avatar && <span style={{ fontSize: "3rem", fontWeight: 800, color: "#94a3b8" }}>{user.name.charAt(0).toUpperCase()}</span>}
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "80px 20px 40px" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#0f172a", margin: "0 0 8px 0", lineHeight: 1.1 }}>{user.name}</h1>
          <div style={{ display: "flex", gap: "16px", color: "#64748b", marginBottom: "24px" }}>
            {user.city && user.state && (
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                {user.city}, {user.state}
              </span>
            )}
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              {user.phone}
            </span>
          </div>

          {user.bio && (
            <p style={{ maxWidth: "800px", color: "#475569", fontSize: "1.125rem", lineHeight: 1.6, margin: 0 }}>
              {user.bio}
            </p>
          )}
        </div>

        {/* Tabs */}
        <div style={{ maxWidth: "1200px", margin: "0 auto 32px", padding: "0 20px" }}>
          <div style={{ display: "flex", gap: "32px", borderBottom: "1px solid #cbd5e1" }}>
            <button 
              onClick={() => setActiveTab("products")}
              style={{ padding: "16px 0", backgroundColor: "transparent", border: "none", borderBottom: activeTab === "products" ? "3px solid var(--brand-600)" : "3px solid transparent", color: activeTab === "products" ? "var(--brand-600)" : "#64748b", fontWeight: activeTab === "products" ? 700 : 500, fontSize: "1.125rem", cursor: "pointer", display: "flex", gap: "8px", alignItems: "center" }}
            >
              🛍️ Products ({products?.length || 0})
            </button>
            <button 
              onClick={() => setActiveTab("services")}
              style={{ padding: "16px 0", backgroundColor: "transparent", border: "none", borderBottom: activeTab === "services" ? "3px solid var(--brand-600)" : "3px solid transparent", color: activeTab === "services" ? "var(--brand-600)" : "#64748b", fontWeight: activeTab === "services" ? 700 : 500, fontSize: "1.125rem", cursor: "pointer", display: "flex", gap: "8px", alignItems: "center" }}
            >
              🛠️ Services ({services?.length || 0})
            </button>
            <button 
              onClick={() => setActiveTab("blogs")}
              style={{ padding: "16px 0", backgroundColor: "transparent", border: "none", borderBottom: activeTab === "blogs" ? "3px solid var(--brand-600)" : "3px solid transparent", color: activeTab === "blogs" ? "var(--brand-600)" : "#64748b", fontWeight: activeTab === "blogs" ? 700 : 500, fontSize: "1.125rem", cursor: "pointer", display: "flex", gap: "8px", alignItems: "center" }}
            >
              📝 Articles ({blogs?.length || 0})
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
          
          {/* Products Tab */}
          {activeTab === "products" && (
            products?.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
                {products.map((product: any) => (
                  <Link key={product.id} href={`/products/${product.slug}`} style={{ backgroundColor: "white", borderRadius: "20px", overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column" }}>
                    <div style={{ height: "200px", backgroundColor: "#e2e8f0", backgroundImage: product.images?.[0] ? `url(${product.images[0]})` : "none", backgroundSize: "cover", backgroundPosition: "center" }}></div>
                    <div style={{ padding: "20px" }}>
                      <h3 style={{ margin: "0 0 8px 0", fontSize: "1.125rem", fontWeight: 700, color: "#0f172a" }}>{product.title}</h3>
                      <div style={{ fontWeight: 800, color: "var(--brand-600)", fontSize: "1.25rem" }}>₹{Number(product.price).toLocaleString("en-IN")}</div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div style={{ padding: "60px", textAlign: "center", backgroundColor: "white", borderRadius: "24px", color: "#64748b" }}>
                No products available.
              </div>
            )
          )}

          {/* Services Tab */}
          {activeTab === "services" && (
            services?.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
                {services.map((service: any) => (
                  <Link key={service.id} href={`/services/${service.slug}`} style={{ backgroundColor: "white", borderRadius: "20px", overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column" }}>
                    <div style={{ height: "200px", backgroundColor: "#e2e8f0", backgroundImage: service.images?.[0] ? `url(${service.images[0]})` : "none", backgroundSize: "cover", backgroundPosition: "center" }}></div>
                    <div style={{ padding: "20px" }}>
                      <h3 style={{ margin: "0 0 8px 0", fontSize: "1.125rem", fontWeight: 700, color: "#0f172a" }}>{service.title}</h3>
                      <div style={{ fontWeight: 800, color: "var(--brand-600)", fontSize: "1.25rem" }}>₹{Number(service.price).toLocaleString("en-IN")}</div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div style={{ padding: "60px", textAlign: "center", backgroundColor: "white", borderRadius: "24px", color: "#64748b" }}>
                No services available.
              </div>
            )
          )}

          {/* Blogs Tab */}
          {activeTab === "blogs" && (
            blogs?.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
                {blogs.map((blog: any) => (
                  <div key={blog.id} style={{ backgroundColor: "white", borderRadius: "20px", overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column" }}>
                    <div style={{ height: "180px", backgroundColor: "#e2e8f0", backgroundImage: blog.image ? `url(${blog.image})` : "none", backgroundSize: "cover", backgroundPosition: "center" }}></div>
                    <div style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column" }}>
                      <h3 style={{ margin: "0 0 12px 0", fontSize: "1.25rem", fontWeight: 700, color: "#0f172a", lineHeight: 1.3 }}>{blog.title}</h3>
                      <div style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "16px" }}>
                        Published on {new Date(blog.published_at).toLocaleDateString()}
                      </div>
                      <Link href={`/blog/${blog.slug}`} style={{ marginTop: "auto", display: "inline-block", padding: "10px 20px", backgroundColor: "#f1f5f9", color: "#0f172a", borderRadius: "100px", textDecoration: "none", fontWeight: 600, textAlign: "center" }}>
                        Read Article
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: "60px", textAlign: "center", backgroundColor: "white", borderRadius: "24px", color: "#64748b" }}>
                No articles published yet.
              </div>
            )
          )}

        </div>
      </div>
    </>
  );
}
