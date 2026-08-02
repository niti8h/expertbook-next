const fs = require('fs');
let code = fs.readFileSync('src/app/user/services/page.tsx', 'utf-8');

// 1. formData state
code = code.replace(
  /    lat: "",\n    lng: "",\n    radius_km: "10"\n  \}\);/,
  '    pincode_mode: "all",\n    pincodes: ""\n  });'
);

// 2. remove fetchLocation
code = code.replace(/  const fetchLocation = async \(\) => \{[\s\S]*?fallbackToIP\(\);\n    \}\n  \};\n/, '');

// 3. resetForm
code = code.replace(
  /lat: "", lng: "", radius_km: "10"/,
  'pincode_mode: "all", pincodes: ""'
);

// 4. handleEdit
code = code.replace(
  /      lat: "", \n      lng: "",\n      radius_km: "10",/,
  '      pincode_mode: "all",\n      pincodes: "",'
);

// 5. handleSubmit payload
code = code.replace(
  /      if \(!editingId\) \{\n        if \(formData\.lat\) payload\.append\("lat", formData\.lat\);\n        if \(formData\.lng\) payload\.append\("lng", formData\.lng\);\n        if \(formData\.radius_km\) payload\.append\("radius_km", formData\.radius_km\);\n      \}/,
  `      if (!editingId) {
        payload.append("pincode_mode", formData.pincode_mode);
        if (formData.pincodes) payload.append("pincodes", formData.pincodes);
      }`
);

// 6. UI Location Settings
const locationUI = `                {/* Location Settings */}
                {!editingId && (
                  <div>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#1e293b", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <MapPin size={20} color="#64748b" /> Service Area (Pincodes)
                    </h3>
                    <div style={{ backgroundColor: "#f8fafc", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
                        <div>
                          <label style={{ display: "block", marginBottom: "8px", fontWeight: 500, color: "#334155" }}>Pincode Mode</label>
                          <select value={formData.pincode_mode} onChange={(e) => setFormData({...formData, pincode_mode: e.target.value})}
                            style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "1rem", outline: "none", backgroundColor: "white" }}>
                            <option value="all">Anywhere (All Pincodes)</option>
                            <option value="whitelist">Only specific pincodes</option>
                            <option value="blacklist">Anywhere EXCEPT specific pincodes</option>
                          </select>
                        </div>
                        {formData.pincode_mode !== "all" && (
                          <div>
                            <label style={{ display: "block", marginBottom: "8px", fontWeight: 500, color: "#334155" }}>Pincodes (Comma separated)</label>
                            <input type="text" placeholder="e.g. 110001, 110002" value={formData.pincodes} onChange={(e) => setFormData({...formData, pincodes: e.target.value})}
                              style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "1rem", outline: "none" }} />
                            <p style={{ margin: "8px 0 0", fontSize: "0.875rem", color: "#64748b" }}>Separate multiple pincodes with a comma.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}`;

code = code.replace(
  /                \{\/\* Location Settings \*\/\}[\s\S]*?<\/div>\n                \)\}/,
  locationUI
);

fs.writeFileSync('src/app/user/services/page.tsx', code);
console.log("Updated user services page to use pincodes instead of lat/lng/radius_km");
