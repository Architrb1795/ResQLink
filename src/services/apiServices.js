// External API Services for ResQLink
import { GoogleGenerativeAI } from '@google/generative-ai';

const W3W_API_KEY = import.meta.env.VITE_WHAT3WORDS_KEY;
const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_KEY;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_KEY;

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

const fetchJsonWithFallback = async (proxyPath, directUrl) => {
    // Prefer same-origin proxy (avoids CORS issues). If unavailable, fall back to direct.
    try {
        const prox = await fetch(proxyPath);
        if (prox.ok) {
            const data = await prox.json();
            return data;
        }
    } catch (_) {
        // ignore and try direct
    }

    const res = await fetch(directUrl);
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    return await res.json();
};

// 1. NASA EONET (Earth Observatory Natural Event Tracker)
export const fetchEonetEvents = async () => {
    try {
        const data = await fetchJsonWithFallback(
            '/api/external/eonet',
            'https://eonet.gsfc.nasa.gov/api/v3/events?status=open&days=60'
        );

        // If backend proxy already returns normalized events, just use them.
        if (Array.isArray(data) && data[0] && typeof data[0] === 'object' && 'coordinates' in data[0]) {
            return data;
        }

        return (data.events || []).map(event => {
            const geom = Array.isArray(event.geometry) && event.geometry.length > 0 ? event.geometry[event.geometry.length - 1] : null;
            return ({
                id: event.id,
                title: event.title,
                categories: (event.categories || []).map(c => c.title),
                coordinates: geom?.coordinates // [lng, lat]
            });
        });
    } catch (error) {
        console.error("Failed to fetch EONET events:", error);
        return [];
    }
};

// 1.5 USGS Global Earthquakes (Live)
export const fetchUsgsEarthquakes = async () => {
    try {
        const data = await fetchJsonWithFallback(
            '/api/external/usgs',
            'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson'
        );

        if (Array.isArray(data) && data[0] && typeof data[0] === 'object' && 'mag' in data[0] && 'coordinates' in data[0]) {
            return data;
        }

        return (data.features || []).map(feature => ({
            id: feature.id,
            title: feature.properties?.title,
            mag: feature.properties?.mag,
            coordinates: feature.geometry?.coordinates // [lng, lat, depth]
        }));
    } catch (error) {
        console.error("Failed to fetch USGS Earthquakes:", error);
        return [];
    }
};

// 2. GDACS (Global Disaster Alert and Coordination System)
export const fetchGdacsEvents = async () => {
    try {
        // Fetching the RSS JSON feed provided by GDACS or an equivalent public proxy, 
        // using the GDACS GeoJSON endpoint for the past 24 hours
        const data = await fetchJsonWithFallback(
            '/api/external/gdacs',
            'https://www.gdacs.org/gdacsapi/api/events/getbboxmapdata?v=2.0'
        );

        if (Array.isArray(data) && data[0] && typeof data[0] === 'object' && 'severity' in data[0] && 'coordinates' in data[0]) {
            return data;
        }
        
        return (data.features || []).map(feature => ({
            id: feature.properties.eventid,
            title: feature.properties.name,
            description: feature.properties.htmldescription,
            severity: feature.properties.alertlevel,
            coordinates: feature.geometry.coordinates, // [lng, lat]
            type: feature.properties.eventtype
        }));
    } catch (error) {
        console.error("Failed to fetch GDACS events:", error);
        return [];
    }
};

// 3. What3Words
export const getWhat3WordsLocation = async (lat, lng) => {
    if (!W3W_API_KEY) {
        console.warn("What3Words API key is missing.");
        return null;
    }
    try {
        const res = await fetch(`https://api.what3words.com/v3/convert-to-3wa?coordinates=${lat},${lng}&key=${W3W_API_KEY}`);
        if (!res.ok) throw new Error('W3W API Error');
        const data = await res.json();
        return data.words; // e.g. "index.home.raft"
    } catch (error) {
        console.error("Failed to fetch What3Words:", error);
        return null;
    }
};

// 3. OpenFEMA Disaster Declarations
export const fetchFemaDisasters = async () => {
    try {
        const data = await fetchJsonWithFallback(
            '/api/external/fema',
            'https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries?$orderby=declarationDate%20desc&$top=50'
        );

        if (Array.isArray(data) && data[0] && typeof data[0] === 'object' && 'state' in data[0] && 'date' in data[0]) {
            return data;
        }

        return (data.DisasterDeclarationsSummaries || []).map((d, idx) => ({
            // OpenFEMA rows can repeat `disasterNumber` + `declarationDate`; include location codes for stable uniqueness.
            id: `${d.disasterNumber}-${d.state}-${d.placeCode ?? d.fipsCountyCode ?? d.fipsStateCode ?? '0'}-${d.declarationDate}-${idx}`,
            title: d.declarationTitle,
            type: d.incidentType,
            state: d.state,
            date: d.declarationDate
        }));
    } catch (error) {
        console.error("Failed to fetch FEMA data:", error);
        return [];
    }
};

// 4. OpenWeatherMap
export const getOpenWeatherData = async (lat, lng) => {
    if (!OPENWEATHER_API_KEY) {
        console.warn("OpenWeatherMap API key is missing.");
        return null;
    }
    try {
        const [weatherRes, pollutionRes] = await Promise.all([
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}&units=metric`),
            fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}`)
        ]);

        if (!weatherRes.ok || !pollutionRes.ok) throw new Error('OpenWeather API Error');
        
        const weatherData = await weatherRes.json();
        const pollutionData = await pollutionRes.json();
        
        return {
            aqi: pollutionData.list[0].main.aqi, // 1 (Good) to 5 (Very Poor)
            temperature: weatherData.main.temp,
            humidity: weatherData.main.humidity,
            weatherText: weatherData.weather[0].main
        };
    } catch (error) {
        console.error("Failed to fetch OpenWeather data:", error);
        return null;
    }
};

// 5. Google Gemini AI
export const generateAIResponse = async (prompt, history = []) => {
    if (!genAI) {
        return "Gemini API key is not configured. Please add VITE_GEMINI_KEY to your .env file.";
    }
    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-3-flash-preview",
            systemInstruction: "You are the highly advanced ResQLink Emergency AI Assistant. Your advice must be extremely engaging, actionable, and meticulously structured for high-stress crisis scenarios.\n\nFormatting Rules:\n1. SUBHEADERS: Divide distinct steps using Markdown Headers (`### Step 1`).\n2. BOLDING (IMPORTANT): Use **bold** ONLY for very short, high-signal fragments (1 to 4 words). Do NOT bold full sentences or long phrases.\n3. WARNING BOXES: Wrap severe negative warnings (things NOT to do) inside `> blockquotes`.\n4. Readability: Use short, punchy paragraphs and avoid long walls of text.\n\nAt the very end of every single response, append 3 realistic quick-reply follow-up questions formatted exactly like this hidden block string: |||[\"Suggestion 1\", \"Suggestion 2\", \"Suggestion 3\"]|||"
        });
        const chat = model.startChat({
            history: history,
        });
        const result = await chat.sendMessage(prompt);
        return result.response.text();
    } catch (error) {
        console.error("AI Generation Error:", error);
        return `I am sorry, I am unable to connect to the AI service at the moment. (Error: ${error.message || "Unknown Provider Error"})`;
    }
};

export const apiStatus = {
    isLive: !!GEMINI_API_KEY && !!W3W_API_KEY && !!OPENWEATHER_API_KEY,
    gemini: !!GEMINI_API_KEY,
    w3w: !!W3W_API_KEY,
    openweathermap: !!OPENWEATHER_API_KEY,
};
