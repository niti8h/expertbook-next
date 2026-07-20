"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/ToastContext";
import Link from "next/link";

export default function EditArticle() {
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");

  useEffect(() => {
    if (params.id) fetchArticle();
  }, [params.id]);

  const fetchArticle = async () => {
    try {
      const res = await api(`/articles/${params.id}`);
      if (res.status === 200) {
        setTitle(res.data.title || "");
        setContent(res.data.content || "");
        setTags(res.data.tags || "");
      } else {
        toast.error("Failed to load article");
        router.push("/article");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load article");
      router.push("/article");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("auth-token");
    
    if (!token) {
      toast.error("You must be logged in to edit an article");
      return;
    }

    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    setSaving(true);
    
    try {
      const res = await api(`/articles/${params.id}`, {
        method: "PUT",
        token,
        body: JSON.stringify({
          title,
          content,
          tags,
        }),
      });

      if (res.status === 200) {
        toast.success("Article updated successfully!");
        router.push(`/article/${params.id}`);
      } else {
        toast.error(res.data?.message || "Failed to update article");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "100px 0" }}>
        <div className="spinner" style={{ width: "40px", height: "40px", border: "3px solid var(--border-light)", borderTopColor: "var(--brand-600)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "32px 16px", width: "100%" }}>
      <div style={{ backgroundColor: "white", padding: "32px", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-light)", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h1 style={{ margin: "0", fontSize: "1.75rem", color: "var(--text-primary)" }}>Edit Article</h1>
          <Link href={`/article/${params.id}`} style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.875rem", fontWeight: 500 }}>Cancel</Link>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label htmlFor="title" style={{ display: "block", marginBottom: "8px", fontWeight: 500, color: "var(--text-primary)", fontSize: "0.938rem" }}>Title *</label>
            <input
              type="text"
              id="title"
              className="input-primary"
              placeholder="Give your post a catchy title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ width: "100%", fontSize: "1.125rem", padding: "12px 16px" }}
            />
          </div>

          <div>
            <label htmlFor="content" style={{ display: "block", marginBottom: "8px", fontWeight: 500, color: "var(--text-primary)", fontSize: "0.938rem" }}>Content *</label>
            <textarea
              id="content"
              className="input-primary"
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={12}
              style={{ width: "100%", padding: "16px", resize: "vertical", fontSize: "1rem", lineHeight: 1.6 }}
            />
          </div>

          <div>
            <label htmlFor="tags" style={{ display: "block", marginBottom: "8px", fontWeight: 500, color: "var(--text-primary)", fontSize: "0.938rem" }}>Tags (Comma separated)</label>
            <input
              type="text"
              id="tags"
              className="input-primary"
              placeholder="e.g. fashion, technology, news"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              style={{ width: "100%", padding: "12px 16px" }}
            />
          </div>

          <button 
            type="submit" 
            disabled={saving} 
            className="btn-primary" 
            style={{ padding: "14px", fontSize: "1rem", marginTop: "12px", opacity: saving ? 0.7 : 1 }}
          >
            {saving ? "Saving Changes..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
