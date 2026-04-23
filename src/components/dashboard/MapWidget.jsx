import React, { useCallback, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, LayersControl, LayerGroup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppState } from '../../context/AppStateContext';
import L from 'leaflet';

// Utility to create colored SVG markers string
const createMarkerIcon = (type, severity, reduceMotion = false) => {
    let pulse = false;
    if (severity === 'CRITICAL' && !reduceMotion) {
        pulse = true;
    }

    // Semantic Shapes based on Type
    if (type === 'FIRE' || type === 'Wildfires') return L.divIcon({
        className: 'custom-icon',
        html: `<div class="relative flex items-center justify-center w-8 h-8">
                ${pulse ? '<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-60"></span>' : ''}
                <div class="relative w-5 h-5 bg-orange-600 rounded-full border-[3px] border-slate-900 drop-shadow-md"></div>
               </div>`
    });

    if (type === 'MEDICAL') return L.divIcon({
        className: 'custom-icon',
        html: `<div class="relative flex items-center justify-center w-8 h-8">
                <div class="relative w-5 h-5 bg-green-500 rounded-sm rotate-45 border-[3px] border-slate-900 drop-shadow-md"></div>
               </div>`
    });

    if (type === 'Volcanoes' || type === 'VO') return L.divIcon({
        className: 'custom-icon',
        html: `<div class="relative flex items-center justify-center w-8 h-8">
                ${reduceMotion ? '' : '<span class="animate-ping absolute inline-flex h-5 w-5 rounded-full bg-red-600 opacity-60"></span>'}
                <div class="relative w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[14px] border-b-red-600 drop-shadow-md"></div>
               </div>`
    });

    if (type === 'Severe Storms' || type === 'TC') return L.divIcon({
        className: 'custom-icon',
        html: `<div class="relative flex items-center justify-center w-8 h-8">
                <div class="relative w-5 h-5 bg-indigo-500 rounded-full border-[3px] border-indigo-200 drop-shadow-md opacity-90"></div>
               </div>`
    });

    if (type === 'EQ' || type === 'Earthquakes') return L.divIcon({
        className: 'custom-icon',
        html: `<div class="relative flex items-center justify-center w-8 h-8">
                ${reduceMotion ? '' : '<span class="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-amber-500 opacity-50"></span>'}
                <div class="relative w-5 h-5 bg-amber-600 rounded-sm border-[3px] border-slate-900 drop-shadow-md"></div>
               </div>`
    });

    if (type === 'FL' || type === 'Floods') return L.divIcon({
        className: 'custom-icon',
        html: `<div class="relative flex items-center justify-center w-8 h-8">
                <div class="relative w-5 h-5 bg-cyan-500 rounded-full rounded-tr-sm border-[3px] border-slate-900 drop-shadow-md"></div>
               </div>`
    });

    if (type === 'INFRASTRUCTURE') return L.divIcon({
        className: 'custom-icon',
        html: `<div class="relative flex items-center justify-center w-8 h-8">
                <div class="relative w-5 h-5 bg-amber-500 border-[3px] border-slate-900 drop-shadow-md"></div>
               </div>`
    });

    // Default Circle for others
    return L.divIcon({
        className: 'custom-icon',
        html: `<div class="relative flex items-center justify-center w-8 h-8">
                ${pulse ? `<span class="animate-ping absolute inline-flex h-full w-full rounded-full ${severity === 'CRITICAL' ? 'bg-red-500' : 'bg-blue-500'} opacity-60"></span>` : ''}
                <div class="relative w-4 h-4 ${severity === 'CRITICAL' ? 'bg-red-600' : 'bg-blue-600'} rounded-full border-[3px] border-slate-900 drop-shadow-md"></div>
               </div>`
    });
};

const resourceIcon = L.divIcon({
    className: 'resource-icon',
    html: `<div class="w-4 h-4 bg-blue-500 rounded shadow-sm border border-white"></div>`
});

const ViewportTracker = ({ onViewport }) => {
    useMapEvents({
        moveend: (e) => {
            const map = e.target;
            const b = map.getBounds();
            onViewport({
                zoom: map.getZoom(),
                bounds: { south: b.getSouth(), west: b.getWest(), north: b.getNorth(), east: b.getEast() }
            });
        },
        zoomend: (e) => {
            const map = e.target;
            const b = map.getBounds();
            onViewport({
                zoom: map.getZoom(),
                bounds: { south: b.getSouth(), west: b.getWest(), north: b.getNorth(), east: b.getEast() }
            });
        },
    });
    return null;
};

const inBounds = (bounds, lat, lng) => {
    if (!bounds) return true;
    return lat >= bounds.south && lat <= bounds.north && lng >= bounds.west && lng <= bounds.east;
};

