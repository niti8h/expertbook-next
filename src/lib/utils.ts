export function getImageUrl(path: string | undefined | null) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const baseUrl = process.env.NEXT_PUBLIC_STORAGE_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.expertbook.in";
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
