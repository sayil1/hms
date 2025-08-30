export const edgeServer = {
  id: "edge-server-zur01",
  type: "Edge",
  speed: 1.0,
  cost: 5000.0,
  power: 250.0,
  costPerKWh: 0.15,
  processingPower: 15000.0,
  processingCostPerSecond: 0.00003,
  bandwidth: 1000.0,
  bandwidthCostPerSecond: 0.002,
  queueCostPerSecond: 0.000005,
  powerConsumption: 250.0,
  energyCostPerUnit: 0.00015,
  costLabels: {
    transmission: "Transmission Cost to Edge",
    execution: "Execution Cost at Edge",
    waiting: "Waiting Cost at Edge",
    energy: "Energy Cost at Edge"
  }
};
export const cloudServer = {
  id: "cloud-vm-central-eu-1",
  type: "Cloud",
  speed: 2.0,
  cost: 0.025,
  power: 450.0,
  costPerKWh: 0.25,
  processingPower: 100000.0,
  processingCostPerSecond: 0.0001,
  bandwidth: 25000.0,
  bandwidthCostPerSecond: 0.004,
  queueCostPerSecond: 0.000008,
  powerConsumption: 450.0,
  energyCostPerUnit: 0.00000005,
  costLabels: {
    transmission: "Transmission Cost to Cloud",
    execution: "Execution Cost at Cloud",
    waiting: "Waiting Cost at Cloud",
    energy: "Energy Cost at Cloud"
  }
};