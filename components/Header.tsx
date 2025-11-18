import React from 'react';
import { Shield, Radio, Wifi, User } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-arctic-900 border-b border-arctic-700 h-16 flex items-center justify-between px-6 select-none">
      <div className="flex items-center space-x-4">
        <div className="flex items-center justify-center w-10 h-10 bg-arctic-800 rounded border border-arctic-700">
          <Shield className="w-6 h-6 text-arctic-500" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-widest text-slate-100">SENTINEL v2</h1>
          <div className="flex items-center space-x-2 text-xs text-arctic-500 font-mono">
             <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-arctic-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-arctic-500"></span>
            </span>
            <span>SYSTEM ONLINE // ARCTIC SECTOR</span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2 px-3 py-1 rounded bg-arctic-800/50 border border-arctic-700/50">
            <Radio className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-mono text-slate-300">SATCOM: CONNECTED</span>
        </div>
        <div className="flex items-center space-x-2 px-3 py-1 rounded bg-arctic-800/50 border border-arctic-700/50">
            <Wifi className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-mono text-slate-300">BANDWIDTH: LOW</span>
        </div>
        <div className="flex items-center space-x-2 pl-4 border-l border-arctic-700">
          <User className="w-5 h-5 text-arctic-500" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-200">CPT. SHEPARD</span>
            <span className="text-[10px] font-mono text-slate-500">COMMANDER</span>
          </div>
        </div>
      </div>
    </header>
  );
};