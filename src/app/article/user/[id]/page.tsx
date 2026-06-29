"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";

import { Heart, MessageSquare, Clock, ArrowLeft, User as UserIcon } from "lucide-react";
import { useToast } from "@/components/ui/ToastContext";

function UserProfileContent() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  
  const [profile, setProfile] = useState<any>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchUserProfile(params.id as string);
    }
  }, [params.id]);

  const fetchUserProfile = async (id: string) => {
    try {
      setLoading(true);
      const res = await api(`/users/${id}/articles-profile`);
      if (res.status === 200) {
        setProfile(res.data.user);
        setArticles(res.data.articles.data || res.data.articles);
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load user profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (e: React.MouseEvent, articleId: number, index: number) => {
    e.preventDefault(); // Prevent navigating to article
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) {
        toast.error("Please login to like articles");
        return router.push('/login');
      }

      const res = await api(`/article/${articleId}/like`, { method: "POST", token });
      if (res.status === 200) {
        const newArticles = [...articles];
        newArticles[index].likes_count = res.data.likes;
        newArticles[index].is_liked = res.data.liked;
        setArticles(newArticles);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to like article");
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "100px 0" }}>
        <div className="spinner" style={{ width: "40px", height: "40px", border: "3px solid var(--border-light)", borderTopColor: "var(--brand-600)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ padding: "100px 20px", textAlign: "center" }}>
        <h2>User not found</h2>
        <Link href="/article" className="btn-secondary" style={{ marginTop: "20px", display: "inline-block" }}>Back to Articles</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--surface-1)" }}>
      {/* Profile Header */}
      <div style={{ backgroundColor: "var(--surface-0)", borderBottom: "1px solid var(--border-light)", padding: "48px 24px" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <Link href="/article" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)", textDecoration: "none", marginBottom: "32px", fontSize: "0.875rem", fontWeight: 500 }}>
            <ArrowLeft size={16} /> Back to Articles
          </Link>
          
          <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
            {profile.avatar ? (
              <img 
                src={`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}${profile.avatar}`} 
                alt={profile.name} 
                style={{ width: "96px", height: "96px", borderRadius: "50%", objectFit: "cover", border: "4px solid var(--surface-2)" }}
              />
            ) : (
              <div style={{ width: "96px", height: "96px", borderRadius: "50%", backgroundColor: "var(--brand-100)", color: "var(--brand-700)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", fontWeight: 700, border: "4px solid var(--surface-2)" }}>
                {profile.name.charAt(0).toUpperCase()}
              </div>
            )}
            
            <div>
              <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: "0 0 8px 0", color: "var(--text-primary)" }}>{profile.name}</h1>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <UserIcon size={16} /> Member since {new Date(profile.created_at).getFullYear()}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <MessageSquare size={16} /> {articles.length} Articles
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User's Articles */}
      <div style={{ maxWidth: "800px", margin: "48px auto", padding: "0 24px" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "24px", color: "var(--text-primary)" }}>Published Articles</h2>
        
        {articles.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center", backgroundColor: "white", borderRadius: "var(--radius-xl)", border: "1px dashed var(--border-light)" }}>
            <p style={{ color: "var(--text-secondary)" }}>This user hasn't published any articles yet.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {articles.map((article, index) => (
              <Link href={`/article/${article.id}`} key={article.id} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                <article style={{ 
                  backgroundColor: "white", 
                  borderRadius: "var(--radius-xl)", 
                  padding: "24px", 
                  border: "1px solid var(--border-light)",
                  boxShadow: "var(--shadow-sm)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "var(--shadow-md)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "var(--shadow-sm)";
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "var(--text-primary)", flex: 1, paddingRight: "16px" }}>
                      {article.title}
                    </h2>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap" }}>
                      <Clock size={14} /> {new Date(article.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <p style={{ color: "var(--text-secondary)", fontSize: "0.938rem", lineHeight: 1.6, marginBottom: "24px", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {article.content}
                  </p>

                  {article.images && article.images.length > 0 && (
                    <div style={{ display: "flex", gap: "12px", overflowX: "auto", marginBottom: "24px", paddingBottom: "8px" }}>
                      {article.images.map((img: string, i: number) => (
                        <img 
                          key={i} 
                          src={`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}${img}`} 
                          alt="Article attachment" 
                          style={{ height: "120px", width: "160px", objectFit: "cover", borderRadius: "var(--radius-md)", border: "1px solid var(--border-light)" }}
                        />
                      ))}
                    </div>
                  )}

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "16px", borderTop: "1px solid var(--border-light)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {profile.avatar ? (
                        <img src={`http://localhost:8000${profile.avatar}`} alt="author" style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "var(--brand-100)", color: "var(--brand-700)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 600 }}>
                          {profile.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--text-primary)" }}>{profile.name}</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <button 
                        onClick={(e) => handleLike(e, article.id, index)}
                        style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: article.is_liked ? "var(--danger)" : "var(--text-muted)", cursor: "pointer", transition: "color 0.2s" }}
                      >
                        <Heart size={18} fill={article.is_liked ? "currentColor" : "none"} />
                        <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>{article.likes_count || article.likes?.length || 0}</span>
                      </button>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)" }}>
                        <MessageSquare size={18} />
                        <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>Reply</span>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function UserProfilePage() {
  return (
    <Suspense fallback={<div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>}>
      <UserProfileContent />
    </Suspense>
  );
}
