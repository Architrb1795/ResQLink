import axios from 'axios';

// ─── API Client ──────────────────────────────────────────────
// Single Axios instance used by all API modules.
// - Auto-attaches JWT from localStorage
// - Auto-refreshes expired tokens (401 → /auth/refresh → retry)
// - Normalizes errors into { status, message, details }
// ─────────────────────────────────────────────────────────────

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Token Helpers ────────────────────────────────────────────

export const tokenStore = {
  getAccess: () => localStorage.getItem('resqlink_token'),
  getRefresh: () => localStorage.getItem('resqlink_refresh'),
  set: (accessToken, refreshToken) => {
    localStorage.setItem('resqlink_token', accessToken);
    if (refreshToken) localStorage.setItem('resqlink_refresh', refreshToken);
  },
  clear: () => {
    localStorage.removeItem('resqlink_token');
    localStorage.removeItem('resqlink_refresh');
  },
};

// ─── Request Interceptor: Attach JWT ─────────────────────────

api.interceptors.request.use(
  (config) => {
    const token = tokenStore.getAccess();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: Refresh & Error Handling ──────────

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't retried yet, try token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = tokenStore.getRefresh();

      if (!refreshToken) {
        tokenStore.clear();
        return Promise.reject(normalizeError(error));
      }

      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        tokenStore.set(data.accessToken, data.refreshToken);
        processQueue(null, data.accessToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        tokenStore.clear();
        window.dispatchEvent(new CustomEvent('auth:expired'));
        return Promise.reject(normalizeError(refreshError));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(normalizeError(error));
  }
);

// ─── Error Normalization ─────────────────────────────────────

function normalizeError(error) {
  if (error.response) {
    // Server responded with error
    const { status, data } = error.response;
    return {
      status,
      message: data?.error || data?.message || `Request failed (${status})`,
      details: data?.details || null,
      isNetworkError: false,
    };
  }

  if (error.request) {
    // No response received
    return {
      status: 0,
      message: 'Unable to reach the server. Check your connection.',
      details: null,
      isNetworkError: true,
    };
  }

  // Request setup error
  return {
    status: 0,
    message: error.message || 'An unexpected error occurred',
    details: null,
    isNetworkError: false,
  };
}

// ─── Health Check ────────────────────────────────────────────

export const checkBackendHealth = async () => {
  try {
    const { data } = await api.get('/health', { timeout: 3000 });
    return { connected: true, ...data };
  } catch {
    return { connected: false, status: 'unreachable' };
  }
};

export default api;
