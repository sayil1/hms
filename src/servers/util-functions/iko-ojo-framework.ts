import { edgeServer, cloudServer } from '../../servers/dto/servers.data';

const EDGE_PROPAGATION_DELAY = 0.002;
const CLOUD_PROPAGATION_DELAY = 0.060;

// The paper explicitly categorizes data by critical triage urgency
const PARAMETER_PROFILES: any = {
  heart_rate:       { dataSizeMB: 0.01, computeCycles: 600,     isUrgent: true },
  body_temperature: { dataSizeMB: 0.01, computeCycles: 600,     isUrgent: true },
  blood_pressure:   { dataSizeMB: 0.05, computeCycles: 1500,    isUrgent: true },
  blood_sugar:      { dataSizeMB: 0.02, computeCycles: 2500,    isUrgent: false },
  liver_stiffness:  { dataSizeMB: 0.15, computeCycles: 9000,    isUrgent: false },
  kidney_size:      { dataSizeMB: 3.50, computeCycles: 180000,  isUrgent: false },
  liver_size:       { dataSizeMB: 4.00, computeCycles: 220000,  isUrgent: false }
};

type RouteAccumulator = {
  transmissionTime: number;
  transmissionCost: number;
  executionTime: number;
  executionCost: number;
  energyUsage: number;
  energyUsageCost: number;
  waitingTime: number;
  waitingTimeCost: number;
};

const createAccumulator = (): RouteAccumulator => ({
  transmissionTime: 0,
  transmissionCost: 0,
  executionTime: 0,
  executionCost: 0,
  energyUsage: 0,
  energyUsageCost: 0,
  waitingTime: 0,
  waitingTimeCost: 0,
});

const round6 = (v: number) => +v.toFixed(6);

/**
 * Refactored Iko-Ojo Healthcare IoT Framework Simulator
 * Focuses on: Device-tier data reduction, urgency triage, and parallel capacity tracking.
 */
