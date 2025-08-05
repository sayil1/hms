import { estimateDataSizeFromBinary } from "./dataSize";

type EnergyResult = {
    id: string;
    dataSizeMB: number;
    edge: {
        energyUsed: number;   // in kWh
        energyCost: number;   // in USD
    };
    cloud: {
        energyUsed: number;
        energyCost: number;
    };
};

type EnergySummary = {
    results: EnergyResult[];
    total: {
        edge: {
            energy: number;
            cost: number;
        };
        cloud: {
            energy: number;
            cost: number;
        };
    };
    averages: {
        edge: {
            energy: number;
            cost: number;
        };
        cloud: {
            energy: number;
            cost: number;
        };
    };
    unit: {
        energy: 'kWh';
        cost: 'USD';
    };
};

export function calculateEnergyUsageAndCost(
    inputs: [],
    edge: { speed: number; power: number; costPerKWh: number },
    cloud: { speed: number; power: number; costPerKWh: number }
): EnergySummary {
    const results: EnergyResult[] = [];

    let totalEdgeEnergy = 0;
    let totalCloudEnergy = 0;
    let totalEdgeCost = 0;
    let totalCloudCost = 0;

    for (let i = 0; i < inputs.length; i++) {
        const task = inputs[i];
        const { key, binary } = task;
        const dataSizeMB = estimateDataSizeFromBinary(task); // S_i

        // Execution time in seconds
        const edgeExecTime = dataSizeMB / edge.speed;
        const cloudExecTime = dataSizeMB / cloud.speed;

        // Energy used in kWh
        const edgeEnergy = (edge.power * edgeExecTime) / 3600 / 1000;
        const cloudEnergy = (cloud.power * cloudExecTime) / 3600 / 1000;

        // Cost
        const edgeCost = edgeEnergy * edge.costPerKWh;
        const cloudCost = cloudEnergy * cloud.costPerKWh;

        totalEdgeEnergy += edgeEnergy;
        totalCloudEnergy += cloudEnergy;
        totalEdgeCost += edgeCost;
        totalCloudCost += cloudCost;

        results.push({
            id: `task-${i + 1}-${key}`,
            dataSizeMB: +dataSizeMB.toFixed(4),
            edge: {
                energyUsed: +edgeEnergy.toFixed(6),
                energyCost: +edgeCost.toFixed(6),
            },
            cloud: {
                energyUsed: +cloudEnergy.toFixed(6),
                energyCost: +cloudCost.toFixed(6),
            },
        });
    }

    const count = inputs.length;
    return {
        results,
        total: {
            edge: {
                energy: +totalEdgeEnergy.toFixed(6),
                cost: +totalEdgeCost.toFixed(6),
            },
            cloud: {
                energy: +totalCloudEnergy.toFixed(6),
                cost: +totalCloudCost.toFixed(6),
            },
        },
        averages: {
            edge: {
                energy: +(totalEdgeEnergy / count).toFixed(6),
                cost: +(totalEdgeCost / count).toFixed(6),
            },
            cloud: {
                energy: +(totalCloudEnergy / count).toFixed(6),
                cost: +(totalCloudCost / count).toFixed(6),
            },
        },
        unit: {
            energy: 'kWh',
            cost: 'USD',
        },
    };
}
