"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { multipartApi } from "@/lib/api";
import { useToast } from "@/components/ui/ToastContext";

export default function CreateArticle() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages((prev) => [...prev, ...files]);
      
      const previews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...previews]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index]);
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("auth-token");
    
    if (!token) {
      toast.error("You must be logged in to post an article");
      router.push("/login?redirect=/article/create");
      return;
    }

    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    setLoading(true);
    
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    if (tags.trim()) formData.append("tags", tags);
    
    images.forEach((image) => {
      formData.append("images[]", image);
    });

    try {
      const res = await multipartApi("/articles", {
        method: "POST",
        token,
        body: formData,
      });

      if (res.status === 201) {
        toast.success("Article published successfully!");
        router.push("/article");
      } else {
        toast.error("Failed to publish article");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "32px 16px", width: "100%" }}>
      <div style={{ backgroundColor: "white", padding: "32px", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-light)", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
        <h1 style={{ margin: "0 0 24px 0", fontSize: "1.75rem", color: "var(--text-primary)" }}>Write a Post</h1>
        
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
            <label style={{ display: "block", marginBottom: "8px", fontWeight: 500, color: "var(--text-primary)", fontSize: "0.938rem" }}>Upload Images (Optional)</label>
            <div style={{ 
              border: "2px dashed var(--border-light)", 
              borderRadius: "var(--radius-lg)", 
              padding: "24px", 
              textAlign: "center",
              backgroundColor: "var(--bg-muted)",
              position: "relative",
              cursor: "pointer"
            }}>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                style={{ 
                  position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" 
                }}
              />
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--brand-600)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "12px" }}>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <p style={{ margin: 0, color: "var(--text-secondary)", fontWeight: 500 }}>Click or drag images here to upload</p>
              <p style={{ margin: "8px 0 0 0", color: "var(--text-muted)", fontSize: "0.813rem" }}>Support JPG, PNG, WEBP (Max 2MB each)</p>
            </div>

            {imagePreviews.length > 0 && (
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "16px" }}>
                {imagePreviews.map((preview, idx) => (
                  <div key={idx} style={{ position: "relative", width: "100px", height: "100px", borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--border-light)" }}>
                    <img src={preview} alt={`Preview ${idx}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button 
                      type="button" 
                      onClick={() => removeImage(idx)}
                      style={{ 
                        position: "absolute", top: "4px", right: "4px", 
                        background: "rgba(0,0,0,0.6)", color: "white", 
                        border: "none", borderRadius: "50%", width: "24px", height: "24px", 
                        display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" 
                      }}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="content" style={{ display: "block", marginBottom: "8px", fontWeight: 500, color: "var(--text-primary)", fontSize: "0.938rem" }}>Content *</label>
            <textarea
              id="content"
              className="input-primary"
              placeholder="What do you want to share with the community?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              style={{ width: "100%", minHeight: "300px", resize: "vertical", padding: "16px", lineHeight: 1.6 }}
            />
          </div>

          <div>
            <label htmlFor="tags" style={{ display: "block", marginBottom: "8px", fontWeight: 500, color: "var(--text-primary)", fontSize: "0.938rem" }}>Tags (Comma separated)</label>
            <input
              type="text"
              id="tags"
              className="input-primary"
              placeholder="e.g. tech, design, community"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
            <button 
              type="button" 
              onClick={() => router.back()} 
              className="btn-secondary"
              style={{ padding: "10px 24px", fontWeight: 600 }}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              style={{ padding: "10px 32px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}
              disabled={loading}
            >
              {loading ? "Publishing..." : "Publish Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
