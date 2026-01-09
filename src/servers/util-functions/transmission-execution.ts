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
    const results: any[] = [];

    let totalEdgeTime = 0;
    let totalCloudTime = 0;
    let totalEdgeCost = 0;
    let totalCloudCost = 0;
    const noise = (Math.floor(Math.random() * 201) - 100) * 0.00001;


    for (let i = 0; i < inputs.length; i++) {
        const task = inputs[i];
        const { key } = task;
        const dataSizeMB = estimateDataSizeFromBinary(task);

        // 1. Calculate potential execution times and costs
        const edgeExecTime = dataSizeMB / edge.speed;
        const cloudExecTime = dataSizeMB / cloud.speed;

        const edgeCost = edgeExecTime * edge.cost;
        const cloudCost = cloudExecTime * cloud.cost;

        // 2. Determine the winner (based on lowest cost)
        // You could also use (edgeExecTime < cloudExecTime) if speed is the priority
        const isEdgeBetter = edgeCost < (cloudCost + noise);


        // 3. Create the result object based on the winner
        const resultEntry = {
            id: `task-${i + 1}-${key}`,
            dataSizeMB, // Optional: helpful for debugging
            betterServer: isEdgeBetter ? 'Edge' : 'Cloud'
        };

        if (isEdgeBetter) {
            // Winner: Edge
            totalEdgeTime += edgeExecTime;
            totalEdgeCost += edgeCost;

            results.push({
                ...resultEntry,
                edge: {
                    execTime: +edgeExecTime.toFixed(6),
                    cost: +edgeCost.toFixed(6),
                }
            });
        } else {
            // Winner: Cloud
            totalCloudTime += cloudExecTime;
            totalCloudCost += cloudCost;

            results.push({
                ...resultEntry,
                cloud: {
                    execTime: +cloudExecTime.toFixed(6),
                    cost: +cloudCost.toFixed(6),
                }
            });
        }
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
