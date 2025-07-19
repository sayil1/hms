import { CheckHealthParameterInput } from "../dto/create-edge-server.dto";
import { estimateDataSizeFromBinary } from "./dataSize";


type TaskResult = {
    id: string;
    dataSizeMB: number;
    edge: number;
    cloud: number;
    betterServer: "Edge" | "Cloud";
};




export function compareTransmissionTimes(
    inputs: CheckHealthParameterInput[],
    edge: any,
    cloud: any
): any {
    let totalEdgeTime = 0;
    let totalCloudTime = 0;
    let totalOptimalTime = 0;

    const results: TaskResult[] = inputs.map((input, index) => {
        const dataSizeMB = estimateDataSizeFromBinary(input);
        const edgeData = dataSizeMB / edge.bandwidth;
        const cloudData = (dataSizeMB / edge.bandwidth) + (dataSizeMB / cloud.bandwidth);

        totalEdgeTime += edgeData;
        totalCloudTime += cloudData;
        totalOptimalTime += Math.min(edgeData, cloudData);

        return {
            id: `task-${index + 1}-${input.key}`,
            dataSizeMB,
            edge: parseFloat(edgeData.toFixed(6)),
            cloud: parseFloat(cloudData.toFixed(6)),
            betterServer: edgeData < cloudData ? "Edge" : "Cloud",
            unit: 'seconds'
        };
    });
    const averages = calculateAverageTimes(results);

    return { results, averages };
}

function calculateAverageTimes(results) {
    const edgeSum = results.reduce((sum, item) => sum + item.edgeTime, 0);
    const cloudSum = results.reduce((sum, item) => sum + item.cloudTime, 0);

    return {
        edge: edgeSum / results.length,
        cloud: cloudSum / results.length
    };
}

