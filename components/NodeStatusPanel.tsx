import React, { useState } from 'react';
import { SentinelNode, NodeStatus } from '../types';
import { Battery, Thermometer, Wifi, WifiOff, EyeOff, Activity, HardDriveDownload, Database } from 'lucide-react';
import clsx from 'clsx';

interface NodeStatusPanelProps {
  nodes: SentinelNode[];
  onToggleBlackout: (node: SentinelNode) => void;
}

export const NodeStatusPanel: React.FC<NodeStatusPanelProps> = ({ nodes, onToggleBlackout }) => {
  return (
    <div className="flex flex-col h-full bg-arctic-800 border-r border-arctic-700 w-80 flex-shrink-0">
      <div className="p-4 border-b border-arctic-700 bg-arctic-800">
        <h2 className="text-sm font-bold text-arctic-400 uppercase tracking-wider mb-1">Edge Assets</h2>
        <div className="flex justify-between items-center text-xs text-slate-500 font-mono">
            <span>{nodes.length} UNITS DEPLOYED</span>
            <span>{(nodes.filter(n => n.status === NodeStatus.ONLINE).length / nodes.length * 100).toFixed(0)}% OPS</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {nodes.map(node => (
          <NodeCard key={node.id} node={node} onToggleBlackout={() => onToggleBlackout(node)} />
        ))}
      </div>
    </div>
  );
};

const NodeCard: React.FC<{ node: SentinelNode; onToggleBlackout: () => void }> = ({ node, onToggleBlackout }) => {
  const isOnline = node.status === NodeStatus.ONLINE;
  const isBlackout = node.status === NodeStatus.BLACKOUT;
  const isResuming = node.status === NodeStatus.RESUMING;

  return (
    <div className={clsx(
      "relative rounded p-3 border transition-all duration-200 group",
      isBlackout ? "bg-arctic-900/50 border-arctic-warn/30" : 
      isResuming ? "bg-blue-900/20 border-blue-500/50" :
      "bg-arctic-900 border-arctic-700 hover:border-arctic-500"
    )}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-2">
            {isBlackout ? (
                <EyeOff className="w-4 h-4 text-arctic-warn animate-pulse" />
            ) : isResuming ? (
                <HardDriveDownload className="w-4 h-4 text-blue-400 animate-bounce" />
            ) : (
                <Activity className="w-4 h-4 text-emerald-500" />
            )}
            <span className={clsx("font-bold text-sm", isBlackout ? "text-arctic-warn" : "text-slate-200")}>
                {node.name}
            </span>
        </div>
        <span className={clsx(
            "text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border",
            isBlackout ? "bg-arctic-warn/10 border-arctic-warn/30 text-arctic-warn" :
            isResuming ? "bg-blue-500/10 border-blue-500/30 text-blue-400" :
            "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
        )}>
            {isResuming ? 'BURST TX' : node.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-400 mb-3">
        <div className="flex items-center space-x-1">
            <Battery className={clsx("w-3 h-3", node.batteryLevel < 20 && "text-red-500")} />
            <span>{node.batteryLevel.toFixed(0)}%</span>
        </div>
        <div className="flex items-center space-x-1">
            <Thermometer className="w-3 h-3" />
            <span>{node.temperature.toFixed(1)}°C</span>
        </div>
        <div className="flex items-center space-x-1 col-span-2">
            {isBlackout ? <WifiOff className="w-3 h-3 text-slate-600" /> : <Wifi className="w-3 h-3" />}
            <span className="truncate">{node.ipAddress}</span>
        </div>
      </div>

      {(isBlackout || isResuming || node.queuedDetections > 0) && (
         <div className={clsx(
             "mb-3 p-2 rounded border transition-colors duration-300",
             isResuming ? "bg-blue-500/20 border-blue-500/40" : "bg-arctic-warn/10 border-arctic-warn/20"
         )}>
            <div className={clsx(
                "text-[10px] font-mono flex justify-between items-center",
                isResuming ? "text-blue-300" : "text-arctic-warn"
            )}>
                <div className="flex items-center space-x-1">
                    <Database className="w-3 h-3" />
                    <span>LOCAL QUEUE</span>
                </div>
                <span className="font-bold text-sm">{node.queuedDetections}</span>
            </div>
            {isResuming && (
                <div className="w-full bg-blue-900/50 h-1 mt-2 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400 animate-pulse w-full"></div>
                </div>
            )}
         </div>
      )}

      <button 
        onClick={onToggleBlackout}
        disabled={isResuming}
        className={clsx(
            "w-full py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-colors",
            isResuming ? "opacity-50 cursor-not-allowed bg-slate-800 text-slate-500 border-slate-700" :
            isBlackout 
                ? "bg-emerald-900/40 text-emerald-400 border border-emerald-800 hover:bg-emerald-800/50" 
                : "bg-arctic-warn/10 text-arctic-warn border border-arctic-warn/20 hover:bg-arctic-warn/20"
        )}
      >
        {isBlackout ? "Deactivate Protocol" : "Init Blackout"}
      </button>
    </div>
  );
};