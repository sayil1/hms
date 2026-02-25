export const edgeServer = {
  id: "edge-server-zur01",
  type: "Edge",

  speed: 0.8,
  cost: 3500.0,
  power: 300.0,
  costPerKWh: 0.15,

  processingPower: 12000.0,
  processingCostPerSecond: 0.00002,

  bandwidth: 300.0,
  bandwidthCostPerSecond: 0.0012,

  queueCostPerSecond: 0.000015,

  powerConsumption: 300.0,
  energyCostPerUnit: 4.17e-8,

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

  speed: 2.5,
  cost: 0.035,
  power: 650.0,

  costPerKWh: 0.25,

  processingPower: 600000.0,
  processingCostPerSecond: 0.00012,

  bandwidth: 1500.0,
  bandwidthCostPerSecond: 0.0035,

  queueCostPerSecond: 0.00001,

  powerConsumption: 650.0,
  energyCostPerUnit: 6.94e-8,

  costLabels: {
    transmission: "Transmission Cost to Cloud",
    execution: "Execution Cost at Cloud",
    waiting: "Waiting Cost at Cloud",
    energy: "Energy Cost at Cloud"
  }
};