import { SentinelNode, NodeStatus, Detection } from './types';

// Arctic Circle center-ish for initial map view
export const MAP_CENTER = [70.5, -100.2]; 
export const MAP_ZOOM = 5;

export const MOCK_NODES: SentinelNode[] = [
  {
    id: 'n1',
    name: 'sentry-alpha-01',
    type: 'stationary',
    status: NodeStatus.ONLINE,
    batteryLevel: 87,
    temperature: -24,
    location: { lat: 70.5234, lng: -100.8765 },
    lastHeartbeat: new Date().toISOString(),
    queuedDetections: 0,
    ipAddress: '10.8.0.2'
  },
  {
    id: 'n2',
    name: 'aerostat-bravo',
    type: 'aerostat',
    status: NodeStatus.ONLINE,
    batteryLevel: 92,
    temperature: -31,
    location: { lat: 71.2345, lng: -98.1234 },
    lastHeartbeat: new Date().toISOString(),
    queuedDetections: 0,
    ipAddress: '10.8.0.3'
  },
  {
    id: 'n3',
    name: 'rover-charlie',
    type: 'mobile',
    status: NodeStatus.BLACKOUT, // Starts in blackout for demo
    batteryLevel: 45,
    temperature: -18,
    location: { lat: 69.8765, lng: -102.5432 },
    lastHeartbeat: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    queuedDetections: 142,
    ipAddress: '10.8.0.4'
  }
];

export const DETECTION_CLASSES = ['person', 'vehicle', 'polar_bear', 'unknown_uav'];

export const OPERATOR_ID = "OP-DELTA-9";