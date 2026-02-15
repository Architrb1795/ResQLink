import { env } from '../config/env';

// ─── Geocoding Service (OpenStreetMap Nominatim) ──────────────
// Fully free, no API key needed.
// Rate limit: 1 request/second (Nominatim policy).
// ──────────────────────────────────────────────────────────────

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'ResQLink/1.0 (disaster-response-app)';

// Simple rate limiter: track last call timestamp
let lastCallTime = 0;

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const elapsed = now - lastCallTime;
  if (elapsed < 1100) {
    await new Promise((resolve) => setTimeout(resolve, 1100 - elapsed));
  }
  lastCallTime = Date.now();

  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
  });

  if (!response.ok) {
    throw Object.assign(
      new Error(`Nominatim API error: ${response.status} ${response.statusText}`),
      { statusCode: 502 }
    );
  }

  return response;
}

export interface GeocodingResult {
  lat: number;
  lng: number;
  displayName: string;
  type: string;
  importance: number;
}

export const geocodingService = {
  /**
   * Forward geocode: human-readable address → coordinates.
   * Returns up to 5 results.
   */
  async geocode(query: string): Promise<GeocodingResult[]> {
    try {
      const url = `${NOMINATIM_BASE}/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`;
      const response = await rateLimitedFetch(url);
      const data = await response.json() as Array<{
        lat: string;
        lon: string;
        display_name: string;
        type: string;
        importance: number;
      }>;

      return data.map((item) => ({
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        displayName: item.display_name,
        type: item.type,
        importance: item.importance,
      }));
    } catch (error) {
      if (env.NODE_ENV === 'development') {
        console.error('[Geocoding] Search failed:', error);
      }
      throw Object.assign(
        new Error('Geocoding service temporarily unavailable'),
        { statusCode: 503 }
      );
    }
  },

  /**
   * Reverse geocode: coordinates → human-readable address.
   */
  async reverseGeocode(lat: number, lng: number): Promise<GeocodingResult | null> {
    try {
      const url = `${NOMINATIM_BASE}/reverse?lat=${lat}&lon=${lng}&format=json`;
      const response = await rateLimitedFetch(url);
      const data = await response.json() as {
        lat: string;
        lon: string;
        display_name: string;
        type?: string;
        importance?: number;
        error?: string;
      };

      if (data.error) return null;

      return {
        lat: parseFloat(data.lat),
        lng: parseFloat(data.lon),
        displayName: data.display_name,
        type: data.type || 'unknown',
        importance: data.importance || 0,
      };
    } catch (error) {
      if (env.NODE_ENV === 'development') {
        console.error('[Geocoding] Reverse lookup failed:', error);
      }
      return null;
    }
  },
};
