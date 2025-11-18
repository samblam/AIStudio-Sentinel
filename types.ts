
export enum NodeStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  BLACKOUT = 'blackout',
  RESUMING = 'resuming' // Burst transmitting
}

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface Target {
    lat: number;
    lng: number;
    name: string;
}

export interface SentinelNode {
  id: string;
  name: string;
  type: 'stationary' | 'mobile' | 'aerostat';
  status: NodeStatus;
  batteryLevel: number;
  temperature: number; // Celsius
  location: GeoLocation;
  lastHeartbeat: string;
  queuedDetections: number; // For blackout mode
  ipAddress: string;
}

export interface Detection {
  id: string;
  nodeId: string;
  timestamp: string;
  class: string;
  confidence: number;
  thumbnail?: string; // In real app, this is a URL. Here we might mock it.
  location: GeoLocation;
  isNew?: boolean; // UI state for highlighting
}

export interface BlackoutConfig {
  nodeId: string;
  operatorId: string;
  reason: string;
  duration?: number; // Minutes
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  source: string;
}
