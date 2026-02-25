import { estimateDataSizeFromBinary } from "./dataSize";

// type EnergyResult = {
//     id: string;
//     dataSizeMB: number;
//     edge: {
//         energyUsed: number;   // in kWh
//         energyCost: number;   // in USD
//     };
//     cloud: {
//         energyUsed: number;
//         energyCost: number;
//     };
// };

// type EnergySummary = {
//     results: EnergyResult[];
//     total: {
//         edge: {
//             energy: number;
//             cost: number;
//         };
//         cloud: {
//             energy: number;
//             cost: number;
//         };
//     };
//     averages: {
//         edge: {
//             energy: number;
//             cost: number;
//         };
//         cloud: {
//             energy: number;
//             cost: number;
//         };
//     };
//     unit: {
//         energy: 'kWh';
//         cost: 'USD';
//     };
// };

// export function calculateEnergyUsageAndCost(
//     inputs: [],
//     edge: { speed: number; power: number; costPerKWh: number },
//     cloud: { speed: number; power: number; costPerKWh: number }
// ): EnergySummary {
//     const results: EnergyResult[] = [];

//     let totalEdgeEnergy = 0;
//     let totalCloudEnergy = 0;
//     let totalEdgeCost = 0;
//     let totalCloudCost = 0;

//     for (let i = 0; i < inputs.length; i++) {
//         const task = inputs[i];
//         const { key, binary } = task;
//         const dataSizeMB = estimateDataSizeFromBinary(task); // S_i

//         // Execution time in seconds
//         const edgeExecTime = dataSizeMB / edge.speed;
//         const cloudExecTime = dataSizeMB / cloud.speed;

//         // Energy used in kWh
//         const edgeEnergy = (edge.power * edgeExecTime) / 3600 / 1000;
//         const cloudEnergy = (cloud.power * cloudExecTime) / 3600 / 1000;

//         // Cost
//         const edgeCost = edgeEnergy * edge.costPerKWh;
//         const cloudCost = cloudEnergy * cloud.costPerKWh;

//         totalEdgeEnergy += edgeEnergy;
//         totalCloudEnergy += cloudEnergy;
//         totalEdgeCost += edgeCost;
//         totalCloudCost += cloudCost;

//         results.push({
//             id: `task-${i + 1}-${key}`,
//             dataSizeMB: +dataSizeMB.toFixed(4),
//             edge: {
//                 energyUsed: +edgeEnergy.toFixed(6),
//                 energyCost: +edgeCost.toFixed(6),
//             },
//             cloud: {
//                 energyUsed: +cloudEnergy.toFixed(6),
//                 energyCost: +cloudCost.toFixed(6),
//             },
//         });
//     }

//     const count = inputs.length;
//     return {
//         results,
//         total: {
//             edge: {
//                 energy: +totalEdgeEnergy.toFixed(6),
//                 cost: +totalEdgeCost.toFixed(6),
//             },
//             cloud: {
//                 energy: +totalCloudEnergy.toFixed(6),
//                 cost: +totalCloudCost.toFixed(6),
//             },
//         },
//         averages: {
//             edge: {
//                 energy: +(totalEdgeEnergy / count).toFixed(6),
//                 cost: +(totalEdgeCost / count).toFixed(6),
//             },
//             cloud: {
//                 energy: +(totalCloudEnergy / count).toFixed(6),
//                 cost: +(totalCloudCost / count).toFixed(6),
//             },
//         },
//         unit: {
//             energy: 'kWh',
//             cost: 'USD',
//         },
//     };
// }


export type EnergyOnlyResult = {
    id: string;
    dataSizeMB: number;
    edgeEnergy: number;   // kWh
    cloudEnergy: number;  // kWh
};

