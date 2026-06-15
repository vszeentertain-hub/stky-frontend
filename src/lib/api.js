import axios from "axios";

export const API_BASE = "https://stky.my.id/api";

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// Inject Bearer token from localStorage as a fallback to httpOnly cookies
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("stky_token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function formatApiError(err) {
  const d = err?.response?.data?.detail;
  if (d == null) return err?.message || "Something went wrong";
  if (typeof d === "string") return d;
  if (Array.isArray(d)) return d.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).join(" ");
  if (typeof d === "object" && typeof d.msg === "string") return d.msg;
  return String(d);
}

export function mediaUrl(file) {
  if (!file) return "";

  if (typeof file === "string") {
    return `${API_BASE}/media/file/${file}`;
  }

  if (file.url) {
    return file.url.startsWith("http") ? file.url : `https://stky.my.id`;
  }

  if (file.storage_path) {
    return `${API_BASE}/media/file/${file.storage_path}`;
  }

  if (file.id) {
    return `${API_BASE}/media/file/${file.id}`;
  }

  return "";
}
