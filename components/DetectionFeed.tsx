import React from 'react';
import { Detection } from '../types';
import { AlertTriangle, Crosshair, Clock, Skull } from 'lucide-react';
import clsx from 'clsx';

interface DetectionFeedProps {
  detections: Detection[];
}

export const DetectionFeed: React.FC<DetectionFeedProps> = ({ detections }) => {
  return (
    <div className="flex flex-col h-full bg-arctic-800 border-l border-arctic-700 w-80 flex-shrink-0">
      <div className="p-4 border-b border-arctic-700 bg-arctic-800">
        <h2 className="text-sm font-bold text-arctic-400 uppercase tracking-wider mb-1">Intelligence Feed</h2>
        <div className="flex justify-between items-center text-xs text-slate-500 font-mono">
           <span>LIVE STREAM</span>
           <span className="animate-pulse w-2 h-2 rounded-full bg-red-500"></span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-0">
        {detections.length === 0 ? (
            <div className="p-8 text-center text-slate-600 text-xs font-mono">
                NO ACTIVITY DETECTED
            </div>
        ) : (
            detections.map((det) => (
                <DetectionItem key={det.id} detection={det} />
            ))
        )}
      </div>
    </div>
  );
};

const DetectionItem: React.FC<{ detection: Detection }> = ({ detection }) => {
    const timeStr = new Date(detection.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const isHostile = detection.class === 'hostile_vip';
    
    return (
        <div className={clsx(
            "p-3 border-b transition-colors cursor-pointer group",
            isHostile ? "bg-red-950/30 border-red-900 hover:bg-red-900/40" : "border-arctic-700/50 hover:bg-arctic-700/30",
            detection.isNew && !isHostile && "bg-arctic-700/20 border-l-2 border-l-arctic-500"
        )}>
            <div className="flex justify-between items-start mb-1">
                <div className="flex items-center space-x-2">
                    {isHostile && <Skull className="w-3 h-3 text-red-500 animate-pulse" />}
                    <span className={clsx(
                        "text-xs font-bold uppercase",
                        isHostile ? "text-red-500" : detection.confidence > 0.8 ? "text-arctic-400" : "text-slate-400"
                    )}>
                        {detection.class === 'hostile_vip' ? 'HOSTILE HVT' : detection.class}
                    </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {timeStr}
                </span>
            </div>
            
            <div className="flex justify-between items-end">
                <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-mono">ID: {detection.nodeId}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                        {detection.location.lat.toFixed(4)}, {detection.location.lng.toFixed(4)}
                    </span>
                </div>
                <div className={clsx(
                    "flex items-center space-x-1 px-1.5 py-0.5 rounded",
                    isHostile ? "bg-red-900/50" : "bg-arctic-900"
                )}>
                    <Crosshair className={clsx("w-3 h-3", isHostile ? "text-red-500" : "text-arctic-500")} />
                    <span className={clsx("text-xs font-mono", isHostile ? "text-red-500" : "text-arctic-500")}>{(detection.confidence * 100).toFixed(0)}%</span>
                </div>
            </div>
        </div>
    );
}