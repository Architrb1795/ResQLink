import React from 'react';
import MapWidget from '../components/dashboard/MapWidget';

const CrisisMap = () => {
    return (
        <div className="h-[calc(100vh-140px)] bg-surface rounded-lg border border-border shadow-sm overflow-hidden relative">
             <MapWidget fullScreen={true} />
              <div className="absolute top-4 right-4 z-[400] bg-white p-2 rounded shadow text-xs">
                 <div className="font-bold mb-1">Legend</div>
                 <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-600"></span> Critical</div>
                 <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-500"></span> High</div>
                 <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500"></span> Medium</div>
                 <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-600"></span> Resources</div>
             </div>
        </div>
    );
};

export default CrisisMap;
