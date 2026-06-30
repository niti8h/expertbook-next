"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function ArticleList() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const res = await api("/articles");
      if (res.status === 200) {
        setArticles(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching articles:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px 16px", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>Community Posts</h1>
        <Link href="/article/create" className="btn-primary" style={{ padding: "10px 20px", textDecoration: "none", fontWeight: 600 }}>
          Write a Post
        </Link>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
          <div className="spinner" style={{ width: "40px", height: "40px", border: "3px solid var(--border-light)", borderTopColor: "var(--brand-600)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : articles.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
          {articles.map((article) => (
            <div key={article.id} className="hover-raise" style={{ 
              backgroundColor: "white", 
              borderRadius: "var(--radius-xl)", 
              overflow: "hidden", 
              border: "1px solid var(--border-light)",
              display: "flex",
              flexDirection: "column",
              height: "100%"
            }}>
              {article.images && article.images.length > 0 && (
                <div style={{ height: "200px", width: "100%", overflow: "hidden" }}>
                  <img src={`${process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.expertbook.in"}${article.images[0]}`} alt={article.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}
              <div style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column" }}>
                <Link href={article.user?.id ? `/article/user/${article.user.id}` : "#"} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", textDecoration: "none" }} onClick={(e) => { if (!article.user?.id) e.preventDefault(); }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "var(--brand-100)", color: "var(--brand-700)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: "0.875rem" }}>
                    {article.user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" }}>{article.user?.name || "Unknown Author"}</p>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)" }}>{new Date(article.created_at).toLocaleDateString()}</p>
                  </div>
                </Link>
                
                <h3 style={{ margin: "0 0 12px 0", fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.4 }}>
                  <Link href={`/article/${article.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                    {article.title}
                  </Link>
                </h3>
                
                <p style={{ margin: "0 0 20px 0", color: "var(--text-secondary)", fontSize: "0.938rem", lineHeight: 1.6, flex: 1 }}>
                  {article.content.substring(0, 120)}...
                </p>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-light)", paddingTop: "16px", marginTop: "auto" }}>
                  <div style={{ display: "flex", gap: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.875rem" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                      <span>{article.likes?.length || 0}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.875rem" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                      <span>{article.comments?.length || 0}</span>
                    </div>
                  </div>
                  <Link href={`/article/${article.id}`} style={{ color: "var(--brand-600)", fontWeight: 600, fontSize: "0.875rem", textDecoration: "none" }}>
                    Read More
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "64px 20px", backgroundColor: "white", borderRadius: "var(--radius-xl)", border: "1px dashed var(--border-light)" }}>
          <div style={{ width: "64px", height: "64px", backgroundColor: "var(--bg-muted)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </div>
          <h2 style={{ margin: "0 0 8px 0", fontSize: "1.25rem", color: "var(--text-primary)" }}>No posts yet</h2>
          <p style={{ margin: "0 0 24px 0", color: "var(--text-secondary)" }}>Be the first to share something with the community.</p>
          <Link href="/article/create" className="btn-primary" style={{ display: "inline-block", padding: "10px 24px", textDecoration: "none", fontWeight: 600 }}>
            Start Writing
          </Link>
        </div>
      )}
    </div>
  );
}