export function calculateEnergyUsage(
    inputs: any[],
    edge: { speed: number; power: number; bandwidth: number },
    cloud: { speed: number; power: number; bandwidth: number }
) {
    const results: any[] = [];
    const edgeResults: any[] = [];
    const cloudResults: any[] = [];

    let totalEdgeEnergy = 0;
    let totalCloudEnergy = 0;

    for (let i = 0; i < inputs.length; i++) {
        const task = inputs[i];
        const taskId = `task-${i + 1}-${task.key}`;
        const dataSizeMB = estimateDataSizeFromBinary(task);

        const uploadTime = dataSizeMB / edge.bandwidth;
        const cloudProcessingTime = dataSizeMB / cloud.speed;
        const networkLatency = 0.05;

        const baseCloudTime =
            networkLatency +
            uploadTime +
            cloudProcessingTime;

        const baseEdgeTime = dataSizeMB / edge.speed;


        // 2. Add Jitter (±15% Fluctuation)
        // We give Edge a wider range (±25%) so it occasionally "lags" significantly
        const edgeJitter = (1 + (Math.random() * 0.5 - 0.50));
        const cloudJitter = (1 + (Math.random() * 0.2 - 0.1));

        const edgeExecTime = baseEdgeTime * edgeJitter;
        const cloudExecTime = baseCloudTime * cloudJitter;

        const edgeEnergy = (edge.power * edgeExecTime) / 3600 / 1000;
        const cloudEnergy = (cloud.power * cloudExecTime) / 3600 / 1000;

        totalEdgeEnergy += edgeEnergy;
        totalCloudEnergy += cloudEnergy;

        edgeResults.push({
            id: taskId,
            dataSizeMB: +dataSizeMB.toFixed(4),
            energyUsage: +edgeEnergy.toFixed(6),
            server: "Edge"
        });

        cloudResults.push({
            id: taskId,
            dataSizeMB: +dataSizeMB.toFixed(4),
            energyUsage: +cloudEnergy.toFixed(6),
            server: "Cloud"
        });

        results.push({
            id: taskId,
            dataSizeMB: +dataSizeMB.toFixed(4),
            betterServer: edgeEnergy < cloudEnergy ? "Edge" : "Cloud",
            edge: +edgeEnergy.toFixed(6),
            cloud: +cloudEnergy.toFixed(6),
            savings: +Math.abs(cloudEnergy - edgeEnergy).toFixed(6)
        });
    }

    const count = inputs.length || 1;

    return {
        results,
        edge: edgeResults,
        cloud: cloudResults,
        total: {
            edge: +totalEdgeEnergy.toFixed(6),
            cloud: +totalCloudEnergy.toFixed(6),
            savings: +(totalCloudEnergy - totalEdgeEnergy).toFixed(6)
        },
        averages: {
            edge: +(totalEdgeEnergy / count).toFixed(6),
            cloud: +(totalCloudEnergy / count).toFixed(6),
        },
        unit: "kWh"
    };
}


export function calculateEnergyCost(
    energyResults: any[], // This should be the 'results' array from the previous function
    edgeCostPerKWh: number,
    cloudCostPerKWh: number
) {
    const results: any[] = [];
    const edgeResults: any[] = [];
    const cloudResults: any[] = [];

    let totalEdgeCost = 0;
    let totalCloudCost = 0;

    // IMPORTANT: Ensure energyResults is an array
    const dataArray = Array.isArray(energyResults) ? energyResults : [];

    for (let i = 0; i < dataArray.length; i++) {
        const item = dataArray[i];


        // CHECK: Do these property names match exactly what energyUsage returns?
        // If your energy function used 'edgeEnergy', use that. If it used 'energyUsage', change this.
        const eEnergy = item.edge || 0;
        const cEnergy = item.cloud || 0;

        const priceJitter = () => (1 + (Math.random() * 0.2 - 0.1));

        const edgeCost = (eEnergy * edgeCostPerKWh) * priceJitter();
        const cloudCost = (cEnergy * cloudCostPerKWh) * priceJitter();

        totalEdgeCost += edgeCost;
        totalCloudCost += cloudCost;

        edgeResults.push({
            id: item.id,
            cost: +edgeCost.toFixed(6),
            server: "Edge"
        });

        cloudResults.push({
            id: item.id,
            cost: +cloudCost.toFixed(6),
            server: "Cloud"
        });

        results.push({
            id: item.id,
            betterServer: edgeCost < cloudCost ? "Edge" : "Cloud",
            edgeCost: +edgeCost.toFixed(6),
            cloudCost: +cloudCost.toFixed(6),
            savings: +(cloudCost - edgeCost).toFixed(6)
        });
    }

    const count = dataArray.length || 1;

    return {
        results,
        edge: edgeResults,
        cloud: cloudResults,
        total: {
            edge: +totalEdgeCost.toFixed(6),
            cloud: +totalCloudCost.toFixed(6),
            savings: +(totalCloudCost - totalEdgeCost).toFixed(6)
        },
        averages: {
            edge: +(totalEdgeCost / count).toFixed(6),
            cloud: +(totalCloudCost / count).toFixed(6),
        },
        unit: "USD"
    };
}