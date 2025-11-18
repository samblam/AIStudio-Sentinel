
import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { NodeStatusPanel } from './components/NodeStatusPanel';
import { DetectionFeed } from './components/DetectionFeed';
import { TacticalMap } from './components/TacticalMap';
import { SystemLogs } from './components/SystemLogs';
import { BlackoutModal } from './components/BlackoutModal';
import { mockBackend } from './services/mockBackend';
import { SentinelNode, Detection, SystemLog, NodeStatus, Target } from './types';

function App() {
  // State
  const [nodes, setNodes] = useState<SentinelNode[]>([]);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [target, setTarget] = useState<Target | null>(null);
  
  // UI State
  const [selectedNode, setSelectedNode] = useState<SentinelNode | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Subscription to Mock Backend
  useEffect(() => {
    const unsubscribe = mockBackend.subscribe((data) => {
      if (data.type === 'INIT') {
        setNodes(data.nodes);
        setDetections(data.detections);
        setLogs(data.logs);
        setTarget(data.target || null);
      } else if (data.type === 'NODES_UPDATE') {
        setNodes(data.nodes);
        if (data.target) setTarget(data.target);
      } else if (data.type === 'DETECTION_NEW') {
        setDetections(prev => [data.detection, ...prev].slice(0, 100));
      } else if (data.type === 'DETECTION_BATCH') {
        setDetections(prev => [...data.detections, ...prev].slice(0, 100));
      } else if (data.type === 'LOG_NEW') {
        setLogs(prev => [data.log, ...prev].slice(0, 50));
      }
    });
    return () => unsubscribe();
  }, []);

  // Handlers
  const handleBlackoutClick = (node: SentinelNode) => {
    setSelectedNode(node);
    setIsModalOpen(true);
  };

  const handleBlackoutConfirm = (nodeId: string, reason: string) => {
    if (!selectedNode) return;
    const isCurrentlyBlackout = selectedNode.status === NodeStatus.BLACKOUT;
    // If currently blackout, we are deactivating (sending false). If not, we activate (sending true).
    mockBackend.toggleBlackout(nodeId, !isCurrentlyBlackout, reason);
  };

  const isDeactivating = selectedNode?.status === NodeStatus.BLACKOUT;

  return (
    <div className="flex flex-col h-screen bg-arctic-900 text-slate-200 overflow-hidden">
      <Header />
      
      <div className="flex flex-1 min-h-0">
        <NodeStatusPanel 
            nodes={nodes} 
            onToggleBlackout={handleBlackoutClick} 
        />
        
        <div className="flex-1 flex flex-col min-w-0 relative border-x border-arctic-700">
          <TacticalMap nodes={nodes} detections={detections} target={target} />
          
          <div className="absolute top-4 right-4 z-[400]">
             {/* Overlay Stat example */}
             <div className="bg-black/60 backdrop-blur border border-arctic-700 px-4 py-2 rounded">
                <div className="text-[10px] uppercase text-slate-500 mb-1">Inference Engine</div>
                <div className="text-xl font-mono text-arctic-400">YOLOv5-NANO</div>
                <div className="text-xs text-emerald-500">~87ms Latency</div>
             </div>
          </div>
        </div>

        <DetectionFeed detections={detections} />
      </div>

      <SystemLogs logs={logs} />

      <BlackoutModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        node={selectedNode}
        onConfirm={handleBlackoutConfirm}
        isDeactivating={isDeactivating}
      />
    </div>
  );
}

export default App;
