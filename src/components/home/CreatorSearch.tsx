"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreatorSearch() {
  const [searchPhone, setSearchPhone] = useState("");
  const router = useRouter();

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", width: "100%" }}>
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          if (searchPhone.trim()) {
            router.push(`/profile/${searchPhone.trim()}`);
          }
        }}
        style={{ 
          display: "flex", 
          alignItems: "center", 
          background: "white", 
          padding: "8px", 
          borderRadius: "100px", 
          border: "1px solid var(--border-light)",
          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01)"
        }}
      >
        <div style={{ padding: "0 16px", color: "var(--text-muted)" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </div>
        <input 
          type="text" 
          placeholder="Find a creator by mobile number..." 
          value={searchPhone}
          onChange={(e) => setSearchPhone(e.target.value)}
          style={{ flex: 1, border: "none", outline: "none", fontSize: "1rem", padding: "12px 0", color: "var(--text-primary)", backgroundColor: "transparent" }}
        />
        <button type="submit" className="btn-primary" style={{ padding: "12px 24px", borderRadius: "100px", border: "none", fontSize: "0.938rem", fontWeight: 600, cursor: "pointer" }}>
          Find Profile
        </button>
      </form>
    </div>
  );
}
