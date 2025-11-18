import React, { useEffect, useRef } from 'react';
import { SystemLog } from '../types';
import clsx from 'clsx';

interface SystemLogsProps {
  logs: SystemLog[];
}

export const SystemLogs: React.FC<SystemLogsProps> = ({ logs }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="h-32 bg-black border-t border-arctic-700 flex flex-col font-mono text-xs">
      <div className="bg-arctic-800 px-4 py-1 text-[10px] text-slate-400 uppercase tracking-wider flex justify-between">
        <span>System Console</span>
        <span>v2.1.0-stable</span>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {logs.map((log) => (
          <div key={log.id} className="flex space-x-3 opacity-80 hover:opacity-100">
            <span className="text-slate-500 w-24 shrink-0">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
            <span className={clsx(
                "uppercase font-bold w-16 shrink-0",
                log.level === 'info' && "text-cyan-600",
                log.level === 'warn' && "text-amber-500",
                log.level === 'error' && "text-red-500",
                log.level === 'success' && "text-emerald-500",
            )}>{log.level}</span>
            <span className="text-slate-300">{log.message}</span>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
};