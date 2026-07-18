"use client";
import { getImageUrl } from "@/lib/utils";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/ToastContext";

export default function ArticleDetail() {
  const { id } = useParams();
  const router = useRouter();
  const toast = useToast();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [commentBody, setCommentBody] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [replyTo, setReplyTo] = useState<number | null>(null);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("auth-token");
    if (token) {
      setIsLoggedIn(true);
      fetchUser(token);
    }
    fetchArticle();
  }, [id]);

  const fetchUser = async (token: string) => {
    try {
      const res = await api("/auth/me", { token });
      if (res.status === 200) {
        setCurrentUser(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchArticle = async () => {
    try {
      const res = await api(`/articles/${id}`);
      if (res.status === 200) {
        setArticle(res.data);
      } else {
        toast.error("Article not found");
        router.push("/article");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading article");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (type: 'article' | 'comment', itemId: number) => {
    const token = localStorage.getItem("auth-token");
    if (!token) {
      toast.error("Please login to like");
      return;
    }
    try {
      const res = await api(`/${type}/${itemId}/like`, { method: "POST", token });
      if (res.status === 200) {
        fetchArticle();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent, parentId: number | null = null) => {
    e.preventDefault();
    const token = localStorage.getItem("auth-token");
    
    if (!token) {
      toast.error("You must be logged in to comment");
      return;
    }

    if (!commentBody.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await api(`/articles/${id}/comments`, {
        method: "POST",
        token,
        body: { body: commentBody, parent_id: parentId },
      });

      if (res.status === 201) {
        toast.success("Comment added!");
        setCommentBody("");
        setReplyTo(null);
        fetchArticle(); // refresh to show new comment
      } else {
        toast.error("Failed to add comment");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    } finally {
      setSubmittingComment(false);
    }
  };

  const nextImage = () => {
    if (article?.images && article.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % article.images.length);
    }
  };

  const prevImage = () => {
    if (article?.images && article.images.length > 0) {
      setCurrentImageIndex((prev) => (prev === 0 ? article.images.length - 1 : prev - 1));
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "100px 0", minHeight: "60vh" }}>
        <div className="spinner" style={{ width: "40px", height: "40px", border: "3px solid var(--border-light)", borderTopColor: "var(--brand-600)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  if (!article) return null;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "32px 16px", width: "100%" }}>
      <Link href="/article" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--text-muted)", textDecoration: "none", marginBottom: "24px", fontWeight: 500 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        Back to Community
      </Link>

      <div style={{ backgroundColor: "white", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-light)", overflow: "hidden", marginBottom: "32px" }}>
        {article.images && article.images.length > 0 && (
          <div style={{ position: "relative", width: "100%", height: "400px", overflow: "hidden", backgroundColor: "#000" }}>
            <img 
              src={getImageUrl(article.images[currentImageIndex])} 
              alt={article.title} 
              style={{ width: "100%", height: "100%", objectFit: "contain", transition: "opacity 0.3s ease-in-out" }} 
            />
            
            {article.images.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.8)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <button 
                  onClick={nextImage}
                  style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.8)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
                
                <div style={{ position: "absolute", bottom: "16px", left: "0", right: "0", display: "flex", justifyContent: "center", gap: "8px" }}>
                  {article.images.map((_: any, idx: number) => (
                    <button 
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      style={{ 
                        width: "8px", height: "8px", borderRadius: "50%", border: "none", padding: 0,
                        backgroundColor: currentImageIndex === idx ? "white" : "rgba(255,255,255,0.5)",
                        cursor: "pointer", transition: "background-color 0.2s" 
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
        
        <div style={{ padding: "32px" }}>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
            {article.tags && article.tags.split(',').map((tag: string, i: number) => (
              <span key={i} style={{ backgroundColor: "var(--brand-50)", color: "var(--brand-700)", padding: "4px 10px", borderRadius: "100px", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase" }}>
                {tag.trim()}
              </span>
            ))}
          </div>

          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, margin: "0 0 24px 0", color: "var(--text-primary)", lineHeight: 1.2 }}>
            {article.title}
          </h1>

          <Link href={article.user?.id ? `/article/user/${article.user.id}` : "#"} style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px", paddingBottom: "24px", borderBottom: "1px solid var(--border-light)", textDecoration: "none" }} onClick={(e) => { if (!article.user?.id) e.preventDefault(); }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "var(--brand-100)", color: "var(--brand-700)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1.25rem" }}>
              {article.user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)" }}>{article.user?.name || "Unknown Author"}</p>
              <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-muted)" }}>{new Date(article.created_at).toLocaleDateString()} • {Math.ceil(article.content.length / 1000)} min read</p>
            </div>
          </Link>

          <div 
            style={{ fontSize: "1.125rem", lineHeight: 1.8, color: "var(--text-secondary)", whiteSpace: "pre-wrap" }}
            dangerouslySetInnerHTML={{ __html: article.content }} 
          />

          <div style={{ display: "flex", alignItems: "center", gap: "24px", marginTop: "40px", paddingTop: "24px", borderTop: "1px solid var(--border-light)" }}>
            <button 
              onClick={() => handleLike('article', article.id)}
              style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", color: article.likes?.some((l: any) => l.user_id === currentUser?.id) ? "var(--danger)" : "var(--text-secondary)", cursor: "pointer", fontSize: "1rem", fontWeight: 500 }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill={article.likes?.some((l: any) => l.user_id === currentUser?.id) ? "var(--danger)" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              {article.likes?.length || 0} Likes
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)", fontSize: "1rem", fontWeight: 500 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              {article.comments?.length || 0} Comments
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div style={{ padding: "24px", backgroundColor: "white", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-light)" }}>
        <h3 style={{ margin: "0 0 24px 0", fontSize: "1.25rem", color: "var(--text-primary)", fontWeight: 700 }}>Discussion</h3>
        
        {isLoggedIn ? (
          <form onSubmit={(e) => handleCommentSubmit(e)} style={{ display: "flex", gap: "16px", marginBottom: "32px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "var(--brand-100)", color: "var(--brand-700)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, flexShrink: 0 }}>
              {currentUser?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div style={{ flex: 1 }}>
              <textarea
                className="input-primary"
                placeholder="Add to the discussion..."
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                style={{ width: "100%", minHeight: "80px", resize: "vertical", padding: "12px", marginBottom: "12px" }}
                required
              />
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button type="submit" className="btn-primary" disabled={submittingComment} style={{ padding: "8px 20px" }}>
                  {submittingComment ? "Posting..." : "Post Comment"}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div style={{ padding: "24px", backgroundColor: "var(--bg-muted)", borderRadius: "var(--radius-md)", textAlign: "center", marginBottom: "32px" }}>
            <p style={{ margin: "0 0 16px 0", color: "var(--text-secondary)" }}>Join the discussion by signing in.</p>
            <Link href={`/login?redirect=/article/${article.id}`} className="btn-secondary">
              Sign In to Comment
            </Link>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {article.comments?.filter((c: any) => !c.parent_id).length > 0 ? (
            article.comments
              .filter((c: any) => !c.parent_id)
              .map((comment: any) => (
              <div key={comment.id} style={{ display: "flex", gap: "16px", flexDirection: "column" }}>
                <div style={{ display: "flex", gap: "16px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "var(--bg-muted)", color: "var(--text-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, flexShrink: 0 }}>
                    {comment.user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ backgroundColor: "var(--bg-muted)", padding: "16px", borderRadius: "var(--radius-lg)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <span style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.938rem" }}>{comment.user?.name || "User"}</span>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.813rem" }}>{new Date(comment.created_at).toLocaleDateString()}</span>
                      </div>
                      <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.938rem", lineHeight: 1.5 }}>
                        {comment.body}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "16px", marginTop: "8px", marginLeft: "16px", alignItems: "center" }}>
                      <button onClick={() => handleLike('comment', comment.id)} style={{ display: "flex", alignItems: "center", gap: "4px", background: "none", border: "none", color: comment.likes?.some((l: any) => l.user_id === currentUser?.id) ? "var(--danger)" : "var(--text-muted)", fontSize: "0.813rem", fontWeight: 600, cursor: "pointer", padding: 0 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill={comment.likes?.some((l: any) => l.user_id === currentUser?.id) ? "var(--danger)" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                        {comment.likes?.length || 0}
                      </button>
                      {isLoggedIn && (
                        <button onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.813rem", fontWeight: 600, cursor: "pointer", padding: 0 }}>Reply</button>
                      )}
                    </div>
                  </div>
                </div>

                {replyTo === comment.id && (
                  <form onSubmit={(e) => handleCommentSubmit(e, comment.id)} style={{ marginLeft: "56px", display: "flex", gap: "12px" }}>
                    <input type="text" className="input-primary" style={{ flex: 1, padding: "8px 12px", fontSize: "0.875rem" }} placeholder={`Reply to ${comment.user?.name}...`} value={commentBody} onChange={(e) => setCommentBody(e.target.value)} required />
                    <button type="submit" className="btn-primary" disabled={submittingComment} style={{ padding: "8px 16px", fontSize: "0.875rem" }}>Reply</button>
                  </form>
                )}

                {comment.replies && comment.replies.length > 0 && (
                  <div style={{ marginLeft: "56px", display: "flex", flexDirection: "column", gap: "16px", marginTop: "8px" }}>
                    {comment.replies.map((reply: any) => (
                      <div key={reply.id} style={{ display: "flex", gap: "12px" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "var(--brand-50)", color: "var(--brand-700)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: "0.75rem", flexShrink: 0 }}>
                          {reply.user?.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ backgroundColor: "var(--brand-50)", padding: "12px", borderRadius: "var(--radius-lg)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                              <span style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.875rem" }}>{reply.user?.name || "User"}</span>
                            </div>
                            <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.5 }}>
                              {reply.body}
                            </p>
                          </div>
                          <div style={{ display: "flex", gap: "16px", marginTop: "6px", marginLeft: "12px", alignItems: "center" }}>
                            <button onClick={() => handleLike('comment', reply.id)} style={{ display: "flex", alignItems: "center", gap: "4px", background: "none", border: "none", color: reply.likes?.some((l: any) => l.user_id === currentUser?.id) ? "var(--danger)" : "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", padding: 0 }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill={reply.likes?.some((l: any) => l.user_id === currentUser?.id) ? "var(--danger)" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                              {reply.likes?.length || 0}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p style={{ textAlign: "center", color: "var(--text-muted)", margin: 0 }}>No comments yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
