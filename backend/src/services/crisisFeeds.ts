// ─── Crisis Data Feeds ────────────────────────────────────────
// Aggregates real-time disaster data from free public APIs:
//   1. USGS Earthquake API — fully free, no key needed
//   2. ReliefWeb API (UN OCHA) — fully free, no key needed
//   3. GDACS (Global Disaster Alert) — fully free, no key needed
// ──────────────────────────────────────────────────────────────

// ─── USGS Earthquake Feed ─────────────────────────────────────

export interface EarthquakeData {
  id: string;
  magnitude: number;
  place: string;
  time: Date;
  lat: number;
  lng: number;
  depth: number;
  url: string;
  tsunami: boolean;
}

export const crisisFeedsService = {
  /**
   * Fetch recent earthquakes from USGS.
   * @param period - 'hour' | 'day' | 'week' | 'month'
   * @param minMagnitude - 'significant' | 'all' | '4.5' | '2.5' | '1.0'
   */
  async getEarthquakes(
    period: 'hour' | 'day' | 'week' | 'month' = 'day',
    minMagnitude: 'significant' | 'all' | '4.5' | '2.5' | '1.0' = '4.5'
  ): Promise<EarthquakeData[]> {
    try {
      const url = `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/${minMagnitude}_${period}.geojson`;
      const response = await fetch(url);

      if (!response.ok) {
        console.error(`[CrisisFeeds] USGS API error: ${response.status}`);
        return [];
      }

      const data = await response.json() as {
        features: Array<{
          id: string;
          properties: {
            mag: number;
            place: string;
            time: number;
            url: string;
            tsunami: number;
          };
          geometry: { coordinates: [number, number, number] };
        }>;
      };

      return data.features.map((f) => ({
        id: f.id,
        magnitude: f.properties.mag,
        place: f.properties.place,
        time: new Date(f.properties.time),
        lng: f.geometry.coordinates[0],
        lat: f.geometry.coordinates[1],
        depth: f.geometry.coordinates[2],
        url: f.properties.url,
        tsunami: f.properties.tsunami === 1,
      }));
    } catch (error) {
      console.error('[CrisisFeeds] Failed to fetch earthquakes:', error);
      return [];
    }
  },

  /**
   * Fetch crisis reports from ReliefWeb (UN OCHA).
   * Returns recent disaster reports sorted by date.
   */
  async getReliefWebReports(
    country?: string,
    limit: number = 10
  ): Promise<Array<{
    id: number;
    title: string;
    date: string;
    country: string;
    source: string;
    url: string;
    disasterType: string;
  }>> {
    try {
      let url = `https://api.reliefweb.int/v1/reports?appname=resqlink&limit=${limit}&sort[]=date:desc`;
      if (country) {
        url += `&filter[field]=country.name&filter[value]=${encodeURIComponent(country)}`;
      }
      url += '&fields[include][]=title&fields[include][]=date.original&fields[include][]=country.name&fields[include][]=source.name&fields[include][]=url&fields[include][]=disaster_type.name';

      const response = await fetch(url);

      if (!response.ok) {
        console.error(`[CrisisFeeds] ReliefWeb API error: ${response.status}`);
        return [];
      }

      const data = await response.json() as {
        data: Array<{
          id: number;
          fields: {
            title: string;
            'date': { original: string };
            country: Array<{ name: string }>;
            source: Array<{ name: string }>;
            url: string;
            disaster_type?: Array<{ name: string }>;
          };
        }>;
      };

      return data.data.map((item) => ({
        id: item.id,
        title: item.fields.title,
        date: item.fields.date?.original || 'Unknown',
        country: item.fields.country?.[0]?.name || 'Unknown',
        source: item.fields.source?.[0]?.name || 'Unknown',
        url: item.fields.url || '',
        disasterType: item.fields.disaster_type?.[0]?.name || 'General',
      }));
    } catch (error) {
      console.error('[CrisisFeeds] Failed to fetch ReliefWeb reports:', error);
      return [];
    }
  },

  /**
   * Get a combined crisis summary for a region.
   */
  async getCrisisSummary(country?: string): Promise<{
    earthquakes: EarthquakeData[];
    reports: Array<{ id: number; title: string; date: string; country: string; source: string; url: string; disasterType: string }>;
    lastUpdated: string;
  }> {
    const [earthquakes, reports] = await Promise.all([
      this.getEarthquakes('day', '4.5'),
      this.getReliefWebReports(country, 10),
    ]);

    return {
      earthquakes,
      reports,
      lastUpdated: new Date().toISOString(),
    };
  },
};
