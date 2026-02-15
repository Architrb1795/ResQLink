import { env } from '../config/env';

// ─── Routing Service (OpenRouteService) ───────────────────────
// Free tier: 2,000 calls/day.
// Falls back to Haversine distance estimate if no API key.
// ──────────────────────────────────────────────────────────────

const ORS_BASE = 'https://api.openrouteservice.org/v2';

export interface RouteResult {
  distanceKm: number;
  etaMinutes: number;
  polyline?: Array<[number, number]>; // [lng, lat] pairs
  source: 'openrouteservice' | 'haversine-estimate';
}

/**
 * Haversine formula: straight-line distance between two points.
 * Used as a fallback when ORS is unavailable.
 */
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const routingService = {
  /**
   * Check if the routing service can use ORS (has API key).
   */
  isAvailable(): boolean {
    return !!env.ORS_API_KEY;
  },

  /**
   * Get driving route between two points.
   * Falls back to Haversine estimate (distance * 1.4 for road factor, 40 km/h average speed).
   */
  async getRoute(
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number
  ): Promise<RouteResult> {
    if (!env.ORS_API_KEY) {
      // Haversine fallback
      const straightLine = haversineDistance(fromLat, fromLng, toLat, toLng);
      const roadDistance = straightLine * 1.4; // Road factor
      const etaMinutes = (roadDistance / 40) * 60; // 40 km/h average

      console.warn('[Routing] ORS_API_KEY not configured — using Haversine estimate');
      return {
        distanceKm: Math.round(roadDistance * 100) / 100,
        etaMinutes: Math.round(etaMinutes),
        source: 'haversine-estimate',
      };
    }

    try {
      const url = `${ORS_BASE}/directions/driving-car?api_key=${env.ORS_API_KEY}&start=${fromLng},${fromLat}&end=${toLng},${toLat}`;
      const response = await fetch(url);

      if (!response.ok) {
        console.error(`[Routing] ORS API error: ${response.status} ${response.statusText}`);
        // Fall back to Haversine
        const straightLine = haversineDistance(fromLat, fromLng, toLat, toLng);
        return {
          distanceKm: Math.round(straightLine * 1.4 * 100) / 100,
          etaMinutes: Math.round((straightLine * 1.4 / 40) * 60),
          source: 'haversine-estimate',
        };
      }

      const data = await response.json() as {
        features: Array<{
          properties: { summary: { distance: number; duration: number } };
          geometry: { coordinates: Array<[number, number]> };
        }>;
      };

      const feature = data.features[0];
      if (!feature) {
        throw new Error('No route found');
      }

      const { distance, duration } = feature.properties.summary;

      return {
        distanceKm: Math.round((distance / 1000) * 100) / 100,
        etaMinutes: Math.round(duration / 60),
        polyline: feature.geometry.coordinates,
        source: 'openrouteservice',
      };
    } catch (error) {
      console.error('[Routing] Failed to fetch route:', error);

      // Final fallback
      const straightLine = haversineDistance(fromLat, fromLng, toLat, toLng);
      return {
        distanceKm: Math.round(straightLine * 1.4 * 100) / 100,
        etaMinutes: Math.round((straightLine * 1.4 / 40) * 60),
        source: 'haversine-estimate',
      };
    }
  },
};
