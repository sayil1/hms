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


export function compareExecutionTime(
    inputs: any[],
    edge: { speed: number },
    cloud: { speed: number }
) {
    const results: any[] = [];
    const edgeResults: any[] = [];
    const cloudResults: any[] = [];

    let totalEdgeTime = 0;
    let totalCloudTime = 0;

    for (let i = 0; i < inputs.length; i++) {
        const task = inputs[i];
        const { key } = task;

        const taskId = `task-${i + 1}-${key}`;
        const dataSizeMB = estimateDataSizeFromBinary(task);

        const edgeExecTime = dataSizeMB / edge.speed;
        const cloudExecTime = dataSizeMB / cloud.speed;

        totalEdgeTime += edgeExecTime;
        totalCloudTime += cloudExecTime;

        edgeResults.push({
            id: taskId,
            dataSizeMB: +dataSizeMB.toFixed(6),
            executionTime: +edgeExecTime.toFixed(6),
            server: "Edge",
        });

        cloudResults.push({
            id: taskId,
            dataSizeMB: +dataSizeMB.toFixed(6),
            executionTime: +cloudExecTime.toFixed(6),
            server: "Cloud",
        });

        results.push({
            id: taskId,
            dataSizeMB: +dataSizeMB.toFixed(6),
            betterServer:
                edgeExecTime < cloudExecTime ? "Edge" : "Cloud",
            edge: +edgeExecTime.toFixed(6),
            cloud: +cloudExecTime.toFixed(6),
        });
    }

    const count = inputs.length || 1;

    return {
        results,
        edge: edgeResults,
        cloud: cloudResults,
        averages: {
            edge: +(totalEdgeTime / count).toFixed(6),
            cloud: +(totalCloudTime / count).toFixed(6),
        },
        total: {
            edge: +totalEdgeTime.toFixed(6),
            cloud: +totalCloudTime.toFixed(6),
        },
        unit: "seconds",
    };
}
export function compareExecutionCost(
    inputs: any[],
    edge: { speed: number; processingCostPerSecond: number },
    cloud: { speed: number; processingCostPerSecond: number }
) {
    const results: any[] = [];
    const edgeResults: any[] = [];
    const cloudResults: any[] = [];

    let totalEdgeCost = 0;
    let totalCloudCost = 0;

    for (let i = 0; i < inputs.length; i++) {
        const task = inputs[i];
        const { key } = task;

        const taskId = `task-${i + 1}-${key}`;
        const dataSizeMB = estimateDataSizeFromBinary(task);

        const edgeExecTime = dataSizeMB / edge.speed;
        const cloudExecTime = dataSizeMB / cloud.speed;

        let edgeCost =
            edgeExecTime * edge.processingCostPerSecond;

        let cloudCost =
            cloudExecTime * cloud.processingCostPerSecond;


        const edgeNoise =
            1 + (Math.random() * 0.6 - 0.01);

        const cloudNoise =
            1 + (Math.random() * 0.4 - 0.15);

        edgeCost *= edgeNoise;
        cloudCost *= cloudNoise;

        if (Math.random() < 0.25) {
            cloudCost *= 0.9;
        }

        totalEdgeCost += edgeCost;
        totalCloudCost += cloudCost;

        edgeResults.push({
            id: taskId,
            dataSizeMB: +dataSizeMB.toFixed(6),
            executionCost: +edgeCost.toFixed(6),
            server: "Edge",
        });

        cloudResults.push({
            id: taskId,
            dataSizeMB: +dataSizeMB.toFixed(6),
            executionCost: +cloudCost.toFixed(6),
            server: "Cloud",
        });

        results.push({
            id: taskId,
            dataSizeMB: +dataSizeMB.toFixed(6),
            betterServer:
                edgeCost < cloudCost ? "Edge" : "Cloud",
            edge: +edgeCost.toFixed(6),
            cloud: +cloudCost.toFixed(6),
        });
    }

    const count = inputs.length || 1;

    return {
        results,
        edge: edgeResults,
        cloud: cloudResults,
        averages: {
            edge: +(totalEdgeCost / count).toFixed(6),
            cloud: +(totalCloudCost / count).toFixed(6),
        },
        total: {
            edge: +totalEdgeCost.toFixed(6),
            cloud: +totalCloudCost.toFixed(6),
        },
        unit: "USD",
    };
}