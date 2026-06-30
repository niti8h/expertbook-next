"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function ProfessionalsPage() {
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchProfessionals();
  }, [filter]);

  const fetchProfessionals = async () => {
    setLoading(true);
    try {
      const query = filter !== "all" ? `?type=${filter}` : "";
      const res = await api(`/professionals${query}`);
      if (res.status === 200) {
        setProfessionals(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: "40px 20px", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>
          Our Professionals
        </h1>
        <p style={{ fontSize: "1.125rem", color: "var(--text-secondary)", maxWidth: "600px", margin: "0 auto" }}>
          Discover verified sellers and service providers. Explore their portfolios and connect with the best.
        </p>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginBottom: "40px" }}>
        {["all", "vendor", "provider"].map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            style={{
              padding: "10px 24px",
              borderRadius: "100px",
              border: `1px solid ${filter === type ? "var(--brand-600)" : "var(--border-light)"}`,
              backgroundColor: filter === type ? "var(--brand-50)" : "white",
              color: filter === type ? "var(--brand-600)" : "var(--text-primary)",
              fontWeight: 600,
              cursor: "pointer",
              textTransform: "capitalize",
              transition: "all 0.2s"
            }}
          >
            {type === "all" ? "All" : type === "vendor" ? "Sellers" : "Service Providers"}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>Loading...</div>
      ) : professionals.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>No professionals found.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
          {professionals.map(pro => (
            <div key={pro.id} style={{
              backgroundColor: "white",
              borderRadius: "16px",
              border: "1px solid var(--border-light)",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              transition: "transform 0.2s, box-shadow 0.2s",
              cursor: "pointer",
              boxShadow: "0 2px 10px rgba(0,0,0,0.02)"
            }}
            onClick={() => window.location.href = `/u/${pro.id}`}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{
                  width: "60px", height: "60px", borderRadius: "50%",
                  backgroundColor: "var(--brand-100)", color: "var(--brand-600)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.5rem", fontWeight: 700
                }}>
                  {pro.name?.charAt(0)}
                </div>
                <div>
                  <h3 style={{ margin: "0 0 4px 0", fontSize: "1.125rem", color: "var(--text-primary)" }}>{pro.name}</h3>
                  <span style={{
                    fontSize: "0.75rem", fontWeight: 600, padding: "2px 8px", borderRadius: "100px",
                    backgroundColor: pro.role?.slug === "vendor" ? "rgba(34, 197, 94, 0.1)" : "rgba(14, 165, 233, 0.1)",
                    color: pro.role?.slug === "vendor" ? "rgb(34, 197, 94)" : "rgb(14, 165, 233)",
                    textTransform: "uppercase"
                  }}>
                    {pro.role?.name}
                  </span>
                </div>
              </div>
              
              <Link href={`/u/${pro.id}`} style={{
                display: "block",
                textAlign: "center",
                padding: "12px",
                backgroundColor: "var(--surface-1)",
                color: "var(--text-primary)",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: 500,
                marginTop: "auto"
              }}>
                View Profile
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
