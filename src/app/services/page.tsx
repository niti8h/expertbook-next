"use client";
import { getImageUrl } from "../../lib/utils";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/ToastContext";

function ServicesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const toast = useToast();

  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Location state
  const [lat, setLat] = useState(searchParams.get("lat") || "");
  const [lng, setLng] = useState(searchParams.get("lng") || "");
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "success" | "error">(
    lat && lng ? "success" : "idle"
  );

  // Categories state
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get("category_id") || "");

  // Search state
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api("/marketplace/categories?type=service");
      if (res.status === 200) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchServices(lat, lng, selectedCategory, searchTerm);
  }, [lat, lng, selectedCategory, searchTerm]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId) {
      params.set('category_id', categoryId);
    } else {
      params.delete('category_id');
    }
    router.push(`/services?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    const params = new URLSearchParams(searchParams.toString());
    if (searchInput.trim()) {
      params.set('search', searchInput.trim());
    } else {
      params.delete('search');
    }
    router.push(`/services?${params.toString()}`);
  };

  const fetchServices = async (latitude: string, longitude: string, categoryId: string, search: string) => {
    setLoading(true);
    try {
      let url = "/marketplace/services?";
      if (latitude && longitude) {
        url += `lat=${latitude}&lng=${longitude}&`;
      }
      if (categoryId) {
        url += `category_id=${categoryId}&`;
      }
      if (search) {
        url += `search=${encodeURIComponent(search)}&`;
      }
      const res = await api(url);
      if (res.status === 200) {
        setServices(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const requestLocation = () => {
    setLocationStatus("loading");
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setLocationStatus("error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLat = position.coords.latitude.toString();
        const newLng = position.coords.longitude.toString();
        setLat(newLat);
        setLng(newLng);
        setLocationStatus("success");
        
        const params = new URLSearchParams(searchParams.toString());
        params.set('lat', newLat);
        params.set('lng', newLng);
        router.push(`/services?${params.toString()}`);
      },
      () => {
        toast.error("Unable to retrieve your location. Please allow access.");
        setLocationStatus("error");
      }
    );
  };

  const clearLocation = () => {
    setLat("");
    setLng("");
    setLocationStatus("idle");
    router.push('/services');
  };

  const handleBook = (serviceId: number) => {
    const token = localStorage.getItem("auth-token");
    if (!token) {
      toast.error("You must be logged in to book.");
      router.push("/login");
      return;
    }
    router.push(`/checkout?item_id=${serviceId}&type=service`);
  };

  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--surface-0)", color: "var(--text-primary)" }}>

      {/* Location Banner */}
      <div className="responsive-padding" style={{ backgroundColor: "var(--surface-1)", paddingTop: "16px", paddingBottom: "16px", borderBottom: "1px solid var(--border-light)" }}>
        <div className="flex-wrap-mobile" style={{ display: "flex", alignItems: "center", gap: "16px", maxWidth: "1200px", margin: "0 auto", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span style={{ fontWeight: 500, fontSize: "0.875rem" }}>Service Area:</span>
            </div>
            {locationStatus === "success" ? (
              <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--brand-600)" }}>Location Active</span>
            ) : locationStatus === "loading" ? (
              <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>Locating...</span>
            ) : (
              <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>Anywhere (Showing all)</span>
            )}
          </div>
          
          <div style={{ display: "flex", gap: "12px", width: "100%", maxWidth: "300px" }}>
            {locationStatus === "success" ? (
              <button onClick={clearLocation} className="btn-secondary" style={{ width: "100%", padding: "8px 16px", fontSize: "0.875rem" }}>
                Clear Location
              </button>
            ) : (
              <button onClick={requestLocation} className="btn-primary" style={{ width: "100%", padding: "8px 16px", fontSize: "0.875rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                </svg>
                Use My Location
              </button>
            )}
          </div>
        </div>
      </div>

      <main className="page-layout responsive-padding" style={{ maxWidth: "1200px", margin: "40px auto" }}>
        
        {/* Sidebar Filters */}
        <aside>
          <div style={{ marginBottom: "32px" }}>
            <h3 className="hide-mobile" style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "16px" }}>Categories</h3>
            <ul className="sidebar-mobile-scroll" style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              <li>
                <button 
                  onClick={() => handleCategoryChange("")} 
                  style={{ 
                    padding: "8px 20px", 
                    borderRadius: "100px", 
                    border: selectedCategory === "" ? "1px solid var(--brand-600)" : "1px solid var(--border-light)", 
                    backgroundColor: selectedCategory === "" ? "var(--brand-50)" : "white",
                    color: selectedCategory === "" ? "var(--brand-700)" : "var(--text-secondary)",
                    fontSize: "0.875rem", 
                    fontWeight: 600,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.2s"
                  }}
                >
                  All Categories
                </button>
              </li>
              {categories.map(cat => (
                <li key={cat.id}>
                  <button 
                    onClick={() => handleCategoryChange(cat.id.toString())} 
                    style={{ 
                      padding: "8px 20px", 
                      borderRadius: "100px", 
                      border: selectedCategory === cat.id.toString() ? "1px solid var(--brand-600)" : "1px solid var(--border-light)", 
                      backgroundColor: selectedCategory === cat.id.toString() ? "var(--brand-50)" : "white",
                      color: selectedCategory === cat.id.toString() ? "var(--brand-700)" : "var(--text-secondary)",
                      fontSize: "0.875rem", 
                      fontWeight: 600,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      transition: "all 0.2s"
                    }}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="hide-mobile">
            <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "16px" }}>Price Range</h3>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input type="number" placeholder="Min" className="input-primary" style={{ width: "100%", minWidth: "80px" }} />
              <span>-</span>
              <input type="number" placeholder="Max" className="input-primary" style={{ width: "100%", minWidth: "80px" }} />
            </div>
          </div>
        </aside>

        {/* Services Grid */}
        <div style={{ width: "100%" }}>
          <div className="flex-wrap-mobile" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", gap: "16px", flexWrap: "wrap" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600 }}>
              {locationStatus === "success" ? "Services near you" : "All Services"}
            </h2>
            
            <form onSubmit={handleSearchSubmit} style={{ display: "flex", width: "100%", maxWidth: "400px", position: "relative", flex: 1, minWidth: "250px" }}>
              <input 
                type="text" 
                placeholder="Search services..." 
                className="input-primary"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                style={{ width: "100%", paddingLeft: "42px", paddingRight: "16px", borderRadius: "100px", border: "1px solid var(--border-light)", backgroundColor: "white", outline: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}
              />
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)" }}>
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              {searchInput && (
                <button type="button" onClick={() => { setSearchInput(""); handleSearchSubmit({ preventDefault: () => {} } as any); }} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "4px" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              )}
            </form>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>Sort by:</span>
              <select style={{ padding: "8px", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)", backgroundColor: "white", fontSize: "0.875rem" }}>
                <option>Recommended</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: "60px", textAlign: "center", color: "var(--text-muted)" }}>Loading services...</div>
          ) : services.length === 0 ? (
            <div style={{ padding: "60px", textAlign: "center", backgroundColor: "var(--surface-1)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-light)" }}>
              <svg style={{ margin: "0 auto 16px" }} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "8px" }}>No services found</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                {locationStatus === "success" 
                  ? "We couldn't find any services in your immediate area." 
                  : "No services available at the moment."}
              </p>
            </div>
          ) : (
            <div className="product-grid">
              {services.map((service) => {
                const storeName = service.vendor?.vendor_profile?.store_name || service.vendor?.name || 'store';
                const storeSlug = storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                
                return (
                  <div key={service.id} className="product-card" style={{ display: "flex", flexDirection: "column", borderRadius: "var(--radius-xl)", overflow: "hidden", backgroundColor: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", border: "1px solid var(--border-light)" }}>
                    <Link href={`/services/${service.slug}`} style={{ textDecoration: "none", color: "inherit", flex: 1, display: "flex", flexDirection: "column" }}>
                      
                      {/* Image Header */}
                      <div className="product-image-container" style={{ position: "relative", backgroundImage: `url(${process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.expertbook.in"}${service.images?.[0] || ''})` }}>
                        {!service.images?.[0] && <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No Image</div>}
                        
                        {/* Floating Category Pill */}
                        <div style={{ position: "absolute", top: "12px", left: "12px", backgroundColor: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(4px)", padding: "4px 10px", borderRadius: "100px", fontSize: "0.75rem", fontWeight: 700, color: "var(--brand-700)", textTransform: "uppercase", letterSpacing: "0.5px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", zIndex: 2 }}>
                          {service.category?.name || "Service"}
                        </div>

                        {/* Floating Rating Pill */}
                        {service.average_rating ? (
                          <div style={{ position: "absolute", top: "12px", right: "12px", backgroundColor: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(4px)", padding: "4px 8px", borderRadius: "100px", fontSize: "0.813rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", zIndex: 2 }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                            {service.average_rating}
                          </div>
                        ) : (
                          <div style={{ position: "absolute", top: "12px", right: "12px", backgroundColor: "var(--brand-600)", padding: "4px 8px", borderRadius: "100px", fontSize: "0.75rem", fontWeight: 700, color: "white", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", zIndex: 2 }}>
                            NEW
                          </div>
                        )}
                      </div>

                      {/* Body Content */}
                      <div style={{ padding: "16px", display: "flex", flexDirection: "column", flex: 1 }}>
                        <h3 style={{ fontSize: "1.125rem", fontWeight: 700, margin: "0 0 8px 0", color: "var(--text-primary)", lineHeight: 1.4 }}>
                          {service.title}
                        </h3>
                        
                        <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", margin: "0 0 16px 0", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.5 }}>
                          {service.description || "Professional service provided by our top-rated vendor network."}
                        </p>

                        <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "12px" }}>
                          <div>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "2px", fontWeight: 500, textTransform: "uppercase" }}>Price</span>
                            <div style={{ display: "flex", alignItems: "baseline", gap: "4px", flexWrap: "wrap" }}>
                              <span style={{ fontSize: "1.375rem", fontWeight: 800, color: "var(--text-primary)" }}>₹{service.price}</span>
                              <span style={{ fontSize: "0.813rem", color: "var(--text-muted)", fontWeight: 500, whiteSpace: "nowrap" }}>
                                {service.price_type === 'starting_at' ? 'onwards' : service.price_type === 'hourly' ? '/ hr' : 'fixed'}
                              </span>
                            </div>
                          </div>
                          
                          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleBook(service.id); }} className="btn-primary" style={{ padding: "8px 16px", fontSize: "0.875rem", fontWeight: 600, borderRadius: "100px", flexShrink: 0 }}>
                            Book
                          </button>
                        </div>
                      </div>
                    </Link>
                    
                    {/* Vendor Footer as separate Link */}
                    {service.vendor?.id && (
                      <Link href={`/store/${service.vendor.id}/${storeSlug}`} style={{ textDecoration: "none", display: "block" }}>
                        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border-light)", backgroundColor: "var(--surface-0)", transition: "background-color 0.2s" }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--surface-1)"}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--surface-0)"}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden" }}>
                            {service.vendor?.vendor_profile?.store_logo ? (
                              <img src={getImageUrl(service.vendor.vendor_profile.store_logo)} alt="logo" style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover", border: "1px solid var(--border-light)", flexShrink: 0 }} />
                            ) : (
                              <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "var(--brand-100)", color: "var(--brand-700)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>
                                {(service.vendor?.vendor_profile?.store_name || service.vendor?.name || "V").charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ margin: 0, fontSize: "0.813rem", fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {service.vendor?.vendor_profile?.store_name || service.vendor?.name}
                              </p>
                            </div>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="9 18 15 12 9 6"></polyline></svg>
                          </div>
                        </div>
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ServicesContent />
    </Suspense>
  );
}
