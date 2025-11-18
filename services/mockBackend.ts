
import { SentinelNode, Detection, NodeStatus, SystemLog, Target } from '../types';
import { MOCK_NODES, DETECTION_CLASSES } from '../constants';

// --- SIMULATION CONSTANTS ---
const INFERENCE_TIME_MS = 87;
const SATCOM_LATENCY_MS = 600; // High latency environment
const DETECTION_PROBABILITY = 0.02; // Chance per tick for random noise
const BURST_RATE_PER_TICK = 5; // How many queue items sent per tick during burst

// --- VLAD SIMULATION CONSTANTS ---
const VLAD_SPEED = 0.0005; // Lat/Lng degrees per tick
const DETECTION_RANGE_DEG = 0.2; // Approx 20km
const VLAD_DETECTION_CHANCE = 0.15; // Chance to detect per tick if in range (he is sneaky)

// --- TDD / LOGIC CORE ---

class NetworkLink {
  private latency: number;
  private onReceive: (packet: any) => void;

  constructor(latency: number, onReceive: (packet: any) => void) {
    this.latency = latency;
    this.onReceive = onReceive;
  }

  send(packet: any) {
    setTimeout(() => {
      this.onReceive(packet);
    }, this.latency);
  }
}

class RoamingTarget {
    public lat: number;
    public lng: number;
    public name: string = "VLAD_PUTIN";
    private angle: number = 0;
    private centerLat: number;
    private centerLng: number;

    constructor() {
        // Start near the center of our node cluster
        this.centerLat = 70.5;
        this.centerLng = -100.2;
        this.lat = this.centerLat;
        this.lng = this.centerLng;
    }

    tick() {
        // Move in a sneaky figure-8 pattern
        this.angle += 0.02;
        this.lat = this.centerLat + Math.sin(this.angle) * 0.8; 
        this.lng = this.centerLng + Math.sin(this.angle * 2) * 1.5; 
    }

    getPosition(): Target {
        return {
            lat: this.lat,
            lng: this.lng,
            name: this.name
        }
    }
}

class EdgeNodeSim {
  public id: string;
  public status: NodeStatus;
  public queue: Detection[] = [];
  public state: SentinelNode;
  
  private network: NetworkLink;
  private lastInferenceTime: number = 0;

  constructor(initialState: SentinelNode, network: NetworkLink) {
    this.id = initialState.id;
    this.state = { ...initialState };
    this.status = initialState.status;
    this.network = network;
    // Initialize queue if node starts in blackout
    if (this.status === NodeStatus.BLACKOUT && initialState.queuedDetections > 0) {
       this.generateMockQueue(initialState.queuedDetections);
    }
  }

  private generateMockQueue(count: number) {
    for(let i=0; i<count; i++) {
        this.queue.push(this.createDetection(null, true));
    }
  }

  // The "Game Loop" for this node
  tick(now: number, target: RoamingTarget, onLog: (msg: string, level: SystemLog['level']) => void) {
    // 1. Battery / Temp simulation
    if (Math.random() > 0.95) {
        this.state.batteryLevel = Math.max(0, this.state.batteryLevel - 0.01);
        this.state.temperature = this.state.temperature + (Math.random() > 0.5 ? 0.1 : -0.1);
    }

    // 2. Inference Engine Simulation
    if (now - this.lastInferenceTime > INFERENCE_TIME_MS) {
        this.runInference(now, target, onLog);
        this.lastInferenceTime = now;
    }

    // 3. Burst Transmission Logic
    if (this.status === NodeStatus.RESUMING) {
        this.processBurst(onLog);
    }

    // Sync state object for UI
    this.state.status = this.status;
    this.state.queuedDetections = this.queue.length;
    this.state.lastHeartbeat = new Date().toISOString();
  }

  private runInference(now: number, target: RoamingTarget, onLog: (msg: string, level: SystemLog['level']) => void) {
    let detection: Detection | null = null;

    // A. Check for VIP Target (Proximity Check)
    const dist = Math.sqrt(
        Math.pow(this.state.location.lat - target.lat, 2) + 
        Math.pow(this.state.location.lng - target.lng, 2)
    );

    // We only DETECT him if he is close, even though the map might show his "Ground Truth" for the demo
    if (dist < DETECTION_RANGE_DEG && Math.random() < VLAD_DETECTION_CHANCE) {
        detection = this.createDetection('hostile_vip');
        // Add specific location jitter to make it look like a track, but close to actual target
        detection.location = {
            lat: target.lat + (Math.random() * 0.01 - 0.005),
            lng: target.lng + (Math.random() * 0.01 - 0.005)
        };
    } 
    // B. Random Background Noise
    else if (Math.random() < DETECTION_PROBABILITY) {
        detection = this.createDetection();
    }

    // Handle Result
    if (detection) {
        const isVip = detection.class === 'hostile_vip';
        
        if (this.status === NodeStatus.BLACKOUT) {
            this.queue.push(detection);
            if (isVip) {
                 onLog(`[${this.state.name}] CRITICAL: HOSTILE VIP DETECTED. BLACKOUT ACTIVE. QUEUED.`, 'error');
            } else {
                 onLog(`[${this.state.name}] Object Detected (${detection.class}). BLACKOUT ACTIVE. Queued item #${this.queue.length}`, 'warn');
            }
        } else if (this.status === NodeStatus.ONLINE) {
            this.network.send({ type: 'DETECTION', payload: detection });
            if (isVip) {
                onLog(`[${this.state.name}] !!! ALERT !!! HOSTILE VIP IDENTIFIED. TRANSMITTING PRIORITY 1.`, 'error');
            } else {
                onLog(`[${this.state.name}] Object Detected (${detection.class}). Transmitting...`, 'info');
            }
        }
    }
  }

