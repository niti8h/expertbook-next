"use client";
import { getImageUrl } from "../../lib/utils";

import { useState, useEffect, Suspense, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/ToastContext";
import { ChevronDown, ChevronUp, MapPin, Search, ArrowRight, Heart } from "lucide-react";

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const toast = useToast();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [pincode, setPincode] = useState(searchParams.get("pincode") || "");
  const [activePincode, setActivePincode] = useState(searchParams.get("pincode") || "");
  const [resolvedCity, setResolvedCity] = useState("");

  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("latest");
  const [showFilterByRange, setShowFilterByRange] = useState(false);

  // Wishlist state
  const [likedProductIds, setLikedProductIds] = useState<number[]>([]);

  // Location Autocomplete State
  const [isResolvingLocation, setIsResolvingLocation] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  const locationRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
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
    fetchCategories();
    fetchWishlist();
    // If activePincode is set on load, resolve it silently to get the city name
    if (activePincode && activePincode.length === 6) {
      resolvePincode(activePincode, true);
    }
  }, []);

  const fetchWishlist = async () => {
    const token = localStorage.getItem("auth-token");
    if (!token) return;
    try {
      const res = await api("/user/wishlist", { token });
      if (res.status === 200) {
        setLikedProductIds(res.data.data.map((p: any) => p.id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleLike = async (e: React.MouseEvent, productId: number) => {
    e.preventDefault();
    e.stopPropagation();
    const token = localStorage.getItem("auth-token");
    if (!token) {
      toast.error("Please login to like products");
      router.push("/login");
      return;
    }
    
    const isLiked = likedProductIds.includes(productId);
    
    // Optimistic update
    setLikedProductIds(prev => 
      isLiked ? prev.filter(id => id !== productId) : [...prev, productId]
    );

    try {
      const res = await api(`/product/${productId}/like`, { method: "POST", token });
      if (res.status !== 200) {
        // Revert on failure
        setLikedProductIds(prev => 
          !isLiked ? prev.filter(id => id !== productId) : [...prev, productId]
        );
        toast.error("Failed to update wishlist");
      }
    } catch (err) {
      // Revert on failure
      setLikedProductIds(prev => 
        !isLiked ? prev.filter(id => id !== productId) : [...prev, productId]
      );
      toast.error("Failed to update wishlist");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [activePincode, selectedCategories, sort]);

  // Debounced fetch for price so it doesn't fetch on every keystroke
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchProducts();
    }, 500);
    return () => clearTimeout(handler);
  }, [minPrice, maxPrice]);

  // Watch pincode input to trigger auto-resolve
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
        // Extract unique districts (cities)
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

  const fetchCategories = async () => {
    try {
      const res = await api("/marketplace/categories?type=product");
      if (res.status === 200) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activePincode) params.append("pincode", activePincode);
      if (searchQuery) params.append("search", searchQuery);
      if (selectedCategories.length > 0) params.append("category_id", selectedCategories.join(","));
      if (minPrice) params.append("min_price", minPrice);
      if (maxPrice) params.append("max_price", maxPrice);
      if (sort) params.append("sort", sort);

      const res = await api(`/marketplace/products?${params.toString()}`);
      if (res.status === 200) {
        setProducts(res.data.data || res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActivePincode(pincode);

    // Update URL without full reload
    const params = new URLSearchParams(searchParams.toString());
    if (pincode) params.set('pincode', pincode);
    else params.delete('pincode');

    if (searchQuery) params.set('search', searchQuery);
    else params.delete('search');

    router.push(`/products?${params.toString()}`);
    fetchProducts();
  };

  const clearLocation = () => {
    setPincode("");
    setActivePincode("");
    setResolvedCity("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete('pincode');
    router.push(`/products?${params.toString()}`);
  };

  const toggleCategory = (id: number) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

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
              <h1 style={{ fontSize: "2.5rem", fontWeight: 700, margin: "0 0 8px 0", color: "white" }}>Find what you need.</h1>
              <p style={{ fontSize: "1.125rem", color: "rgba(255,255,255,0.8)", margin: 0 }}>Search premium products available for delivery in your area.</p>
            </div>
            <Link href="/user/products" style={{ 
              display: "flex", alignItems: "center", gap: "8px",
              padding: "12px 24px", backgroundColor: "white", color: "var(--brand-600)", 
              borderRadius: "100px", fontSize: "1rem", fontWeight: 600, 
              textDecoration: "none", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              transition: "transform 0.2s"
            }}>
              + Add Product
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
                placeholder="Search products, brands, and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                    Delivering to {resolvedCity} DISTRICT
                  </span>
                )}
                <div style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter Pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\\D/g, ""))}
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
            {categories.length === 0 ? (
              <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>Loading categories...</p>
            ) : (
              <ul className="sidebar-mobile-scroll" style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                {categories.map(cat => {
                  const isSelected = selectedCategories.includes(cat.id);
                  return (
                    <li key={cat.id}>
                      <button 
                        onClick={() => toggleCategory(cat.id)}
                        style={{ 
                          padding: "8px 20px", 
                          borderRadius: "100px", 
                          border: isSelected ? "1px solid var(--brand-600)" : "1px solid var(--border-light)", 
                          backgroundColor: isSelected ? "var(--brand-50)" : "white",
                          color: isSelected ? "var(--brand-700)" : "var(--text-secondary)",
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
                  );
                })}
              </ul>
            )}
          </div>
          <div className="hide-mobile">
            <a style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }} onClick={() => setShowFilterByRange(!showFilterByRange)}>
              {showFilterByRange ? "Hide Filter by Range" : "Show Filter by Range"}
              {showFilterByRange ? (<b><ChevronUp size={18} /></b>) : (<b><ChevronDown size={18} /></b>)}
            </a>
          </div>
          <div className="hide-mobile" style={{ display: showFilterByRange ? 'block' : 'none' }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "16px" }}>Price Range</h3>
            <div className="" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                style={{ width: "100%", padding: "8px", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)", fontSize: "0.875rem" }}
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                style={{ width: "100%", padding: "8px", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)", fontSize: "0.875rem" }}
              />
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div>
          <div className="flex-wrap-mobile" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", gap: "16px" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600 }}>
              {searchQuery && <span>Results for "{searchQuery}" </span>}
              {!searchQuery && <span>All Products </span>}
              {activePincode && <span style={{ color: "var(--text-muted)", fontSize: "1rem" }}>in {resolvedCity || activePincode}</span>}
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>Sort by:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                style={{ padding: "8px 12px", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", backgroundColor: "white", fontSize: "0.875rem", outline: "none" }}
              >
                <option value="latest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "100px 0" }}>
              <div className="spinner" style={{ width: "40px", height: "40px", border: "3px solid var(--border-light)", borderTopColor: "var(--brand-600)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            </div>
          ) : products.length === 0 ? (
            <div style={{ padding: "60px", textAlign: "center", backgroundColor: "white", borderRadius: "var(--radius-xl)", border: "1px dashed var(--border-light)" }}>
              <div style={{ width: "64px", height: "64px", backgroundColor: "var(--surface-2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <Search size={24} color="var(--text-muted)" />
              </div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "8px" }}>No products found</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "1rem", maxWidth: "400px", margin: "0 auto" }}>
                {activePincode
                  ? "We couldn't find any products matching your search in this location."
                  : "No products available matching your filters."}
              </p>
              {(activePincode || searchQuery) && (
                <button
                  onClick={() => { clearLocation(); setSearchQuery(""); }}
                  className="btn-secondary"
                  style={{ marginTop: "24px" }}
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="product-grid">
              {products.map((product) => (
                <Link href={`/products/${product.slug}`} key={product.id} style={{ textDecoration: "none", color: "inherit" }}>
                  <div className="product-card">
                    <div
                      className="product-image-container"
                      style={{ backgroundImage: `url(${getImageUrl(product.images?.[0])})`, position: "relative" }}
                    >
                      {!product.images?.[0] && <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No Image</div>}
                      
                      {/* Like Button */}
                      <button
                        onClick={(e) => toggleLike(e, product.id)}
                        style={{
                          position: "absolute",
                          top: "12px",
                          right: "12px",
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          backgroundColor: "rgba(255, 255, 255, 0.9)",
                          backdropFilter: "blur(4px)",
                          border: "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          zIndex: 10,
                          transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
                        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                        onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.9)"}
                        onMouseUp={(e) => e.currentTarget.style.transform = "scale(1.1)"}
                      >
                        <Heart 
                          size={20} 
                          color={likedProductIds.includes(product.id) ? "var(--error)" : "var(--text-muted)"}
                          fill={likedProductIds.includes(product.id) ? "var(--error)" : "none"}
                        />
                      </button>
                    </div>
                    <div className="product-content">
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>
                        {product.category?.name || "Product"}
                      </div>
                      <h3 className="product-title" style={{ fontWeight: 600, marginBottom: "12px", lineHeight: 1.4 }}>
                        {product.title}
                      </h3>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                        <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)" }}>₹{product.price}</span>
                        {product.compare_price && (
                          <span style={{ fontSize: "0.875rem", color: "var(--text-muted)", textDecoration: "line-through" }}>₹{product.compare_price}</span>
                        )}
                      </div>
                      <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: "1px solid var(--border-light)" }}>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            if (product.vendor?.id) {
                              const storeName = product.vendor?.vendor_profile?.store_name || product.vendor?.name || 'store';
                              const slug = storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                              window.location.href = `/store/${product.vendor.id}/${slug}`;
                            }
                          }}
                          style={{
                            fontSize: "0.813rem",
                            color: "var(--text-secondary)",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "4px 8px",
                            margin: "-4px -8px",
                            borderRadius: "var(--radius-sm)",
                            transition: "background-color 0.2s"
                          }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--surface-2)"}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                        >
                          {product.vendor?.vendor_profile?.store_logo ? (
                            <img src={getImageUrl(product.vendor.vendor_profile.store_logo)} alt="logo" style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover" }} />
                          ) : (
                            <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "var(--brand-100)", color: "var(--brand-700)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600 }}>
                              {(product.vendor?.vendor_profile?.store_name || product.vendor?.name || "V").charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                            {product.vendor?.vendor_profile?.store_name || product.vendor?.name}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