const sampleByGrid = (items, getLatLng, gridDeg, maxItems, bounds) => {
    if (!Array.isArray(items) || items.length === 0) return [];
    const out = [];
    const used = new Set();

    for (const item of items) {
        const p = getLatLng(item);
        const lat = p?.lat;
        const lng = p?.lng;
        if (typeof lat !== 'number' || typeof lng !== 'number') continue;
        if (!inBounds(bounds, lat, lng)) continue;

        const gx = Math.floor((lat + 90) / gridDeg);
        const gy = Math.floor((lng + 180) / gridDeg);
        const key = `${gx}:${gy}`;
        if (used.has(key)) continue;
        used.add(key);

        out.push(item);
        if (out.length >= maxItems) break;
    }

    return out;
};

const MapWidget = ({ fullScreen = false }) => {
    const { incidents, resources, externalEvents, uiPrefs } = useAppState();
    const center = [28.6139, 77.2090]; 
    const [viewport, setViewport] = useState({ zoom: 3, bounds: null });
    const onViewport = useCallback((v) => setViewport(v), []);

    const density = uiPrefs?.mapDensity || 'balanced';
    const densityCfg = useMemo(() => {
        if (density === 'minimal') return { gridBase: 6, maxExternal: 140 };
        if (density === 'full') return { gridBase: 2.5, maxExternal: 700 };
        return { gridBase: 4, maxExternal: 260 }; // balanced
    }, [density]);

    const gridDeg = useMemo(() => {
        const z = viewport?.zoom ?? 3;
        if (z >= 8) return Math.max(0.35, densityCfg.gridBase / 8);
        if (z >= 6) return Math.max(0.5, densityCfg.gridBase / 5);
        if (z >= 5) return Math.max(0.8, densityCfg.gridBase / 3.5);
        return densityCfg.gridBase;
    }, [densityCfg.gridBase, viewport?.zoom]);

    const visibleEonet = useMemo(() => {
        const items = externalEvents?.eonet || [];
        return sampleByGrid(items, (e) => ({ lat: e.coordinates?.[1], lng: e.coordinates?.[0] }), gridDeg, densityCfg.maxExternal, viewport?.bounds);
    }, [externalEvents?.eonet, densityCfg.maxExternal, gridDeg, viewport?.bounds]);

    const visibleGdacs = useMemo(() => {
        const items = externalEvents?.gdacs || [];
        return sampleByGrid(items, (e) => ({ lat: e.coordinates?.[1], lng: e.coordinates?.[0] }), gridDeg, Math.floor(densityCfg.maxExternal * 0.8), viewport?.bounds);
    }, [externalEvents?.gdacs, densityCfg.maxExternal, gridDeg, viewport?.bounds]);

    const visibleUsgs = useMemo(() => {
        const items = externalEvents?.usgs || [];
        return sampleByGrid(items, (e) => ({ lat: e.coordinates?.[1], lng: e.coordinates?.[0] }), gridDeg, Math.floor(densityCfg.maxExternal * 1.1), viewport?.bounds);
    }, [externalEvents?.usgs, densityCfg.maxExternal, gridDeg, viewport?.bounds]);

    // State Coordinate Dictionary for OpenFEMA geometry routing
    const stateCoords = {
        "AL": [32.8066, -86.7911], "AK": [61.3707, -152.4044], "AZ": [33.7298, -111.4312], "AR": [34.9697, -92.3731],
        "CA": [36.1162, -119.6816], "CO": [39.0598, -105.3111], "CT": [41.5978, -72.7554], "DE": [39.3185, -75.5071],
        "FL": [27.7663, -81.6868], "GA": [33.0406, -83.6431], "HI": [21.0943, -157.4983], "ID": [44.2405, -114.4788],
        "IL": [40.3495, -88.9861], "IN": [39.8494, -86.2583], "IA": [42.0115, -93.2105], "KS": [38.5266, -96.7265],
        "KY": [37.6681, -84.6701], "LA": [31.1695, -91.8678], "ME": [44.6939, -69.3819], "MD": [39.0639, -76.8021],
        "MA": [42.2302, -71.5301], "MI": [43.3266, -84.5361], "MN": [45.6945, -93.9002], "MS": [32.7416, -89.6787],
        "MO": [38.4561, -92.2884], "MT": [46.9219, -110.4544], "NE": [41.1254, -98.2681], "NV": [38.3135, -117.0554],
        "NH": [43.4525, -71.5639], "NJ": [40.2989, -74.5210], "NM": [34.8405, -106.2485], "NY": [42.1657, -74.9481],
        "NC": [35.6301, -79.8064], "ND": [47.5289, -99.7840], "OH": [40.3888, -82.7649], "OK": [35.5653, -96.9289],
        "OR": [44.5720, -122.0709], "PA": [40.5908, -77.2098], "RI": [41.6809, -71.5118], "SC": [33.8569, -80.9450],
        "SD": [44.2998, -99.4388], "TN": [35.7478, -86.6923], "TX": [31.0545, -97.5635], "UT": [40.1500, -111.8624],
        "VT": [44.0459, -72.7107], "VA": [37.7693, -78.1700], "WA": [47.3826, -120.4472], "WV": [38.4912, -80.9545],
        "WI": [44.2685, -89.6165], "WY": [43.0760, -107.2903]
    };

    const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_KEY;

    return (
        <div className="relative w-full h-full">
            <MapContainer 
                center={center} 
                zoom={3} 
                scrollWheelZoom={fullScreen} 
                className={`w-full ${fullScreen ? 'h-full' : 'h-full bg-slate-900'}`}
                style={{ minHeight: fullScreen ? '100%' : '100%', zIndex: 1 }}
            >
                <ViewportTracker onViewport={onViewport} />
                <LayersControl position="topright">
                    
                    {/* 1. Base Maps */}
                    <LayersControl.BaseLayer checked name="Satellite Intelligence">
                        <LayerGroup>
                            <TileLayer
                                attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                            />
                            {/* Adding the Boundary & Places labels overlay to the satellite feed */}
                            <TileLayer
                                url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                            />
                        </LayerGroup>
                    </LayersControl.BaseLayer>
                    <LayersControl.BaseLayer name="Standard Tactical (Light)">
                        <TileLayer
                            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                        />
                    </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Night Vision (Dark)">
                    <TileLayer
                        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />
                </LayersControl.BaseLayer>

                {/* 2. Global Weather Radar Overlays */}
                {OPENWEATHER_API_KEY && (
                    <>
                        <LayersControl.Overlay checked name="🌧️ Rain / Precipitation Radar">
                            <TileLayer
                                url={`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`}
                                opacity={0.65}
                            />
                        </LayersControl.Overlay>
                        <LayersControl.Overlay name="🌡️ Temperature Heatmap">
                            <TileLayer
                                url={`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`}
                                opacity={0.5}
                            />
                        </LayersControl.Overlay>
                        <LayersControl.Overlay name="💨 Wind Speed Radar">
                            <TileLayer
                                url={`https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`}
                                opacity={0.5}
                            />
                        </LayersControl.Overlay>
                    </>
                )}

                {/* 3. Event / Incident Point Layers */}
                <LayersControl.Overlay checked name={`Local Agency Operations (${incidents.length})`}>
                    <LayerGroup>
                        {incidents.map(inc => (
                            <Marker 
                                key={inc.id} 
                                position={[inc.lat, inc.lng]} 
                                icon={createMarkerIcon(inc.type, inc.severity, !!uiPrefs?.reduceMotion)}
                            >
                                <Popup className="custom-popup">
                                    <div className="p-1 min-w-[150px]">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-bold text-sm text-slate-800">{inc.type}</h3>
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-white ${inc.severity === 'CRITICAL' ? 'bg-red-600' : 'bg-slate-500'}`}>
                                                {inc.severity.substring(0,1)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 mb-2">{inc.locationName}</p>
                                        <p className="text-xs text-slate-700 leading-tight border-t border-slate-100 pt-1">{inc.description}</p>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                        {resources.map(res => (
                            <Marker
                                key={res.id}
                                position={[res.lat, res.lng]}
                                icon={resourceIcon}
                            >
                                 <Popup>
                                    <div className="text-xs font-medium text-slate-700">
                                        {res.type}: {res.quantity} units
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </LayerGroup>
                </LayersControl.Overlay>
            
                <LayersControl.Overlay checked name={`NASA EONET Tracker (${visibleEonet.length})`}>
                    <LayerGroup>
                        {visibleEonet.map(event => (
                            <Marker 
                                key={event.id} 
                                position={[event.coordinates[1], event.coordinates[0]]} 
                                icon={createMarkerIcon(event.categories?.[0] || 'EONET', 'HIGH', !!uiPrefs?.reduceMotion)}
                            >
                                <Popup className="custom-popup">
                                    <div className="p-1 min-w-[150px]">
                                        <h3 className="font-bold text-sm text-amber-600 mb-1">NASA: {event.categories?.[0] || 'Event'}</h3>
                                        <p className="text-xs text-slate-700 leading-tight border-t border-slate-100 pt-1">{event.title}</p>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </LayerGroup>
                </LayersControl.Overlay>

                <LayersControl.Overlay checked name={`GDACS Severe Alerts (${visibleGdacs.length})`}>
                    <LayerGroup>
                        {visibleGdacs.map(event => (
                            <Marker 
                                key={event.id} 
                                position={[event.coordinates[1], event.coordinates[0]]} 
                                icon={createMarkerIcon(event.type, event.severity === 'Red' ? 'CRITICAL' : 'HIGH', !!uiPrefs?.reduceMotion)}
                            >
                                <Popup className="custom-popup">
                                    <div className="p-1 min-w-[150px]">
                                        <h3 className="font-bold text-sm text-red-600 mb-1">GDACS: {event.type}</h3>
                                        <p className="text-xs text-slate-700 leading-tight border-t border-slate-100 pt-1">{event.title}</p>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </LayerGroup>
                </LayersControl.Overlay>

                <LayersControl.Overlay checked name={`USGS Earthquakes (${visibleUsgs.length})`}>
                    <LayerGroup>
                        {visibleUsgs.map(eq => (
                            <CircleMarker
                                key={eq.id}
                                center={[eq.coordinates[1], eq.coordinates[0]]}
                                radius={Math.max(eq.mag * 2.5, 4)}
                                fillColor={eq.mag > 5 ? '#ef4444' : eq.mag > 4 ? '#f59e0b' : '#3b82f6'}
                                color="white"
                                weight={1}
                                fillOpacity={0.6}
                            >
                                <Popup className="custom-popup">
                                    <div className="p-1">
                                        <h3 className="font-bold text-sm text-amber-700 mb-1">Magnitude {eq.mag}</h3>
                                        <p className="text-xs text-slate-700">{eq.title}</p>
                                    </div>
                                </Popup>
                            </CircleMarker>
                        ))}
                    </LayerGroup>
                </LayersControl.Overlay>

                <LayersControl.Overlay checked name={`U.S. Federal Disasters (FEMA) (${(externalEvents?.fema || []).length})`}>
                    <LayerGroup>
                        {(externalEvents?.fema || []).filter(f => stateCoords[f.state]).map(fema => (
                            <Marker 
                                key={fema.id} 
                                position={stateCoords[fema.state]} 
                                icon={createMarkerIcon('INFRASTRUCTURE', 'HIGH', !!uiPrefs?.reduceMotion)}
                            >
                                <Popup className="custom-popup">
                                    <div className="p-1 min-w-[150px]">
                                        <h3 className="font-bold text-sm text-amber-600 mb-1">FEMA: {fema.state}</h3>
                                        <p className="text-xs text-slate-700 leading-tight border-t border-slate-100 pt-1 font-bold">{fema.title}</p>
                                        <p className="text-[10px] text-slate-500">{fema.type}</p>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </LayerGroup>
                </LayersControl.Overlay>

            </LayersControl>
        </MapContainer>

        {/* HIGH-TECH HUD LEGEND */}
        <div className="absolute bottom-4 left-4 z-[400] bg-slate-900/80 backdrop-blur-md border border-slate-700/50 p-4 rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.5)] text-xs text-slate-200 pointer-events-none w-64 ring-1 ring-white/10">
            <div className="font-bold mb-3 text-slate-400 uppercase tracking-widest text-[10px] border-b border-slate-700/50 pb-2">Global Signal Index</div>
            
            <div className="space-y-2.5">
                {/* Local Feed */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full bg-red-600 border border-slate-900 shadow-[0_0_8px_rgba(220,38,38,0.8)] animate-pulse"></span> 
                        <span className="font-medium text-slate-300">Critical Threat</span>
                    </div>
                    <span className="text-[9px] text-slate-500">LOCAL</span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-sm rotate-45 bg-amber-500 border border-slate-900 shadow-[0_0_8px_rgba(245,158,11,0.6)]"></span> 
                        <span className="font-medium text-slate-300">Infrastructure</span>
                    </div>
                    <span className="text-[9px] text-slate-500">LOCAL</span>
                </div>

                {/* External Feeds */}
                <div className="flex items-center justify-between mt-4 pt-2 border-t border-slate-800">
                    <div className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full bg-blue-500 border border-slate-900 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></span> 
                        <span className="font-medium text-slate-300">USGS Earthquake</span>
                    </div>
                    <span className="text-[9px] text-blue-500 font-bold">GLOBAL</span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full bg-orange-600 border border-slate-900 shadow-[0_0_8px_rgba(234,88,12,0.8)]"></span> 
                        <span className="font-medium text-slate-300">NASA EONET Alert</span>
                    </div>
                    <span className="text-[9px] text-amber-500 font-bold">NASA</span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-none bg-amber-500 border border-slate-900 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span> 
                        <span className="font-medium text-slate-300">FEMA Declaration</span>
                    </div>
                    <span className="text-[9px] text-red-500 font-bold">FED</span>
                </div>
            </div>
        </div>
    </div>
    );
};

export default MapWidget;
