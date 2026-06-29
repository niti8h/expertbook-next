export async function fetchGlobalSettings() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/api/settings`, { 
      next: { revalidate: 60 } 
    });
    if (!res.ok) return {};
    const json = await res.json();
    return json.data || {};
  } catch (err) {
    console.error("Failed to fetch settings:", err);
    return {};
  }
}
