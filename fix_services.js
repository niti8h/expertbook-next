const fs = require('fs');

const productsCode = fs.readFileSync('src/app/products/page.tsx', 'utf-8');
const servicesCode = fs.readFileSync('src/app/services/page.tsx', 'utf-8');

// 1. Add useRef and MapPin, Search, ArrowRight imports
let newServices = servicesCode.replace(
  'import { useState, useEffect, Suspense } from "react";',
  'import { useState, useEffect, Suspense, useRef } from "react";'
);
newServices = newServices.replace(
  'import { useToast } from "@/components/ui/ToastContext";',
  'import { useToast } from "@/components/ui/ToastContext";\nimport { ChevronDown, ChevronUp, MapPin, Search, ArrowRight, Heart } from "lucide-react";'
);

// 2. Replace state variables
const stateReplacement = `  const [pincode, setPincode] = useState(searchParams.get("pincode") || "");
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
  }, []);`;

newServices = newServices.replace(
  /  \/\/ Location state[\s\S]*?lat && lng \? "success" : "idle"\n  \);/,
  stateReplacement
);

// 3. Replace useEffect and fetchServices dependencies
newServices = newServices.replace(
  /  useEffect\(\(\) => \{\n    fetchServices\(lat, lng, selectedCategory, searchTerm\);\n  \}, \[lat, lng, selectedCategory, searchTerm\]\);/,
  `  useEffect(() => {
    fetchServices(activePincode, selectedCategory, searchTerm);
  }, [activePincode, selectedCategory, searchTerm]);`
);

// 4. Update fetchServices signature
newServices = newServices.replace(
  /const fetchServices = async \(latitude: string, longitude: string, categoryId: string, search: string\) => \{/,
  `const fetchServices = async (pin: string, categoryId: string, search: string) => {`
);
newServices = newServices.replace(
  /      if \(latitude && longitude\) \{\n        url \+= \`lat=\$\{latitude\}&lng=\$\{longitude\}&\`;\n      \}/,
  `      if (pin) {
        url += \`pincode=\${pin}&\`;
      }`
);

// 5. Replace requestLocation and clearLocation with resolvePincode, etc
const logicReplacement = `  useEffect(() => {
    if (pincode.length === 6 && /^\\d+$/.test(pincode)) {
      resolvePincode(pincode);
    } else {
      setLocationSuggestions([]);
      setShowLocationDropdown(false);
    }
  }, [pincode]);

  const resolvePincode = async (pin: string, silent = false) => {
    if (!silent) setIsResolvingLocation(true);
    try {
      const res = await fetch(\`https://api.postalpincode.in/pincode/\${pin}\`);
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
    router.push(\`/services?\${params.toString()}\`);
  };`;

newServices = newServices.replace(
  /  const requestLocation = \(\) => \{[\s\S]*?router\.push\('\/services'\);\n  \};/,
  logicReplacement
);

// 6. Update handleSearchSubmit
newServices = newServices.replace(
  /  const handleSearchSubmit = \(e: React\.FormEvent\) => \{[\s\S]*?router\.push\(\`\/services\?\$\{params\.toString\(\)\}\`\);\n  \};/,
  `  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setActivePincode(pincode);
    const params = new URLSearchParams(searchParams.toString());
    if (searchInput.trim()) params.set('search', searchInput.trim());
    else params.delete('search');
    
    if (pincode) params.set('pincode', pincode);
    else params.delete('pincode');
    
    router.push(\`/services?\${params.toString()}\`);
  };`
);

// 7. Replace the Location Banner UI with Advanced Hero Search Bar
const heroBanner = `      {/* Advanced Hero Search Bar */}
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
      </div>`;

newServices = newServices.replace(
  /      \{\/\* Location Banner \*\/\}[\s\S]*?<\/div>\n      <\/div>/,
  heroBanner
);

// 8. Remove the internal search bar logic inside Services Grid since we moved it to Hero
newServices = newServices.replace(
  /              <form onSubmit=\{handleSearchSubmit\}[\s\S]*?<\/form>\n/,
  ""
);

// 9. Fix image URL replacement
newServices = newServices.replace(
  /url\(\$\{process\.env\.NEXT_PUBLIC_BACKEND_URL \|\| "https:\/\/api\.expertbook\.in"\}\$\{service\.images\?\.\[0\] \|\| ''\}\)/g,
  "url(${getImageUrl(service.images?.[0])})"
);

// Fix title fallback
newServices = newServices.replace(
  /\{locationStatus === "success" \? "Services near you" : "All Services"\}/,
  `{activePincode ? "Services in " + (resolvedCity || activePincode) : (searchTerm ? "Results for '" + searchTerm + "'" : "All Services")}`
);

fs.writeFileSync('src/app/services/page.tsx', newServices);
console.log("Services page updated successfully.");
