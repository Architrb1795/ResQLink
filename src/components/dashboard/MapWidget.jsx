import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppState } from '../../context/AppStateContext';
import L from 'leaflet';

// Fix for default Leaflet icon not finding images in Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const SEVERITY_COLORS = {
    CRITICAL: '#D93025', // Red
    HIGH: '#F9AB00', // Amber/Orange
    MEDIUM: '#F9AB00',
    LOW: '#188038', // Green
};

const MapWidget = ({ fullScreen = false }) => {
    const { incidents, resources } = useAppState();

    const center = [28.6139, 77.2090]; // Centered on New Delhi for demo

    return (
        <MapContainer 
            center={center} 
            zoom={13} 
            scrollWheelZoom={fullScreen} 
            className={`w-full ${fullScreen ? 'h-full' : 'h-full'}`}
            style={{ zIndex: 0 }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Incident Markers (Pulse effect for Critical) */}
            {incidents.map(inc => (
                <React.Fragment key={inc.id}>
                    {inc.severity === 'CRITICAL' && (
                        <CircleMarker 
                            center={[inc.lat, inc.lng]} 
                            radius={20} 
                            pathOptions={{ color: SEVERITY_COLORS[inc.severity], fillColor: SEVERITY_COLORS[inc.severity], fillOpacity: 0.2, stroke: false }}
                            className="animate-pulse"
                        />
                    )}
                    <CircleMarker 
                        center={[inc.lat, inc.lng]} 
                        radius={8} 
                        pathOptions={{ 
                            color: 'white', 
                            fillColor: SEVERITY_COLORS[inc.severity] || 'gray', 
                            fillOpacity: 1, 
                            weight: 2 
                        }}
                    >
                        <Popup>
                            <div className="p-1">
                                <h3 className="font-bold text-sm mb-1">{inc.type}</h3>
                                <div className="text-xs text-slate-600 mb-2">{inc.locationName}</div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white bg-slate-800`}>
                                    {inc.severity}
                                </span>
                            </div>
                        </Popup>
                    </CircleMarker>
                </React.Fragment>
            ))}

            {/* Resource Markers (Different Visuals) */}
            {resources.map(res => (
                <CircleMarker
                    key={res.id}
                    center={[res.lat, res.lng]}
                    radius={5}
                    pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.6, weight: 1 }}
                >
                     <Popup>
                        <div className="text-xs">
                            <strong>{res.type}</strong>: {res.quantity} {res.unit}
                        </div>
                    </Popup>
                </CircleMarker>
            ))}
        </MapContainer>
    );
};

export default MapWidget;