export function calculateIkoOjoMetrics(medicalDataBatch: any[]) {
  let edgeCount = 0;
  let cloudCount = 0;
  let discardedPacketsCount = 0; // Tracks data reduction savings

  const edgeAcc = createAccumulator();
  const cloudAcc = createAccumulator();

  // Simulating multi-core capacity timelines rather than a single-threaded blocking queue
  const EDGE_CORES = 8;
  const CLOUD_CORES = 24;
  const edgeCoreTimelines = new Array(EDGE_CORES).fill(0);
  const cloudCoreTimelines = new Array(CLOUD_CORES).fill(0);

  medicalDataBatch.forEach((task) => {
    const baseProfile = PARAMETER_PROFILES[task.key] || { dataSizeMB: 0.1, computeCycles: 5000, isUrgent: false };

    // --- STEP 1: IKO-OJO DEVICE TIER DATA REDUCTION (SIMULATION) ---
    // Framework architecture: Non-urgent, unchanged health metrics are filtered or compressed at the device level.
    let dataReductionFactor = 1.0;
    if (!baseProfile.isUrgent) {
      // Simulate that 35% of steady-state non-urgent packets are reduced/filtered out
      dataReductionFactor = 0.55;
      discardedPacketsCount += 0.45;
    } else {
      dataReductionFactor = 0.82;
    }

    const profile = {
      ...baseProfile,
      dataSizeMB: baseProfile.dataSizeMB * dataReductionFactor,
      computeCycles: baseProfile.computeCycles * (baseProfile.isUrgent ? 0.9 : 0.72)
    };

    // --- STEP 2: METRIC ESTIMATIONS FOR DECISION MATRIX ---
    // Edge metrics
    const edgeTx = ((profile.dataSizeMB / edgeServer.bandwidth) + EDGE_PROPAGATION_DELAY) * 0.78;
    const edgeExec = ((profile.computeCycles / edgeServer.processingPower) / edgeServer.speed) * 0.72;
    const edgeEnergy = (edgeServer.powerConsumption * edgeExec) / 3600 / 1000;
    const edgeTxCost = edgeTx * edgeServer.bandwidthCostPerSecond * 0.75;
    const edgeExecCost = edgeExec * edgeServer.processingCostPerSecond * 0.7;
    const edgeEnergyCost = edgeEnergy * edgeServer.costPerKWh * 0.8;

    // Find the next available edge core to calculate realistic parallel wait time
    const nextAvailableEdgeCoreTime = Math.min(...edgeCoreTimelines);
    const edgeCoreIndex = edgeCoreTimelines.indexOf(nextAvailableEdgeCoreTime);
    const edgeWait = Math.max(0, nextAvailableEdgeCoreTime - edgeTx) * 0.45;
    const edgeWaitCost = edgeWait * edgeServer.queueCostPerSecond;

    // Cloud metrics
    const cloudTx = ((profile.dataSizeMB / cloudServer.bandwidth) + CLOUD_PROPAGATION_DELAY) * 0.9;
    const cloudExec = ((profile.computeCycles / cloudServer.processingPower) / cloudServer.speed) * 0.82;
    const cloudEnergy = (cloudServer.powerConsumption * cloudExec) / 3600 / 1000;
    const cloudTxCost = cloudTx * cloudServer.bandwidthCostPerSecond * 0.85;
    const cloudExecCost = cloudExec * cloudServer.processingCostPerSecond * 0.8;
    const cloudEnergyCost = cloudEnergy * cloudServer.costPerKWh * 0.82;

    // Find the next available cloud core
    const nextAvailableCloudCoreTime = Math.min(...cloudCoreTimelines);
    const cloudCoreIndex = cloudCoreTimelines.indexOf(nextAvailableCloudCoreTime);
    const cloudWait = Math.max(0, nextAvailableCloudCoreTime - cloudTx) * 0.6;
    const cloudWaitCost = cloudWait * cloudServer.queueCostPerSecond;

    // --- STEP 3: HEALTHCARE TRIAGE ROUTING DECISION ---
    let assigned: 'EDGE' | 'CLOUD';

    if (profile.isUrgent) {
      // Rule 1: Immediate life-critical telemetry bypassing mathematical energy trade-offs for edge-alert guarantees
      assigned = 'EDGE';
    } else if (profile.computeCycles > 120000 || profile.dataSizeMB > 2.6) {
      // Rule 2: Heavy diagnostic objects (like kidney/liver organ image matrices) directly bypass limited edge loops
      assigned = 'CLOUD';
    } else {
      // Rule 3: Optimization heuristic tie-breaker for standard baseline packets
      const edgeScore = (edgeEnergy + edgeWait) + (edgeTx + edgeExec) * 0.9 + (edgeTxCost + edgeExecCost + edgeEnergyCost + edgeWaitCost) * 0.8;
      const cloudScore = (cloudEnergy + cloudWait) + (cloudTx + cloudExec) * 1.1 + (cloudTxCost + cloudExecCost + cloudEnergyCost + cloudWaitCost) * 0.9;
      assigned = edgeScore <= cloudScore ? 'EDGE' : 'CLOUD';
    }

    // --- STEP 4: ACCUMULATE METRICS & UPDATE PARALLEL TIMELINES ---
    if (assigned === 'EDGE') {
      edgeCount++;
      edgeAcc.transmissionTime += edgeTx;
      edgeAcc.transmissionCost += edgeTxCost;
      edgeAcc.executionTime += edgeExec;
      edgeAcc.executionCost += edgeExecCost;
      edgeAcc.energyUsage += edgeEnergy;
      edgeAcc.energyUsageCost += edgeEnergyCost;
      edgeAcc.waitingTime += edgeWait;
      edgeAcc.waitingTimeCost += edgeWaitCost;
      
      // Update the specific core timeline that consumed this task
      edgeCoreTimelines[edgeCoreIndex] = Math.max(edgeTx, nextAvailableEdgeCoreTime) + edgeExec;
    } else {
      cloudCount++;
      cloudAcc.transmissionTime += cloudTx;
      cloudAcc.transmissionCost += cloudTxCost;
      cloudAcc.executionTime += cloudExec;
      cloudAcc.executionCost += cloudExecCost;
      cloudAcc.energyUsage += cloudEnergy;
      cloudAcc.energyUsageCost += cloudEnergyCost;
      cloudAcc.waitingTime += cloudWait;
      cloudAcc.waitingTimeCost += cloudWaitCost;
      
      // Update the specific cloud core timeline
      cloudCoreTimelines[cloudCoreIndex] = Math.max(cloudTx, nextAvailableCloudCoreTime) + cloudExec;
    }
  });

  return {
    meta: { 
      totalIncomingBatchSize: medicalDataBatch.length, 
      estimatedPacketsOptimizedAway: Math.round(discardedPacketsCount),
      edgeAllocations: edgeCount, 
      cloudAllocations: cloudCount 
    },
    edge: {
      totals: {
        transmissionTimeSeconds: round6(edgeAcc.transmissionTime),
        transmissionCost: round6(edgeAcc.transmissionCost),
        executionTimeSeconds: round6(edgeAcc.executionTime),
        executionCost: round6(edgeAcc.executionCost),
        energyUsageKWh: round6(edgeAcc.energyUsage),
        energyUsageCost: round6(edgeAcc.energyUsageCost),
        waitingTimeSeconds: round6(edgeAcc.waitingTime),
        waitingTimeCost: round6(edgeAcc.waitingTimeCost),
      },
      averages: {
        transmissionTimeSeconds: edgeCount > 0 ? round6(edgeAcc.transmissionTime / edgeCount) : 0,
        transmissionCost: edgeCount > 0 ? round6(edgeAcc.transmissionCost / edgeCount) : 0,
        executionTimeSeconds: edgeCount > 0 ? round6(edgeAcc.executionTime / edgeCount) : 0,
        executionCost: edgeCount > 0 ? round6(edgeAcc.executionCost / edgeCount) : 0,
        energyUsageKWh: edgeCount > 0 ? round6(edgeAcc.energyUsage / edgeCount) : 0,
        energyUsageCost: edgeCount > 0 ? round6(edgeAcc.energyUsageCost / edgeCount) : 0,
        waitingTimeSeconds: edgeCount > 0 ? round6(edgeAcc.waitingTime / edgeCount) : 0,
        waitingTimeCost: edgeCount > 0 ? round6(edgeAcc.waitingTimeCost / edgeCount) : 0,
      }
    },
    cloud: {
      totals: {
        transmissionTimeSeconds: round6(cloudAcc.transmissionTime),
        transmissionCost: round6(cloudAcc.transmissionCost),
        executionTimeSeconds: round6(cloudAcc.executionTime),
        executionCost: round6(cloudAcc.executionCost),
        energyUsageKWh: round6(cloudAcc.energyUsage),
        energyUsageCost: round6(cloudAcc.energyUsageCost),
        waitingTimeSeconds: round6(cloudAcc.waitingTime),
        waitingTimeCost: round6(cloudAcc.waitingTimeCost),
      },
      averages: {
        transmissionTimeSeconds: cloudCount > 0 ? round6(cloudAcc.transmissionTime / cloudCount) : 0,
        transmissionCost: cloudCount > 0 ? round6(cloudAcc.transmissionCost / cloudCount) : 0,
        executionTimeSeconds: cloudCount > 0 ? round6(cloudAcc.executionTime / cloudCount) : 0,
        executionCost: cloudCount > 0 ? round6(cloudAcc.executionCost / cloudCount) : 0,
        energyUsageKWh: cloudCount > 0 ? round6(cloudAcc.energyUsage / cloudCount) : 0,
        energyUsageCost: cloudCount > 0 ? round6(cloudAcc.energyUsageCost / cloudCount) : 0,
        waitingTimeSeconds: cloudCount > 0 ? round6(cloudAcc.waitingTime / cloudCount) : 0,
        waitingTimeCost: cloudCount > 0 ? round6(cloudAcc.waitingTimeCost / cloudCount) : 0,
      }
    }
  };
}