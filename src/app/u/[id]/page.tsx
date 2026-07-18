"use client";
import { getImageUrl } from "@/lib/utils";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import Link from "next/link";

export default function PublicProfilePage() {
  const params = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("portfolio"); // portfolio | posts

  useEffect(() => {
    if (params.id) {
      fetchProfile(params.id as string);
    }
  }, [params.id]);

  const fetchProfile = async (id: string) => {
    try {
      const res = await api(`/professionals/${id}`);
      if (res.status === 200) {
        setProfile(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: "center", padding: "100px", color: "var(--text-muted)" }}>Loading profile...</div>;
  }

  if (!profile || !profile.user) {
    return <div style={{ textAlign: "center", padding: "100px", color: "var(--text-muted)" }}>Profile not found.</div>;
  }

  const { user, portfolios, articles } = profile;

  return (
    <main style={{ padding: "40px 20px", maxWidth: "1000px", margin: "0 auto", width: "100%" }}>
      {/* Profile Header */}
      <div style={{
        backgroundColor: "white", borderRadius: "24px", padding: "40px",
        border: "1px solid var(--border-light)", display: "flex", alignItems: "center", gap: "24px",
        marginBottom: "40px", flexWrap: "wrap"
      }}>
        <div style={{
          width: "100px", height: "100px", borderRadius: "50%",
          backgroundColor: "var(--brand-100)", color: "var(--brand-600)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "2.5rem", fontWeight: 700
        }}>
          {user.name?.charAt(0)}
        </div>
        <div>
          <h1 style={{ margin: "0 0 8px 0", fontSize: "2rem", fontWeight: 700, color: "var(--text-primary)" }}>
            {user.name}
          </h1>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <span style={{
              fontSize: "0.75rem", fontWeight: 700, padding: "4px 12px", borderRadius: "100px",
              backgroundColor: user.role?.slug === "vendor" ? "rgba(34, 197, 94, 0.1)" : "rgba(14, 165, 233, 0.1)",
              color: user.role?.slug === "vendor" ? "rgb(34, 197, 94)" : "rgb(14, 165, 233)",
              textTransform: "uppercase", letterSpacing: "0.05em"
            }}>
              {user.role?.name}
            </span>
            <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
              Joined {new Date(user.created_at).getFullYear()}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border-light)", marginBottom: "32px" }}>
        <button
          onClick={() => setActiveTab("portfolio")}
          style={{
            padding: "16px 32px", fontSize: "1rem", fontWeight: 600,
            color: activeTab === "portfolio" ? "var(--brand-600)" : "var(--text-secondary)",
            borderBottom: activeTab === "portfolio" ? "2px solid var(--brand-600)" : "2px solid transparent",
            backgroundColor: "transparent", borderTop: "none", borderLeft: "none", borderRight: "none",
            cursor: "pointer", transition: "all 0.2s"
          }}
        >
          Portfolio ({portfolios?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("posts")}
          style={{
            padding: "16px 32px", fontSize: "1rem", fontWeight: 600,
            color: activeTab === "posts" ? "var(--brand-600)" : "var(--text-secondary)",
            borderBottom: activeTab === "posts" ? "2px solid var(--brand-600)" : "2px solid transparent",
            backgroundColor: "transparent", borderTop: "none", borderLeft: "none", borderRight: "none",
            cursor: "pointer", transition: "all 0.2s"
          }}
        >
          Community Posts ({articles?.length || 0})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "portfolio" && (
        <div>
          {portfolios?.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", backgroundColor: "var(--surface-0)", borderRadius: "16px" }}>
              No portfolio items available.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
              {portfolios.map((item: any) => (
                <div key={item.id} style={{
                  backgroundColor: "white", borderRadius: "16px", border: "1px solid var(--border-light)", overflow: "hidden"
                }}>
                  {item.media_url ? (
                    <img src={getImageUrl(item.media_url)} alt={item.title} style={{ width: "100%", height: "200px", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "200px", backgroundColor: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                      No Media
                    </div>
                  )}
                  <div style={{ padding: "20px" }}>
                    <h3 style={{ margin: "0 0 8px 0", fontSize: "1.125rem", color: "var(--text-primary)" }}>{item.title}</h3>
                    <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-secondary)", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "posts" && (
        <div>
          {articles?.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", backgroundColor: "var(--surface-0)", borderRadius: "16px" }}>
              No posts available.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {articles.map((article: any) => (
                <div key={article.id} style={{
                  backgroundColor: "white", borderRadius: "16px", border: "1px solid var(--border-light)", padding: "24px"
                }}>
                  <h3 style={{ margin: "0 0 12px 0", fontSize: "1.25rem", color: "var(--text-primary)" }}>{article.title}</h3>
                  <div style={{ color: "var(--text-secondary)", fontSize: "0.875rem", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }} dangerouslySetInnerHTML={{ __html: article.content }} />
                  <div style={{ marginTop: "16px", fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
                    {new Date(article.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
