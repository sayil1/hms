import { edgeServer, cloudServer } from '../../servers/dto/servers.data';

const EDGE_PROPAGATION_DELAY = 0.002;
const CLOUD_PROPAGATION_DELAY = 0.060;

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

// Lightweight EdgeSched-DQN simulator: produces the same metric shape as DPTARA
export function calculateEdgeSchedMetrics(medicalDataBatch: any[]) {
  let edgeCount = 0;
  let cloudCount = 0;

  const edgeAcc = createAccumulator();
  const cloudAcc = createAccumulator();

  let edgeLastFinish = 0;
  let cloudLastFinish = 0;

  medicalDataBatch.forEach((task, idx) => {
    const profile = PARAMETER_PROFILES[task.key] || { dataSizeMB: 0.1, computeCycles: 5000, isUrgent: false };

    const edgeTx = (profile.dataSizeMB / edgeServer.bandwidth) + EDGE_PROPAGATION_DELAY;
    const edgeExec = (profile.computeCycles / edgeServer.processingPower) / edgeServer.speed;
    const edgeEnergy = (edgeServer.powerConsumption * edgeExec) / 3600 / 1000;
    const edgeTxCost = edgeTx * edgeServer.bandwidthCostPerSecond;
    const edgeExecCost = edgeExec * edgeServer.processingCostPerSecond;
    const edgeEnergyCost = edgeEnergy * edgeServer.costPerKWh;
    const edgeArrival = edgeTx;
    const edgeWait = Math.max(0, edgeLastFinish - edgeArrival);
    const edgeWaitCost = edgeWait * edgeServer.queueCostPerSecond;
    const edgeStart = Math.max(edgeArrival, edgeLastFinish);
    const edgeFinish = edgeStart + edgeExec;

    const cloudTx = (profile.dataSizeMB / cloudServer.bandwidth) + CLOUD_PROPAGATION_DELAY;
    const cloudExec = (profile.computeCycles / cloudServer.processingPower) / cloudServer.speed;
    const cloudEnergy = (cloudServer.powerConsumption * cloudExec) / 3600 / 1000;
    const cloudTxCost = cloudTx * cloudServer.bandwidthCostPerSecond;
    const cloudExecCost = cloudExec * cloudServer.processingCostPerSecond;
    const cloudEnergyCost = cloudEnergy * cloudServer.costPerKWh;
    const cloudArrival = cloudTx;
    const cloudWait = Math.max(0, cloudLastFinish - cloudArrival);
    const cloudWaitCost = cloudWait * cloudServer.queueCostPerSecond;
    const cloudStart = Math.max(cloudArrival, cloudLastFinish);
    const cloudFinish = cloudStart + cloudExec;

    // Simple heuristic as a stand-in for a DQN decision: minimize a weighted sum of time and cost
    const edgeScore = (edgeTx + edgeExec + edgeWait) + (edgeTxCost + edgeExecCost + edgeEnergyCost + edgeWaitCost) * 10;
    const cloudScore = (cloudTx + cloudExec + cloudWait) + (cloudTxCost + cloudExecCost + cloudEnergyCost + cloudWaitCost) * 10;

    const assigned = (profile.computeCycles > 50000 || profile.dataSizeMB > 1.5) ? 'CLOUD' : (edgeScore <= cloudScore ? 'EDGE' : 'CLOUD');

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
      edgeLastFinish = edgeFinish;
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
      cloudLastFinish = cloudFinish;
    }
  });

  return {
    meta: { totalBatchSize: medicalDataBatch.length, edgeAllocations: edgeCount, cloudAllocations: cloudCount },
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
