
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { Icon, DivIcon } from 'leaflet';
import { SentinelNode, Detection, NodeStatus, Target } from '../types';
import { MAP_CENTER, MAP_ZOOM } from '../constants';

interface TacticalMapProps {
  nodes: SentinelNode[];
  detections: Detection[];
  target?: Target | null;
}

// Create custom icons using simple SVG strings encoded in data URIs or CSS classes
const createNodeIcon = (status: NodeStatus) => {
  let color = '#10b981'; // Emerald 500 (Online)
  let pulseClass = '';

  if (status === NodeStatus.BLACKOUT) {
    color = '#f59e0b'; // Amber (Blackout)
    pulseClass = 'opacity-50';
  } else if (status === NodeStatus.OFFLINE) {
    color = '#ef4444'; // Red
  } else if (status === NodeStatus.RESUMING) {
    color = '#3b82f6'; // Blue
  }

  const html = `
    <div class="relative flex items-center justify-center w-6 h-6 ${pulseClass}">
        <div class="absolute w-full h-full rounded-full opacity-30 animate-ping" style="background-color: ${color}"></div>
        <div class="relative w-3 h-3 rounded-full border-2 border-white" style="background-color: ${color}"></div>
    </div>
  `;

  return new DivIcon({
    html,
    className: 'bg-transparent',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

const getDetectionIcon = (type: string) => {
    if (type === 'hostile_vip') {
        return new DivIcon({
            html: `
                <div class="relative flex items-center justify-center w-8 h-8">
                    <div class="absolute w-full h-full rounded-full bg-red-500/30 animate-ping"></div>
                    <div class="relative w-6 h-6 bg-red-600 border-2 border-red-950 rounded flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
                        !
                    </div>
                </div>
            `,
            className: 'bg-transparent',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });
    }

    return new DivIcon({
        html: `<div class="w-2 h-2 bg-red-500 rounded-full border border-white opacity-80"></div>`,
        className: 'bg-transparent',
        iconSize: [8, 8]
    });
}

const getTargetIcon = () => {
    // Using a direct URL to a Putin image for the requested "Big Face" effect.
    // Fallback to a red circle if image fails (handled by browser mostly, but keeping HTML simple)
    const faceUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Vladimir_Putin_%282024-06-19%29.jpg/220px-Vladimir_Putin_%282024-06-19%29.jpg";
    
    return new DivIcon({
        html: `
            <div class="relative w-16 h-16">
                <div class="absolute inset-0 rounded-full border-2 border-red-500 bg-black overflow-hidden shadow-[0_0_15px_rgba(239,68,68,0.8)]">
                    <img src="${faceUrl}" class="w-full h-full object-cover" alt="Target" />
                </div>
                <div class="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    PRIORITY TARGET
                </div>
            </div>
        `,
        className: 'bg-transparent',
        iconSize: [64, 64],
        iconAnchor: [32, 32]
    });
}

export const TacticalMap: React.FC<TacticalMapProps> = ({ nodes, detections, target }) => {
  return (
    <div className="w-full h-full bg-arctic-900 relative z-0">
      <MapContainer 
        center={MAP_CENTER as [number, number]} 
        zoom={MAP_ZOOM} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
        attributionControl={false}
      >
        {/* Dark Matter Map Style */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Render Nodes */}
        {nodes.map(node => (
          <React.Fragment key={node.id}>
             <Marker 
                position={[node.location.lat, node.location.lng]} 
                icon={createNodeIcon(node.status)}
             >
               <Popup className="tactical-popup">
                 <div className="p-1">
                    <strong className="block text-sm uppercase">{node.name}</strong>
                    <span className="text-xs font-mono text-slate-500">{node.status}</span>
                 </div>
               </Popup>
             </Marker>
             {/* Range Ring for Sensor Coverage */}
             <Circle 
                center={[node.location.lat, node.location.lng]}
                radius={50000} // 50km range mock
                pathOptions={{ 
                    color: node.status === NodeStatus.BLACKOUT ? '#f59e0b' : '#06b6d4', 
                    fillColor: node.status === NodeStatus.BLACKOUT ? '#f59e0b' : '#06b6d4', 
                    fillOpacity: 0.05,
                    weight: 1,
                    dashArray: node.status === NodeStatus.BLACKOUT ? '5, 5' : undefined 
                }} 
             />
          </React.Fragment>
        ))}

        {/* Render Recent Detections */}
        {detections.map(det => (
             <Marker 
                key={det.id}
                position={[det.location.lat, det.location.lng]}
                icon={getDetectionIcon(det.class)}
                zIndexOffset={det.class === 'hostile_vip' ? 1000 : 0}
             >
                <Popup>
                    <div className="text-xs">
                        <strong className={det.class === 'hostile_vip' ? "text-red-600 font-black uppercase text-sm" : "uppercase"}>
                            {det.class === 'hostile_vip' ? 'HOSTILE HVT DETECTED' : det.class}
                        </strong><br/>
                        {(det.confidence * 100).toFixed(0)}% Confidence<br/>
                        <span className="text-slate-500">{det.timestamp}</span>
                    </div>
                </Popup>
             </Marker>
        ))}

        {/* Render Ground Truth Target (The Sneaky Vlad) */}
        {target && (
            <Marker 
                position={[target.lat, target.lng]}
                icon={getTargetIcon()}
                zIndexOffset={2000} // Always on top
            >
                 <Popup>
                    <div className="text-xs text-red-500 font-bold uppercase">
                        GROUND TRUTH: {target.name}
                        <div className="text-slate-400 font-normal mt-1">Moving at 12km/h</div>
                    </div>
                </Popup>
            </Marker>
        )}

      </MapContainer>
      
      {/* Map Overlay Elements */}
      <div className="absolute bottom-4 left-4 z-[1000] pointer-events-none">
         <div className="bg-arctic-900/80 backdrop-blur border border-arctic-700 p-2 rounded text-[10px] font-mono text-arctic-500">
            <div>LAT: 70.5234 N</div>
            <div>LNG: 100.8765 W</div>
            <div>SCALE: 1:500000</div>
         </div>
      </div>
    </div>
  );
};
