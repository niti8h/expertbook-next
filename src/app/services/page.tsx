"use client";
import { getImageUrl } from "../../lib/utils";

import { useState, useEffect, Suspense, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/ToastContext";
import { ChevronDown, ChevronUp, MapPin, Search, ArrowRight, Heart } from "lucide-react";

function ServicesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const toast = useToast();

  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [pincode, setPincode] = useState(searchParams.get("pincode") || "");
  const [activePincode, setActivePincode] = useState(searchParams.get("pincode") || "");
  const [resolvedCity, setResolvedCity] = useState("");

  const [isResolvingLocation, setIsResolvingLocation] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  const locationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setShowLocationDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (activePincode && activePincode.length === 6) {
      resolvePincode(activePincode, true);
    }
  }, []);

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
    fetchServices(activePincode, selectedCategory, searchTerm);
  }, [activePincode, selectedCategory, searchTerm]);

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
    setActivePincode(pincode);
    const params = new URLSearchParams(searchParams.toString());
    if (searchInput.trim()) params.set('search', searchInput.trim());
    else params.delete('search');
    
    if (pincode) params.set('pincode', pincode);
    else params.delete('pincode');
    
    router.push(`/services?${params.toString()}`);
  };

  const fetchServices = async (pin: string, categoryId: string, search: string) => {
    setLoading(true);
    try {
      let url = "/marketplace/services?";
      if (pin) {
        url += `pincode=${pin}&`;
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

  useEffect(() => {
    if (pincode.length === 6 && /^\d+$/.test(pincode)) {
      resolvePincode(pincode);
    } else {
      setLocationSuggestions([]);
      setShowLocationDropdown(false);
    }
  }, [pincode]);

  const resolvePincode = async (pin: string, silent = false) => {
    if (!silent) setIsResolvingLocation(true);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();

      if (data && data[0].Status === "Success") {
        const postOffices = data[0].PostOffice;
        const uniqueCities = Array.from(new Set(postOffices.map((po: any) => po.District)));
        const suggestions = uniqueCities.map(city => ({
          city: city,
          state: postOffices.find((po: any) => po.District === city)?.State,
          pincode: pin
        }));

        if (silent) {
          if (suggestions.length > 0) setResolvedCity(suggestions[0].city as string);
        } else {
          setLocationSuggestions(suggestions);
          setShowLocationDropdown(true);
        }
      } else if (!silent) {
        toast.error("Invalid Pincode");
        setLocationSuggestions([]);
        setShowLocationDropdown(false);
      }
    } catch (err) {
      console.error(err);
      if (!silent) toast.error("Failed to verify pincode");
    } finally {
      if (!silent) setIsResolvingLocation(false);
    }
  };

  const handleSelectLocation = (suggestion: any) => {
    setPincode(suggestion.pincode);
    setResolvedCity(suggestion.city);
    setShowLocationDropdown(false);
  };

  const clearLocation = () => {
    setPincode("");
    setActivePincode("");
    setResolvedCity("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete('pincode');
    router.push(`/services?${params.toString()}`);
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

      {/* Advanced Hero Search Bar */}
      <div style={{ 
        background: "linear-gradient(135deg, var(--brand-500) 0%, var(--brand-600) 100%)", 
        padding: "24px 24px 48px",
        color: "white",
        position: "relative",
        zIndex: 20,
        marginTop: 0
      }}>
        {/* Abstract background elements wrapped to prevent clipping dropdown */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", overflow: "hidden", pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: "-50%", left: "-10%", width: "50%", height: "200%", background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%)" }}></div>
        </div>

        <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 21 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h1 style={{ fontSize: "2.5rem", fontWeight: 700, margin: "0 0 8px 0", color: "white" }}>Find expert services.</h1>
              <p style={{ fontSize: "1.125rem", color: "rgba(255,255,255,0.8)", margin: 0 }}>Search top-rated professionals in your area.</p>
            </div>
            <Link href="/user/services" style={{ 
              display: "flex", alignItems: "center", gap: "8px",
              padding: "12px 24px", backgroundColor: "white", color: "var(--brand-600)", 
              borderRadius: "100px", fontSize: "1rem", fontWeight: 600, 
              textDecoration: "none", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              transition: "transform 0.2s"
            }}>
              + Add Service
            </Link>
          </div>

          <form onSubmit={handleSearchSubmit} style={{
            display: "flex",
            gap: "12px",
            backgroundColor: "white",
            padding: "8px",
            borderRadius: "var(--radius-xl)",
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.15)",
            flexWrap: "wrap",
            alignItems: "center"
          }}>
            {/* Keyword Search */}
            <div style={{ flex: "2 1 300px", display: "flex", alignItems: "center", padding: "0 16px", borderRight: "1px solid var(--border-light)" }}>
              <Search size={20} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search services, categories, and more..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                style={{
                  width: "100%",
                  padding: "16px 12px",
                  border: "none",
                  outline: "none",
                  fontSize: "1rem",
                  color: "var(--text-primary)",
                  backgroundColor: "transparent"
                }}
              />
            </div>

            {/* Location Search with Dropdown */}
            <div ref={locationRef} style={{ flex: "1 1 200px", position: "relative", display: "flex", alignItems: "center", padding: "0 16px" }}>
              <MapPin size={20} color={resolvedCity ? "var(--brand-600)" : "var(--text-muted)"} style={{ flexShrink: 0 }} />
              <div style={{ display: "flex", flexDirection: "column", width: "100%", paddingLeft: "12px" }}>
                {resolvedCity && (
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Service Area: {resolvedCity} DISTRICT
                  </span>
                )}
                <div style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter Pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                    style={{
                      width: "100%",
                      padding: resolvedCity ? "4px 0" : "16px 0",
                      border: "none",
                      outline: "none",
                      fontSize: "1rem",
                      color: "var(--text-primary)",
                      backgroundColor: "transparent",
                      fontWeight: resolvedCity ? 600 : 400
                    }}
                  />
                  {isResolvingLocation && (
                    <div className="spinner" style={{ width: "16px", height: "16px", border: "2px solid var(--border-light)", borderTopColor: "var(--brand-600)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                  )}
                  {activePincode && !isResolvingLocation && (
                    <button type="button" onClick={clearLocation} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.25rem", padding: "0 4px" }}>
                      &times;
                    </button>
                  )}
                </div>
              </div>

              {/* Autocomplete Dropdown */}
              {showLocationDropdown && locationSuggestions.length > 0 && (
                <div style={{
                  position: "absolute",
                  top: "calc(100% + 12px)",
                  left: 0,
                  width: "100%",
                  backgroundColor: "white",
                  borderRadius: "var(--radius-lg)",
                  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.15)",
                  border: "1px solid var(--border-light)",
                  zIndex: 10,
                  overflow: "hidden"
                }}>
                  {locationSuggestions.map((sug, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectLocation(sug)}
                      style={{
                        padding: "16px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        borderBottom: idx < locationSuggestions.length - 1 ? "1px solid var(--border-light)" : "none",
                        transition: "background-color 0.2s"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--surface-1)"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "white"}
                    >
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "var(--brand-50)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-600)" }}>
                        <MapPin size={16} />
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, color: "var(--text-primary)" }}>{sug.city}</p>
                        <p style={{ margin: 0, fontSize: "0.813rem", color: "var(--text-muted)" }}>{sug.state}, {sug.pincode}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn-primary" style={{ padding: "16px 32px", fontSize: "1rem", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", gap: "8px" }}>
              Search <ArrowRight size={18} />
            </button>
          </form>
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
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, margin: 0 }}>
              {activePincode ? "Services in " + (resolvedCity || activePincode) : (searchTerm ? "Results for '" + searchTerm + "'" : "All Services")}
            </h2>
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <Link href="/user/services" className="btn-primary" style={{ padding: "8px 20px", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px", borderRadius: "100px", fontSize: "0.875rem", whiteSpace: "nowrap" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Service
              </Link>
            </div>
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
                {activePincode 
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
                      <div className="product-image-container" style={{ position: "relative", backgroundImage: `url(${getImageUrl(service.images?.[0])})` }}>
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
                    {service.vendor?.phone && (
                      <Link href={`/profile/${service.vendor.phone}`} style={{ textDecoration: "none", display: "block" }}>
                        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border-light)", backgroundColor: "var(--surface-0)", transition: "background-color 0.2s" }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--surface-1)"}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--surface-0)"}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden" }}>
                            {service.vendor?.avatar ? (
                              <img src={getImageUrl(service.vendor.avatar)} alt="avatar" style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover", border: "1px solid var(--border-light)", flexShrink: 0 }} />
                            ) : (
                              <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "var(--brand-100)", color: "var(--brand-700)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>
                                {(service.vendor?.name || "U").charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ margin: 0, fontSize: "0.813rem", fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {service.vendor?.name || "Unknown User"}
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
