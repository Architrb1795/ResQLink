import api from './apiClient';

// ─── Incident API ────────────────────────────────────────────
// CRUD operations for incidents + verify/vote.
// ─────────────────────────────────────────────────────────────

export const incidentApi = {
  /**
   * Create a new incident report.
   */
  async create(incidentData) {
    const { data } = await api.post('/incidents', incidentData);
    return data;
  },

  /**
   * List incidents with optional filters + pagination.
   * @param {Object} params - { page, limit, type, severity, status }
   */
  async list(params = {}) {
    const { data } = await api.get('/incidents', { params });
    return data;
  },

  /**
   * Get a single incident by ID.
   */
  async getById(id) {
    const { data } = await api.get(`/incidents/${id}`);
    return data;
  },

  /**
   * Update incident status.
   */
  async updateStatus(id, status) {
    const { data } = await api.patch(`/incidents/${id}/status`, { status });
    return data;
  },

  /**
   * Toggle incident verification.
   */
  async verify(id) {
    const { data } = await api.patch(`/incidents/${id}/verify`);
    return data;
  },

  /**
   * Upvote an incident.
   */
  async vote(id) {
    const { data } = await api.post(`/incidents/${id}/vote`);
    return data;
  },
};
