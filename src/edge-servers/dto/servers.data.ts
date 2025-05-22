// src/servers/server.seed.ts

import { EdgeServer } from './create-edge-server.dto';

export const SERVERS: EdgeServer[] = [
  {
    id: 'edge-01',
    cpuSpeedGHz: 2.5,
    availableMemoryMB: 2048,
    bandwidthMbps: 100,
    costPerSec: 0.01,
    latencyMs: 10,
    status: 'online',
  },
  {
    id: 'edge-02',
    cpuSpeedGHz: 1.8,
    availableMemoryMB: 1024,
    bandwidthMbps: 50,
    costPerSec: 0.008,
    latencyMs: 20,
    status: 'online',
  },
  {
    id: 'edge-03',
    cpuSpeedGHz: 3.2,
    availableMemoryMB: 4096,
    bandwidthMbps: 200,
    costPerSec: 0.015,
    latencyMs: 5,
    status: 'online',
  },
];
