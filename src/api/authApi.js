import api, { tokenStore } from './apiClient';

// ─── Auth API ────────────────────────────────────────────────
// Handles registration, login, token refresh, and user profile.
// ─────────────────────────────────────────────────────────────

export const authApi = {
  /**
   * Register a new user.
   */
  async register(name, email, password, role = 'CIVILIAN') {
    const { data } = await api.post('/auth/register', { name, email, password, role });
    tokenStore.set(data.accessToken, data.refreshToken);
    return data.user;
  },

  /**
   * Login with email + password.
   */
  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    tokenStore.set(data.accessToken, data.refreshToken);
    return data.user;
  },

  /**
   * Get current user profile.
   */
  async getMe() {
    const { data } = await api.get('/auth/me');
    return data;
  },

  /**
   * Logout — invalidate refresh token.
   */
  async logout() {
    const refreshToken = tokenStore.getRefresh();
    try {
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } finally {
      tokenStore.clear();
    }
  },

  /**
   * Check if user has a stored token.
   */
  hasToken() {
    return !!tokenStore.getAccess();
  },
};
