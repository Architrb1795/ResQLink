import { prisma } from '../../services/db';

// ─── Map Service ──────────────────────────────────────────────
// Serves map-ready spatial data. Filters entities by bounding
// box (swLat/swLng/neLat/neLng) for efficient map rendering.
// ──────────────────────────────────────────────────────────────

interface BBox {
  swLat: number;
  swLng: number;
  neLat: number;
  neLng: number;
}

function bboxFilter(bbox: BBox) {
  return {
    lat: { gte: bbox.swLat, lte: bbox.neLat },
    lng: { gte: bbox.swLng, lte: bbox.neLng },
  };
}

export const mapService = {
  async getIncidentsInBBox(bbox: BBox) {
    return prisma.incident.findMany({
      where: {
        ...bboxFilter(bbox),
        status: { not: 'RESOLVED' }, // Only active incidents on map
      },
      select: {
        id: true,
        type: true,
        severity: true,
        status: true,
        lat: true,
        lng: true,
        locationName: true,
        description: true,
        verified: true,
        votes: true,
        createdAt: true,
      },
      orderBy: { severity: 'asc' }, // CRITICAL first
    });
  },

  async getUnitsInBBox(bbox: BBox) {
    return prisma.volunteer.findMany({
      where: {
        ...bboxFilter(bbox),
        status: { not: 'OFFLINE' },
      },
      select: {
        id: true,
        name: true,
        status: true,
        lat: true,
        lng: true,
        currentTaskId: true,
      },
    });
  },

  async getResourcesInBBox(bbox: BBox) {
    return prisma.resource.findMany({
      where: bboxFilter(bbox),
      select: {
        id: true,
        type: true,
        quantity: true,
        unit: true,
        lat: true,
        lng: true,
        status: true,
      },
    });
  },

  async getLayersAsGeoJSON(bbox: BBox) {
    const [incidents, units, resources] = await Promise.all([
      this.getIncidentsInBBox(bbox),
      this.getUnitsInBBox(bbox),
      this.getResourcesInBBox(bbox),
    ]);

    return {
      type: 'FeatureCollection' as const,
      features: [
        ...incidents.map((i) => ({
          type: 'Feature' as const,
          geometry: { type: 'Point' as const, coordinates: [i.lng, i.lat] },
          properties: { ...i, layer: 'incident' },
        })),
        ...units.map((u) => ({
          type: 'Feature' as const,
          geometry: { type: 'Point' as const, coordinates: [u.lng, u.lat] },
          properties: { ...u, layer: 'unit' },
        })),
        ...resources.map((r) => ({
          type: 'Feature' as const,
          geometry: { type: 'Point' as const, coordinates: [r.lng, r.lat] },
          properties: { ...r, layer: 'resource' },
        })),
      ],
    };
  },
};
