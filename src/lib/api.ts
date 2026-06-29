const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface ApiOptions {
  method?: string;
  body?: Record<string, unknown>;
  token?: string;
}

export async function api<T = unknown>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<{ data: T; status: number }> {
  const { method = "GET", body, token } = options;

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json();
  return { data: json, status: res.status };
}

export async function multipartApi<T = unknown>(
  endpoint: string,
  options: { method?: string; body: FormData; token?: string }
): Promise<{ data: T; status: number }> {
  const { method = "POST", body, token } = options;

  const headers: Record<string, string> = {
    Accept: "application/json",
    // Do NOT set Content-Type for FormData, browser sets it automatically with boundary
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Laravel needs _method for PUT/PATCH via multipart/form-data
  let finalMethod = method;
  if (method.toUpperCase() === "PUT" || method.toUpperCase() === "PATCH") {
    body.append("_method", method.toUpperCase());
    finalMethod = "POST";
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: finalMethod,
    headers,
    body,
  });

  const json = await res.json();
  return { data: json, status: res.status };
}

// Auth helpers
export const authApi = {
  login: (email: string, password: string) =>
    api("/auth/login", { method: "POST", body: { email, password } }),

  register: (data: Record<string, unknown>) =>
    api("/auth/register", { method: "POST", body: data }),

  logout: (token: string) =>
    api("/auth/logout", { method: "POST", token }),

  me: (token: string) =>
    api("/auth/me", { token }),

  updateProfile: (token: string, data: Record<string, unknown>) =>
    api("/auth/profile", { method: "PUT", body: data, token }),
};
