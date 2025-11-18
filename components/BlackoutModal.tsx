import React, { useState } from 'react';
import { SentinelNode } from '../types';
import { AlertTriangle, X, EyeOff } from 'lucide-react';

interface BlackoutModalProps {
  node: SentinelNode | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (nodeId: string, reason: string) => void;
  isDeactivating?: boolean;
}

export const BlackoutModal: React.FC<BlackoutModalProps> = ({ node, isOpen, onClose, onConfirm, isDeactivating }) => {
  const [reason, setReason] = useState('');

  if (!isOpen || !node) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(node.id, reason);
    setReason('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-black/80 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-arctic-900 border border-arctic-700 w-96 shadow-2xl shadow-black rounded-lg overflow-hidden">
        <div className="bg-arctic-800 p-4 border-b border-arctic-700 flex justify-between items-center">
          <h3 className="text-slate-100 font-bold uppercase flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-arctic-warn" />
            <span>Blackout Protocol</span>
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4 text-slate-300 text-sm">
            <p className="mb-2">Target Node: <span className="font-mono text-arctic-500 font-bold">{node.name}</span></p>
            <p className="text-slate-400 text-xs">
                {isDeactivating 
                    ? "Deactivating will immediately trigger burst transmission of all queued intelligence."
                    : "Activating will cease all external RF transmission. Inference will continue locally and data will be queued."
                }
            </p>
          </div>

          {!isDeactivating && (
              <div className="mb-4">
                <label className="block text-xs uppercase text-slate-500 mb-1">Tactical Justification</label>
                <textarea 
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full bg-black border border-arctic-700 rounded p-2 text-sm text-slate-200 focus:border-arctic-500 focus:outline-none h-24"
                    placeholder="e.g. Suspected hostile EW activity..."
                />
              </div>
          )}

          <div className="flex justify-end space-x-3">
            <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-200"
            >
                CANCEL
            </button>
            <button 
                type="submit"
                className={`px-4 py-2 text-xs font-bold text-black rounded flex items-center space-x-2 ${isDeactivating ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-arctic-warn hover:bg-amber-400'}`}
            >
                {isDeactivating ? (
                    <span>INITIATE BURST</span>
                ) : (
                    <>
                        <EyeOff className="w-3 h-3" />
                        <span>ENGAGE BLACKOUT</span>
                    </>
                )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};