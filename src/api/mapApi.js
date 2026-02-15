import api from './apiClient';

// ─── Map API ─────────────────────────────────────────────────
// Spatial queries for the crisis map.
// ─────────────────────────────────────────────────────────────

export const mapApi = {
  /**
   * Get incidents within a bounding box.
   * @param {Object} bbox - { swLat, swLng, neLat, neLng }
   */
  async getIncidents(bbox = {}) {
    const { data } = await api.get('/map/incidents', { params: bbox });
    return data;
  },

  /**
   * Get volunteer units within a bounding box.
   */
  async getUnits(bbox = {}) {
    const { data } = await api.get('/map/units', { params: bbox });
    return data;
  },

  /**
   * Get resources within a bounding box.
   */
  async getResources(bbox = {}) {
    const { data } = await api.get('/map/resources', { params: bbox });
    return data;
  },

  /**
   * Get all map layers (incidents + units + resources).
   */
  async getLayers(bbox = {}) {
    const { data } = await api.get('/map/layers', { params: bbox });
    return data;
  },
};
