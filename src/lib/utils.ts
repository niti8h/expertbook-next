export function getImageUrl(path: string | undefined | null) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const baseUrl = "https://api.expertbook.in";
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
