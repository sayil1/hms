export const edgeServer = {
  id: "edge-server-zur01",
  type: "Edge",

  // Processing
  processingPower: 15000,             // MIPS → α(Rₑ)
  processingCostPerSecond: 0.00003,   // CPU cost per second → Cᵣₑ

  // Transmission (IoT → Edge)
  bandwidth: 100,                     // MB/s → β(Rₑ)
  bandwidthCostPerSecond: 0.002,      // Data transfer cost → Cᵦₑ (Edge transmission cost)

  // Queuing (task waiting in queue)
  queueCostPerSecond: 0.000005,       // Cost for task waiting → C_queueₑ

  // Energy
  powerConsumption: 200,              // Watts (J/s) → pₑ(u(t))
  energyCostPerUnit: 0.00000005,      // Cost per Joule → C_energyₑ

  // Derived Cost Labels
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

  // Processing
  processingPower: 120000,
  processingCostPerSecond: 0.00018,

  // Transmission (Edge → Cloud)
  bandwidth: 1000,
  bandwidthCostPerSecond: 0.008,       // Data transfer cost → Cᵦ_c (Cloud transmission cost)

  // Queuing
  queueCostPerSecond: 0.000015,        // Cost for task waiting → C_queue_c

  // Energy
  powerConsumption: 600,               // Watts → p_c(u(t))
  energyCostPerUnit: 0.00000003,       // Cost per Joule → C_energy_c

  // Derived Cost Labels
  costLabels: {
    transmission: "Transmission Cost to Cloud",
    execution: "Execution Cost at Cloud",
    waiting: "Waiting Cost at Cloud",
    energy: "Energy Cost at Cloud"
  }
};
