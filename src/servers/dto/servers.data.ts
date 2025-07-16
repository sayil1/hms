

export const edgeServer = {
  id: "edge-server-zur01",
  type: "Edge",

  processingPower: 15000,         // MIPS (Millions of Instructions Per Second). Corresponds to α(Rₑ)
  processingCostPerSecond: 0.00003, // Cost to use the CPU. Corresponds to Cᵣₑ

  // Transmission Properties (from sections i, ii)
  // This represents the link from the IoT device to the edge server.
  bandwidth: 100,                 // MB/s. Corresponds to β(Rₑ)
  bandwidthCostPerSecond: 0.002,  // Cost of data transfer. Corresponds to Cᵦ

  // Queuing Properties (from sections iii, iv)
  queueCostPerSecond: 0.000005,   // Cost to store a task in the queue. Corresponds to c_queue

  // Energy Properties (from section ix)
  powerConsumption: 200,          // Watts (Joules/second) under load. Corresponds to p(u(t))
  energyCostPerUnit: 0.00000005,  // Cost per Joule. Corresponds to Cᵣ in the energy cost formula
};

export const cloudServer = {
  id: "cloud-vm-central-eu-1",
  type: "Cloud",

  // Execution Properties (from sections v, vi)
  processingPower: 120000,        // MIPS. Corresponds to α(R_c)
  processingCostPerSecond: 0.00018, // Cost to use the CPU. Corresponds to Cᵣ_c

  // Transmission Properties (from sections i, ii)
  // This represents the link from the edge to the cloud server.
  bandwidth: 1000,                // MB/s. Corresponds to β(R_c)
  bandwidthCostPerSecond: 0.008,  // Cost of data transfer. Corresponds to Cᵦ

  // Queuing Properties (from sections iii, iv)
  queueCostPerSecond: 0.000015,   // Cost to store a task in the queue. Corresponds to c_queue

  // Energy Properties (from section ix)
  powerConsumption: 600,          // Watts (Joules/second) under load. Corresponds to p(u(t))
  energyCostPerUnit: 0.00000003,  // Cost per Joule (often cheaper due to bulk rates). Corresponds to Cᵣ
};