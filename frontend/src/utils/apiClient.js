// Simple API client wrapper with auth + JSON handling
// Prefer relative /api when proxy is configured (development) to avoid CORS
// Fallback to explicit backend URL if provided.
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

export const apiClient = async (path, { method = 'GET', headers = {}, body, auth = true } = {}) => {
  const finalHeaders = { 'Content-Type': 'application/json', ...headers };
  if (auth) {
    try {
      const token = localStorage.getItem('token');
      if (token) finalHeaders.Authorization = `Bearer ${token}`;
    } catch (_) {
      // ignore
    }
  }

  const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include'
  });

  let data = null;
  try {
    data = await res.json();
  } catch (_) {
    // Non-JSON response
  }

  if (!res.ok) {
    // Auto-logout on 401
    if (res.status === 401) {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('demographic');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
      } catch (_) {}
      // Soft redirect if running in browser
      if (typeof window !== 'undefined') {
        window.location.replace('/login');
      }
    }
    const message = data?.msg || data?.error || data?.message || `Request failed (${res.status})`;
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
};

export const get = (path, opts) => apiClient(path, { ...opts, method: 'GET' });
export const post = (path, body, opts) => apiClient(path, { ...opts, method: 'POST', body });
export const put = (path, body, opts) => apiClient(path, { ...opts, method: 'PUT', body });
export const del = (path, opts) => apiClient(path, { ...opts, method: 'DELETE' });

export default apiClient;
