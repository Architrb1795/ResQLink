import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppState } from '../../context/AppStateContext';
import L from 'leaflet';

// Utility to create colored SVG markers string
const createMarkerIcon = (type, severity) => {
    let color = '#3b82f6'; // Default blue
    let shape = 'circle';
    let pulse = false;

    if (severity === 'CRITICAL') {
        color = '#ef4444'; // Red
        pulse = true;
    } else if (severity === 'HIGH') {
        color = '#f97316'; // Orange
    }

    // Semantic Shapes based on Type
    if (type === 'FIRE') return L.divIcon({
        className: 'custom-icon',
        html: `<div class="relative flex items-center justify-center w-8 h-8">
                ${pulse ? '<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>' : ''}
                <div class="relative w-6 h-6 bg-red-600 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white text-[10px] font-bold">F</div>
               </div>`
    });

    if (type === 'MEDICAL') return L.divIcon({
        className: 'custom-icon',
        html: `<div class="relative flex items-center justify-center w-8 h-8">
                <div class="relative w-6 h-6 bg-green-600 rounded-sm rotate-45 border-2 border-white shadow-md flex items-center justify-center text-white text-[10px] font-bold -rotate-45">+</div>
               </div>`
    });

    if (type === 'INFRASTRUCTURE') return L.divIcon({
        className: 'custom-icon',
        html: `<div class="relative flex items-center justify-center w-8 h-8">
                <div class="relative w-6 h-6 bg-orange-500 rounded-none border-2 border-white shadow-md flex items-center justify-center text-white text-[10px] font-bold">!</div>
               </div>`
    });

    // Default Circle for others
    return L.divIcon({
        className: 'custom-icon',
        html: `<div class="relative flex items-center justify-center w-6 h-6">
                ${pulse ? `<span class="animate-ping absolute inline-flex h-full w-full rounded-full ${severity === 'CRITICAL' ? 'bg-red-400' : 'bg-blue-400'} opacity-75"></span>` : ''}
                <div class="relative w-4 h-4 ${severity === 'CRITICAL' ? 'bg-red-600' : 'bg-blue-600'} rounded-full border-2 border-white shadow-sm"></div>
               </div>`
    });
};

const resourceIcon = L.divIcon({
    className: 'resource-icon',
    html: `<div class="w-4 h-4 bg-blue-500 rounded shadow-sm border border-white"></div>`
});

const MapWidget = ({ fullScreen = false }) => {
    const { incidents, resources } = useAppState();
    const center = [28.6139, 77.2090]; 

    return (
        <MapContainer 
            center={center} 
            zoom={13} 
            scrollWheelZoom={fullScreen} 
            className={`w-full ${fullScreen ? 'h-full' : 'h-full bg-slate-100'}`}
            style={{ minHeight: fullScreen ? '100%' : '100%' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            
            {incidents.map(inc => (
                <Marker 
                    key={inc.id} 
                    position={[inc.lat, inc.lng]} 
                    icon={createMarkerIcon(inc.type, inc.severity)}
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
        </MapContainer>
    );
};

export default MapWidget;
