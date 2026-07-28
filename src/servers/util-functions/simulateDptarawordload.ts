import { edgeServer, cloudServer } from '../../servers/dto/servers.data';

const PARAMETER_PROFILES = {
  heart_rate:       { dataSizeMB: 0.01, computeCycles: 600,     isUrgent: true },
  body_temperature: { dataSizeMB: 0.01, computeCycles: 600,     isUrgent: true },
  blood_pressure:   { dataSizeMB: 0.05, computeCycles: 1500,    isUrgent: true },
  blood_sugar:      { dataSizeMB: 0.02, computeCycles: 2500,    isUrgent: false },
  liver_stiffness:  { dataSizeMB: 0.15, computeCycles: 9000,    isUrgent: false },
  kidney_size:      { dataSizeMB: 3.50, computeCycles: 180000,  isUrgent: false }, 
  liver_size:       { dataSizeMB: 4.00, computeCycles: 220000,  isUrgent: false }
};

const EDGE_PROPAGATION_DELAY = 0.002; 
const CLOUD_PROPAGATION_DELAY = 0.060; 

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

const round6 = (value: number) => +value.toFixed(6);

export function calculateDptaraMetrics(medicalDataBatch) {
  let edgeRoutedCount = 0;
  let cloudRoutedCount = 0;

  const edgeAccumulator = createAccumulator();
  const cloudAccumulator = createAccumulator();

  let edgeLastFinishTime = 0;
  let cloudLastFinishTime = 0;

  medicalDataBatch.forEach((task) => {
    const profile = PARAMETER_PROFILES[task.key] || { dataSizeMB: 0.1, computeCycles: 5000, isUrgent: false };

    const edgeTxTime = (profile.dataSizeMB / edgeServer.bandwidth) + EDGE_PROPAGATION_DELAY;
    const edgeExecTime = (profile.computeCycles / edgeServer.processingPower) / edgeServer.speed;
    const edgeEnergyUsage = (edgeServer.powerConsumption * edgeExecTime) / 3600 / 1000;
    const edgeTxCost = edgeTxTime * edgeServer.bandwidthCostPerSecond;
    const edgeExecCost = edgeExecTime * edgeServer.processingCostPerSecond;
    const edgeEnergyCost = edgeEnergyUsage * edgeServer.costPerKWh;
    const edgeArrivalTime = edgeTxTime;
    const edgeWaitingTime = Math.max(0, edgeLastFinishTime - edgeArrivalTime);
    const edgeStartTime = Math.max(edgeArrivalTime, edgeLastFinishTime);
    const edgeWaitingCost = edgeWaitingTime * edgeServer.queueCostPerSecond;
    const edgeFinishTime = edgeStartTime + edgeExecTime;

    const cloudTxTime = (profile.dataSizeMB / cloudServer.bandwidth) + CLOUD_PROPAGATION_DELAY;
    const cloudExecTime = (profile.computeCycles / cloudServer.processingPower) / cloudServer.speed;
    const cloudEnergyUsage = (cloudServer.powerConsumption * cloudExecTime) / 3600 / 1000;
    const cloudTxCost = cloudTxTime * cloudServer.bandwidthCostPerSecond;
    const cloudExecCost = cloudExecTime * cloudServer.processingCostPerSecond;
    const cloudEnergyCost = cloudEnergyUsage * cloudServer.costPerKWh;
    const cloudArrivalTime = cloudTxTime;
    const cloudWaitingTime = Math.max(0, cloudLastFinishTime - cloudArrivalTime);
    const cloudStartTime = Math.max(cloudArrivalTime, cloudLastFinishTime);
    const cloudWaitingCost = cloudWaitingTime * cloudServer.queueCostPerSecond;
    const cloudFinishTime = cloudStartTime + cloudExecTime;

    const edgeTotalCost = edgeTxCost + edgeExecCost + edgeEnergyCost + edgeWaitingCost;
    const cloudTotalCost = cloudTxCost + cloudExecCost + cloudEnergyCost + cloudWaitingCost;

    let assignedTarget = "EDGE";

    if (profile.computeCycles > 50000 || profile.dataSizeMB > 1.5) {
      assignedTarget = "CLOUD";
    } else if (!profile.isUrgent && cloudTotalCost < edgeTotalCost) {
      assignedTarget = "CLOUD";
    }

    if (assignedTarget === "EDGE") {
      edgeRoutedCount++;
      edgeAccumulator.transmissionTime += edgeTxTime;
      edgeAccumulator.transmissionCost += edgeTxCost;
      edgeAccumulator.executionTime += edgeExecTime;
      edgeAccumulator.executionCost += edgeExecCost;
      edgeAccumulator.energyUsage += edgeEnergyUsage;
      edgeAccumulator.energyUsageCost += edgeEnergyCost;
      edgeAccumulator.waitingTime += edgeWaitingTime;
      edgeAccumulator.waitingTimeCost += edgeWaitingCost;
      edgeLastFinishTime = edgeFinishTime;
    } else {
      cloudRoutedCount++;
      cloudAccumulator.transmissionTime += cloudTxTime;
      cloudAccumulator.transmissionCost += cloudTxCost;
      cloudAccumulator.executionTime += cloudExecTime;
      cloudAccumulator.executionCost += cloudExecCost;
      cloudAccumulator.energyUsage += cloudEnergyUsage;
      cloudAccumulator.energyUsageCost += cloudEnergyCost;
      cloudAccumulator.waitingTime += cloudWaitingTime;
      cloudAccumulator.waitingTimeCost += cloudWaitingCost;
      cloudLastFinishTime = cloudFinishTime;
    }
  });

  return {
    meta: {
      totalBatchSize: medicalDataBatch.length,
      edgeAllocations: edgeRoutedCount,
      cloudAllocations: cloudRoutedCount
    },
    edge: {
      totals: {
        transmissionTimeSeconds: round6(edgeAccumulator.transmissionTime),
        transmissionCost: round6(edgeAccumulator.transmissionCost),
        executionTimeSeconds: round6(edgeAccumulator.executionTime),
        executionCost: round6(edgeAccumulator.executionCost),
        energyUsageKWh: round6(edgeAccumulator.energyUsage),
        energyUsageCost: round6(edgeAccumulator.energyUsageCost),
        waitingTimeSeconds: round6(edgeAccumulator.waitingTime),
        waitingTimeCost: round6(edgeAccumulator.waitingTimeCost)
      },
      averages: {
        transmissionTimeSeconds: edgeRoutedCount > 0 ? round6(edgeAccumulator.transmissionTime / edgeRoutedCount) : 0,
        transmissionCost: edgeRoutedCount > 0 ? round6(edgeAccumulator.transmissionCost / edgeRoutedCount) : 0,
        executionTimeSeconds: edgeRoutedCount > 0 ? round6(edgeAccumulator.executionTime / edgeRoutedCount) : 0,
        executionCost: edgeRoutedCount > 0 ? round6(edgeAccumulator.executionCost / edgeRoutedCount) : 0,
        energyUsageKWh: edgeRoutedCount > 0 ? round6(edgeAccumulator.energyUsage / edgeRoutedCount) : 0,
        energyUsageCost: edgeRoutedCount > 0 ? round6(edgeAccumulator.energyUsageCost / edgeRoutedCount) : 0,
        waitingTimeSeconds: edgeRoutedCount > 0 ? round6(edgeAccumulator.waitingTime / edgeRoutedCount) : 0,
        waitingTimeCost: edgeRoutedCount > 0 ? round6(edgeAccumulator.waitingTimeCost / edgeRoutedCount) : 0
      }
    },
    cloud: {
      totals: {
        transmissionTimeSeconds: round6(cloudAccumulator.transmissionTime),
        transmissionCost: round6(cloudAccumulator.transmissionCost),
        executionTimeSeconds: round6(cloudAccumulator.executionTime),
        executionCost: round6(cloudAccumulator.executionCost),
        energyUsageKWh: round6(cloudAccumulator.energyUsage),
        energyUsageCost: round6(cloudAccumulator.energyUsageCost),
        waitingTimeSeconds: round6(cloudAccumulator.waitingTime),
        waitingTimeCost: round6(cloudAccumulator.waitingTimeCost)
      },
      averages: {
        transmissionTimeSeconds: cloudRoutedCount > 0 ? round6(cloudAccumulator.transmissionTime / cloudRoutedCount) : 0,
        transmissionCost: cloudRoutedCount > 0 ? round6(cloudAccumulator.transmissionCost / cloudRoutedCount) : 0,
        executionTimeSeconds: cloudRoutedCount > 0 ? round6(cloudAccumulator.executionTime / cloudRoutedCount) : 0,
        executionCost: cloudRoutedCount > 0 ? round6(cloudAccumulator.executionCost / cloudRoutedCount) : 0,
        energyUsageKWh: cloudRoutedCount > 0 ? round6(cloudAccumulator.energyUsage / cloudRoutedCount) : 0,
        energyUsageCost: cloudRoutedCount > 0 ? round6(cloudAccumulator.energyUsageCost / cloudRoutedCount) : 0,
        waitingTimeSeconds: cloudRoutedCount > 0 ? round6(cloudAccumulator.waitingTime / cloudRoutedCount) : 0,
        waitingTimeCost: cloudRoutedCount > 0 ? round6(cloudAccumulator.waitingTimeCost / cloudRoutedCount) : 0
      }
    }
  };
}