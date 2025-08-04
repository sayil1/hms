export const edgeServer = {
  id: "edge-server-zur01",
  type: "Edge",
  speed: 1.0, // MB/s
  cost: 0.01, // USD
  power: 50,           // Watts
  costPerKWh: 0.10,     // USD


  processingPower: 15000,
  processingCostPerSecond: 0.00003,

  bandwidth: 100,
  bandwidthCostPerSecond: 0.002,

  queueCostPerSecond: 0.000005,

  powerConsumption: 200,
  energyCostPerUnit: 0.00000005,

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
  speed: 2.0, // MB/s
  cost: 0.03, // USD
  power: 200,          // Watts
  costPerKWh: 0.25,    // USD


  processingPower: 120000,
  processingCostPerSecond: 0.00018,

  bandwidth: 1000,
  bandwidthCostPerSecond: 0.008,

  queueCostPerSecond: 0.000015,

  powerConsumption: 600,
  energyCostPerUnit: 0.00000003,

  costLabels: {
    transmission: "Transmission Cost to Cloud",
    execution: "Execution Cost at Cloud",
    waiting: "Waiting Cost at Cloud",
    energy: "Energy Cost at Cloud"
  }
};
