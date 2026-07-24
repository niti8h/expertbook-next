"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Package, Briefcase, Grid, ArrowRight, Layers } from "lucide-react";

export default function CategoriesPage() {
  const [activeTab, setActiveTab] = useState<"products" | "services">("products");
  
  const [productCategories, setProductCategories] = useState<any[]>([]);
  const [serviceCategories, setServiceCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllCategories = async () => {
      setLoading(true);
      try {
        const [prodRes, servRes] = await Promise.all([
          api("/marketplace/categories?type=product"),
          api("/marketplace/categories?type=service")
        ]);
        
        if (prodRes.status === 200) {
          setProductCategories(prodRes.data.data);
        }
        if (servRes.status === 200) {
          setServiceCategories(servRes.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllCategories();
  }, []);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", paddingBottom: "120px", position: "relative" }}>
      {/* Dynamic Background Banner */}
      <div style={{ 
        position: "absolute", top: 0, left: 0, width: "100%", height: "400px", 
        background: activeTab === "products" 
          ? "linear-gradient(135deg, rgba(79, 70, 229, 0.9) 0%, rgba(59, 130, 246, 0.8) 100%)"
          : "linear-gradient(135deg, rgba(5, 150, 105, 0.9) 0%, rgba(16, 185, 129, 0.8) 100%)",
        transition: "background 0.5s ease",
        zIndex: 0
      }} />
      
      {/* Decorative SVG Pattern */}
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "400px", opacity: 0.1, backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"1\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')", zIndex: 1 }} />

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "60px 20px 40px", position: "relative", zIndex: 10 }}>
        {/* Header Section */}
        <div style={{ textAlign: "center", marginBottom: "48px", color: "white" }}>
          <div style={{ display: "inline-flex", padding: "16px", backgroundColor: "rgba(255, 255, 255, 0.1)", borderRadius: "24px", backdropFilter: "blur(12px)", marginBottom: "24px" }}>
            <Layers size={40} color="white" />
          </div>
          <h1 style={{ fontSize: "3rem", fontWeight: 800, margin: "0 0 16px 0", letterSpacing: "-0.5px" }}>Explore Categories</h1>
          <p style={{ fontSize: "1.25rem", color: "rgba(255, 255, 255, 0.9)", maxWidth: "600px", margin: "0 auto" }}>
            Discover thousands of premium products and professional services.
          </p>
        </div>

        {/* Custom Tab Switcher */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "48px" }}>
          <div style={{ 
            display: "inline-flex", backgroundColor: "white", padding: "8px", 
            borderRadius: "100px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
            position: "relative"
          }}>
            <button 
              onClick={() => setActiveTab("products")}
              style={{
                display: "flex", alignItems: "center", gap: "8px", padding: "14px 32px", 
                borderRadius: "100px", border: "none", fontSize: "1.125rem", fontWeight: 600,
                cursor: "pointer", transition: "all 0.3s ease",
                backgroundColor: activeTab === "products" ? "var(--brand-600)" : "transparent",
                color: activeTab === "products" ? "white" : "#64748b"
              }}
            >
              <Package size={20} /> Products
            </button>
            <button 
              onClick={() => setActiveTab("services")}
              style={{
                display: "flex", alignItems: "center", gap: "8px", padding: "14px 32px", 
                borderRadius: "100px", border: "none", fontSize: "1.125rem", fontWeight: 600,
                cursor: "pointer", transition: "all 0.3s ease",
                backgroundColor: activeTab === "services" ? "#059669" : "transparent",
                color: activeTab === "services" ? "white" : "#64748b"
              }}
            >
              <Briefcase size={20} /> Services
            </button>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px", color: "#64748b", fontSize: "1.125rem" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
              <Grid size={40} className="animate-pulse" color="#cbd5e1" />
              Loading categories...
            </div>
          </div>
        ) : (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
            gap: "24px",
            animation: "fadeIn 0.5s ease-out"
          }}>
            
            {/* The "All" Card - Always first */}
            <Link 
              href={activeTab === "products" ? "/products" : "/services"}
              style={{
                display: "flex", flexDirection: "column", justifyContent: "space-between",
                backgroundColor: activeTab === "products" ? "rgba(79, 70, 229, 0.05)" : "rgba(5, 150, 105, 0.05)", 
                border: activeTab === "products" ? "2px dashed rgba(79, 70, 229, 0.3)" : "2px dashed rgba(5, 150, 105, 0.3)",
                borderRadius: "24px", padding: "32px", textDecoration: "none",
                transition: "all 0.2s ease",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02)"
              }}
              onMouseOver={(e) => { 
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.backgroundColor = activeTab === "products" ? "rgba(79, 70, 229, 0.1)" : "rgba(5, 150, 105, 0.1)";
                e.currentTarget.style.borderColor = activeTab === "products" ? "var(--brand-500)" : "#059669";
              }} 
              onMouseOut={(e) => { 
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.backgroundColor = activeTab === "products" ? "rgba(79, 70, 229, 0.05)" : "rgba(5, 150, 105, 0.05)";
                e.currentTarget.style.borderColor = activeTab === "products" ? "rgba(79, 70, 229, 0.3)" : "rgba(5, 150, 105, 0.3)";
              }}
            >
              <div>
                <div style={{ 
                  display: "inline-flex", padding: "16px", borderRadius: "20px", marginBottom: "20px",
                  backgroundColor: "white", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)"
                }}>
                  {activeTab === "products" ? <Package size={32} color="var(--brand-600)" /> : <Briefcase size={32} color="#059669" />}
                </div>
                <h3 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 8px 0", color: "#1e293b" }}>
                  All {activeTab === "products" ? "Products" : "Services"}
                </h3>
                <p style={{ color: "#64748b", margin: 0, fontSize: "1rem", lineHeight: 1.5 }}>
                  Browse our complete, unfiltered catalog of {activeTab === "products" ? "items" : "professional services"}.
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "24px", color: activeTab === "products" ? "var(--brand-600)" : "#059669", fontWeight: 600 }}>
                Explore All <ArrowRight size={18} />
              </div>
            </Link>

            {/* Dynamic Categories */}
            {(activeTab === "products" ? productCategories : serviceCategories).map((category) => (
              <Link 
                key={category.id}
                href={`/${activeTab}?category_id=${category.id}`}
                style={{
                  display: "flex", flexDirection: "column", justifyContent: "space-between",
                  backgroundColor: "white", borderRadius: "24px", padding: "32px", textDecoration: "none",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)",
                  transition: "all 0.2s ease", border: "1px solid #f1f5f9"
                }}
                onMouseOver={(e) => { 
                  e.currentTarget.style.transform = "translateY(-4px)"; 
                  e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.1)";
                }} 
                onMouseOut={(e) => { 
                  e.currentTarget.style.transform = "none"; 
                  e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.05)";
                }}
              >
                <div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0 0 8px 0", color: "#1e293b" }}>
                    {category.name}
                  </h3>
                  <p style={{ color: "#64748b", margin: 0, fontSize: "0.938rem", lineHeight: 1.5 }}>
                    {category.description || `Browse a wide selection of ${category.name.toLowerCase()} available for you.`}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "24px", color: "#94a3b8", fontWeight: 600, transition: "color 0.2s" }}
                     onMouseOver={(e) => e.currentTarget.style.color = activeTab === "products" ? "var(--brand-600)" : "#059669"}
                     onMouseOut={(e) => e.currentTarget.style.color = "#94a3b8"}
                >
                  View Category <ArrowRight size={16} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
