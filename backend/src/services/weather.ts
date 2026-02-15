import { env } from '../config/env';

// ─── Weather Service (OpenWeather API) ────────────────────────
// Free tier: 1,000 calls/day.
// Returns null gracefully if no API key configured.
// ──────────────────────────────────────────────────────────────

const OW_BASE = 'https://api.openweathermap.org/data/2.5';

export interface WeatherData {
  temp: number;           // Celsius
  feelsLike: number;      // Celsius
  humidity: number;       // %
  pressure: number;       // hPa
  windSpeed: number;      // m/s
  windDirection: number;  // degrees
  visibility: number;     // meters
  conditions: string;     // e.g. "Heavy Rain"
  icon: string;           // OpenWeather icon code
  description: string;    // Full description
}

export const weatherService = {
  /**
   * Check if the weather service is available (has API key).
   */
  isAvailable(): boolean {
    return !!env.OPENWEATHER_KEY;
  },

  /**
   * Get current weather at a location.
   * Returns null if no API key or if the call fails.
   */
  async getWeather(lat: number, lng: number): Promise<WeatherData | null> {
    if (!env.OPENWEATHER_KEY) {
      console.warn('[Weather] OPENWEATHER_KEY not configured — skipping weather fetch');
      return null;
    }

    try {
      const url = `${OW_BASE}/weather?lat=${lat}&lon=${lng}&appid=${env.OPENWEATHER_KEY}&units=metric`;
      const response = await fetch(url);

      if (!response.ok) {
        console.error(`[Weather] API error: ${response.status} ${response.statusText}`);
        return null;
      }

      const data = await response.json() as {
        main: { temp: number; feels_like: number; humidity: number; pressure: number };
        wind: { speed: number; deg: number };
        visibility: number;
        weather: Array<{ main: string; description: string; icon: string }>;
      };

      return {
        temp: data.main.temp,
        feelsLike: data.main.feels_like,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        windSpeed: data.wind.speed,
        windDirection: data.wind.deg,
        visibility: data.visibility,
        conditions: data.weather[0]?.main || 'Unknown',
        description: data.weather[0]?.description || 'No description',
        icon: data.weather[0]?.icon || '01d',
      };
    } catch (error) {
      console.error('[Weather] Failed to fetch weather data:', error);
      return null;
    }
  },

  /**
   * Determine if weather conditions should escalate incident severity.
   * Returns a severity bump suggestion.
   */
  assessWeatherImpact(
    incidentType: string,
    weather: WeatherData
  ): { shouldEscalate: boolean; reason: string } {
    // High wind + fire → escalate
    if (incidentType === 'FIRE' && weather.windSpeed > 10) {
      return { shouldEscalate: true, reason: `High winds (${weather.windSpeed} m/s) may spread fire` };
    }

    // Extreme temperature (>45°C or <-10°C) + medical → escalate
    if (incidentType === 'MEDICAL' && (weather.temp > 45 || weather.temp < -10)) {
      return { shouldEscalate: true, reason: `Extreme temperature (${weather.temp}°C) increases medical risk` };
    }

    // Heavy rain/snow + flood → escalate
    if (incidentType === 'FLOOD' && weather.conditions.toLowerCase().includes('rain')) {
      return { shouldEscalate: true, reason: `Ongoing rain may worsen flooding` };
    }

    // Low visibility + infrastructure → escalate
    if (incidentType === 'INFRASTRUCTURE' && weather.visibility < 500) {
      return { shouldEscalate: true, reason: `Low visibility (${weather.visibility}m) hampers rescue` };
    }

    return { shouldEscalate: false, reason: '' };
  },
};
