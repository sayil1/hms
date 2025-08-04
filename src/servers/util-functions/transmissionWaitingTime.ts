// import { estimateDataSizeFromBinary } from "./dataSize";

// type QueuingTimeResult = {
//     id: string;
//     arrivalTime: number;
//     edge: {
//         wait: number;
//         startTime: number;
//         finishTime: number;
//     };
//     cloud: {
//         wait: number;
//         startTime: number;
//         finishTime: number;
//     };
// };

// type QueuingTimeSummary = {
//     results: QueuingTimeResult[];
//     averages: {
//         edge: number;
//         cloud: number;
//         averageQueuingTime: number;
//     };
//     total: {
//         edge: number;
//         cloud: number;
//     };
//     unit: 'seconds';
// };
// export function calculateQueuingTime(
//     inputs: [],
//     edge: { speed: number },
//     cloud: { speed: number }
// ): QueuingTimeSummary {
//     const results: QueuingTimeResult[] = [];

//     let lastEdgeFinish = 0;
//     let lastCloudFinish = 0;

//     let totalEdgeWait = 0;
//     let totalCloudWait = 0;

//     // All tasks arrive at time zero
//     const arrivalTime = 0;

//     for (let i = 0; i < inputs.length; i++) {
//         const task = inputs[i];
//         const { key } = task;
//         const dataSizeMB = estimateDataSizeFromBinary(task);


//         const edgeExecTime = dataSizeMB / edge.speed;
//         const cloudExecTime = dataSizeMB / cloud.speed;

//         // EDGE server queuing
//         const edgeWait = Math.max(0, lastEdgeFinish - arrivalTime);
//         const edgeStart = Math.max(arrivalTime, lastEdgeFinish);
//         const edgeFinish = edgeStart + edgeExecTime;

//         lastEdgeFinish = edgeFinish;
//         totalEdgeWait += edgeWait;

//         // CLOUD server queuing
//         const cloudWait = Math.max(0, lastCloudFinish - arrivalTime);
//         const cloudStart = Math.max(arrivalTime, lastCloudFinish);
//         const cloudFinish = cloudStart + cloudExecTime;

//         lastCloudFinish = cloudFinish;
//         totalCloudWait += cloudWait;

//         results.push({
//             id: `task-${i + 1}-${key}`,
//             arrivalTime,
//             edge: {
//                 wait: +edgeWait.toFixed(6),
//                 startTime: +edgeStart.toFixed(6),
//                 finishTime: +edgeFinish.toFixed(6),
//             },
//             cloud: {
//                 wait: +cloudWait.toFixed(6),
//                 startTime: +cloudStart.toFixed(6),
//                 finishTime: +cloudFinish.toFixed(6),
//             },
//         });
//     }

//     const count = results.length;
//     return {
//         results,
//         averages: {
//             edge: +(totalEdgeWait / count).toFixed(6),
//             cloud: +(totalCloudWait / count).toFixed(6),
//             averageQueuingTime: +((totalEdgeWait + totalCloudWait) / (2 * count)).toFixed(6),
//         },
//         total: {
//             edge: +totalEdgeWait.toFixed(6),
//             cloud: +totalCloudWait.toFixed(6),
//         },
//         unit: 'seconds',
//     };
// }



import { estimateDataSizeFromBinary } from "./dataSize";

type QueuingTimeResult = {
    id: string;
    arrivalTime: number;
    edge: {
        wait: number;
        startTime: number;
        finishTime: number;
        cost: number;
    };
    cloud: {
        wait: number;
        startTime: number;
        finishTime: number;
        cost: number;
    };
};

type QueuingTimeSummary = {
    results: QueuingTimeResult[];
    averages: {
        edge: number;
        cloud: number;
        averageQueuingTime: number;
        edgeCost: number;
        cloudCost: number;
        systemCost: number;
    };
    total: {
        edge: number;
        cloud: number;
        edgeCost: number;
        cloudCost: number;
        systemCost: number;
    };
    unit: 'seconds';
};

export function calculateQueuingTime(
    inputs: any[],
    edge: { speed: number, queueCostPerSecond: number },
    cloud: { speed: number, queueCostPerSecond: number },
): QueuingTimeSummary {
    const results: QueuingTimeResult[] = [];

    let lastEdgeFinish = 0;
    let lastCloudFinish = 0;

    let totalEdgeWait = 0;
    let totalCloudWait = 0;
    let totalEdgeCost = 0;
    let totalCloudCost = 0;

    const arrivalTime = 0;

    for (let i = 0; i < inputs.length; i++) {
        const task = inputs[i];
        const { key } = task;
        const dataSizeMB = estimateDataSizeFromBinary(task);

        const edgeExecTime = dataSizeMB / edge.speed;
        const cloudExecTime = dataSizeMB / cloud.speed;

        // EDGE queuing
        const edgeWait = Math.max(0, lastEdgeFinish - arrivalTime);
        const edgeStart = Math.max(arrivalTime, lastEdgeFinish);
        const edgeFinish = edgeStart + edgeExecTime;
        const edgeCost = edgeWait * edge.queueCostPerSecond;

        lastEdgeFinish = edgeFinish;
        totalEdgeWait += edgeWait;
        totalEdgeCost += edgeCost;

        // CLOUD queuing
        const cloudWait = Math.max(0, lastCloudFinish - arrivalTime);
        const cloudStart = Math.max(arrivalTime, lastCloudFinish);
        const cloudFinish = cloudStart + cloudExecTime;
        const cloudCost = cloudWait * cloud.queueCostPerSecond;

        lastCloudFinish = cloudFinish;
        totalCloudWait += cloudWait;
        totalCloudCost += cloudCost;

        results.push({
            id: `task-${i + 1}-${key}`,
            arrivalTime,
            edge: {
                wait: +edgeWait.toFixed(6),
                startTime: +edgeStart.toFixed(6),
                finishTime: +edgeFinish.toFixed(6),
                cost: +edgeCost.toFixed(6),
            },
            cloud: {
                wait: +cloudWait.toFixed(6),
                startTime: +cloudStart.toFixed(6),
                finishTime: +cloudFinish.toFixed(6),
                cost: +cloudCost.toFixed(6),
            },
        });
    }

    const count = results.length;
    const totalSystemCost = totalEdgeCost + totalCloudCost;

    return {
        results,
        averages: {
            edge: +(totalEdgeWait / count).toFixed(6),
            cloud: +(totalCloudWait / count).toFixed(6),
            averageQueuingTime: +((totalEdgeWait + totalCloudWait) / (2 * count)).toFixed(6),
            edgeCost: +(totalEdgeCost / count).toFixed(6),
            cloudCost: +(totalCloudCost / count).toFixed(6),
            systemCost: +(totalSystemCost / count).toFixed(6),
        },
        total: {
            edge: +totalEdgeWait.toFixed(6),
            cloud: +totalCloudWait.toFixed(6),
            edgeCost: +totalEdgeCost.toFixed(6),
            cloudCost: +totalCloudCost.toFixed(6),
            systemCost: +totalSystemCost.toFixed(6),
        },
        unit: 'seconds',
    };
}