  private processBurst(onLog: (msg: string, level: SystemLog['level']) => void) {
    if (this.queue.length === 0) {
        this.status = NodeStatus.ONLINE;
        onLog(`[${this.state.name}] Burst Complete. Resuming standard ops.`, 'success');
        return;
    }

    // Send a batch
    const batch = this.queue.splice(0, BURST_RATE_PER_TICK);
    batch.forEach(d => {
        this.network.send({ type: 'DETECTION', payload: d });
    });
    onLog(`[${this.state.name}] BURSTING: Sent ${batch.length} items. ${this.queue.length} remaining.`, 'info');
  }

  public setBlackout(active: boolean, onLog: (msg: string, level: SystemLog['level']) => void) {
    if (active) {
        this.status = NodeStatus.BLACKOUT;
        onLog(`[${this.state.name}] COMMAND: ENTER BLACKOUT. RF SILENCE.`, 'warn');
    } else {
        this.status = NodeStatus.RESUMING;
        onLog(`[${this.state.name}] COMMAND: LIFT BLACKOUT. INITIATING BURST.`, 'info');
    }
  }

  private createDetection(forceClass: string | null = null, isHistorical = false): Detection {
     return {
        id: Math.random().toString(36).substr(2, 9),
        nodeId: this.id,
        timestamp: isHistorical ? new Date(Date.now() - 100000).toISOString() : new Date().toISOString(),
        class: forceClass || DETECTION_CLASSES[Math.floor(Math.random() * DETECTION_CLASSES.length)],
        confidence: forceClass ? 0.98 : (0.75 + (Math.random() * 0.24)),
        location: {
          lat: this.state.location.lat + (Math.random() * 0.02 - 0.01),
          lng: this.state.location.lng + (Math.random() * 0.02 - 0.01)
        },
        isNew: true
     };
  }
}

// --- MAIN SIMULATION ENGINE ---

class SimulationEngine {
  private nodes: EdgeNodeSim[] = [];
  private target: RoamingTarget;
  private listeners: ((data: any) => void)[] = [];
  private logs: SystemLog[] = [];
  private detections: Detection[] = [];
  private intervalId: any;

  constructor() {
    // Create Network Link that feeds back into this engine's `handleNetworkPacket`
    const network = new NetworkLink(SATCOM_LATENCY_MS, (pkt) => this.handleNetworkPacket(pkt));

    // Initialize Physics
    this.target = new RoamingTarget();

    // Initialize Nodes
    this.nodes = MOCK_NODES.map(n => new EdgeNodeSim(n, network));

    this.startLoop();
  }

  private startLoop() {
    this.intervalId = setInterval(() => {
        const now = Date.now();
        
        // Move the Target
        this.target.tick();

        // Run Node Logic
        this.nodes.forEach(node => node.tick(now, this.target, (msg, level) => this.log(msg, level)));
        
        // Broadcast state updates (heartbeats) AND Target "Ground Truth" for demo visualization
        this.notify({ 
            type: 'NODES_UPDATE', 
            nodes: this.nodes.map(n => n.state),
            target: this.target.getPosition()
        });
    }, 100); // 10Hz Tick Rate
  }

  private handleNetworkPacket(packet: any) {
      if (packet.type === 'DETECTION') {
          const detection = packet.payload;
          this.detections = [detection, ...this.detections].slice(0, 200);
          this.notify({ type: 'DETECTION_NEW', detection });
      }
  }

  // --- PUBLIC API ---

  subscribe(callback: (data: any) => void) {
    this.listeners.push(callback);
    // Initial State
    callback({ 
        type: 'INIT', 
        nodes: this.nodes.map(n => n.state), 
        detections: this.detections, 
        logs: this.logs,
        target: this.target.getPosition()
    });
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  toggleBlackout(nodeId: string, active: boolean, reason?: string) {
    const node = this.nodes.find(n => n.id === nodeId);
    if (node) {
        node.setBlackout(active, (msg, lvl) => this.log(msg, lvl));
        // Immediate UI update before next tick
        this.notify({ 
            type: 'NODES_UPDATE', 
            nodes: this.nodes.map(n => n.state),
            target: this.target.getPosition()
        });
    }
  }

  private notify(event: any) {
    this.listeners.forEach(l => l(event));
  }

  private log(message: string, level: SystemLog['level'] = 'info') {
    const newLog: SystemLog = {
      id: Math.random().toString(36),
      timestamp: new Date().toISOString(),
      message,
      level,
      source: 'SYSTEM'
    };
    this.logs = [newLog, ...this.logs].slice(0, 100);
    this.notify({ type: 'LOG_NEW', log: newLog });
  }
}

export const mockBackend = new SimulationEngine();
