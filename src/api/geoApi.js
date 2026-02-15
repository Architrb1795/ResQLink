import api from './apiClient';

// ─── Geo API ─────────────────────────────────────────────────
// Geocoding proxy (Nominatim) for address search.
// ─────────────────────────────────────────────────────────────

export const geoApi = {
  /**
   * Forward geocode: search for a location by text.
   * Returns up to 5 results with lat/lng.
   */
  async search(query) {
    const { data } = await api.get('/geo/search', {
      params: { q: query },
    });
    return data.results || [];
  },

  /**
   * Reverse geocode: get address from coordinates.
   */
  async reverse(lat, lng) {
    const { data } = await api.get('/geo/reverse', {
      params: { lat, lng },
    });
    return data.result;
  },
};
