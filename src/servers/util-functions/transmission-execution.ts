import { estimateDataSizeFromBinary } from "./dataSize";

type ExecutionResult = {
    id: string;
    edge: {
        execTime: number;
        cost: number;
    };
    cloud: {
        execTime: number;
        cost: number;
    };
};

type ExecutionSummary = {
    results: ExecutionResult[];
    averages: {
        edgeExecTime: number;
        cloudExecTime: number;
        totalExecTime: number;
        systemAvgExecTime: number;
        edgeCost: number;
        cloudCost: number;
        totalCost: number;
        systemAvgCost: number;
    };
    total: {
        edgeExecTime: number;
        cloudExecTime: number;
        edgeCost: number;
        cloudCost: number;
    };
    unit: 'seconds';
};

export function calculateExecutionMetrics(
    inputs: [],
    edge: { speed: number; cost: number },
    cloud: { speed: number; cost: number }
): ExecutionSummary {
    const results: ExecutionResult[] = [];

    let totalEdgeTime = 0;
    let totalCloudTime = 0;
    let totalEdgeCost = 0;
    let totalCloudCost = 0;

    for (let i = 0; i < inputs.length; i++) {
        const task = inputs[i];
        const { key } = task;
        const dataSizeMB = estimateDataSizeFromBinary(task); // S_i

        const edgeExecTime = dataSizeMB / edge.speed; // ECT(T_i, R_ke) = S_i / α(R_ke)
        const cloudExecTime = dataSizeMB / cloud.speed; // ECT(T_i, R_kc) = S_i / α(R_kc)

        const edgeCost = edgeExecTime * edge.cost; // EC = ECT * CR_e
        const cloudCost = cloudExecTime * cloud.cost; // EC = ECT * CR_c

        totalEdgeTime += edgeExecTime;
        totalCloudTime += cloudExecTime;
        totalEdgeCost += edgeCost;
        totalCloudCost += cloudCost;

        results.push({
            id: `task-${i + 1}-${key}`,
            edge: {
                execTime: +edgeExecTime.toFixed(6),
                cost: +edgeCost.toFixed(6),
            },
            cloud: {
                execTime: +cloudExecTime.toFixed(6),
                cost: +cloudCost.toFixed(6),
            },
        });
    }

    const count = results.length;
    const totalExecTime = totalEdgeTime + totalCloudTime;
    const totalCost = totalEdgeCost + totalCloudCost;

    return {
        results,
        averages: {
            edgeExecTime: +(totalEdgeTime / count).toFixed(6),
            cloudExecTime: +(totalCloudTime / count).toFixed(6),
            totalExecTime: +totalExecTime.toFixed(6),
            systemAvgExecTime: +(totalExecTime / (2 * count)).toFixed(6),
            edgeCost: +(totalEdgeCost / count).toFixed(6),
            cloudCost: +(totalCloudCost / count).toFixed(6),
            totalCost: +totalCost.toFixed(6),
            systemAvgCost: +(totalCost / (2 * count)).toFixed(6),
        },
        total: {
            edgeExecTime: +totalEdgeTime.toFixed(6),
            cloudExecTime: +totalCloudTime.toFixed(6),
            edgeCost: +totalEdgeCost.toFixed(6),
            cloudCost: +totalCloudCost.toFixed(6),
        },
        unit: 'seconds',
    };
}
