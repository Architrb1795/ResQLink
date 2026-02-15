import api from './apiClient';

// ─── Feeds API ───────────────────────────────────────────────
// Crisis data feeds (USGS Earthquakes, ReliefWeb reports, weather).
// ─────────────────────────────────────────────────────────────

export const feedsApi = {
  /**
   * Fetch recent earthquakes from USGS.
   * @param {string} period - 'hour' | 'day' | 'week' | 'month'
   * @param {string} magnitude - 'significant' | '4.5' | '2.5' | '1.0' | 'all'
   */
  async getEarthquakes(period = 'day', magnitude = '4.5') {
    const { data } = await api.get('/feeds/earthquakes', {
      params: { period, magnitude },
    });
    return data;
  },

  /**
   * Fetch crisis reports from ReliefWeb (UN OCHA).
   */
  async getReports(country, limit = 10) {
    const { data } = await api.get('/feeds/reports', {
      params: { country, limit },
    });
    return data;
  },

  /**
   * Get combined crisis summary.
   */
  async getSummary(country) {
    const { data } = await api.get('/feeds/summary', {
      params: { country },
    });
    return data;
  },

  /**
   * Get weather for a location.
   */
  async getWeather(lat, lng) {
    const { data } = await api.get('/feeds/weather', {
      params: { lat, lng },
    });
    return data;
  },
};
