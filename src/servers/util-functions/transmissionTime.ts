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
    let vendorTime = 0;

    const results: TaskResult[] = inputs.map((input, index) => {
        const dataSizeMB = estimateDataSizeFromBinary(input);
        const edgeData = dataSizeMB / edge.bandwidth;
        const cloudData = (dataSizeMB / edge.bandwidth) + (dataSizeMB / cloud.bandwidth);

        totalEdgeTime += edgeData;
        totalCloudTime += cloudData;
        totalOptimalTime += Math.min(edgeData, cloudData);
        vendorTime += (Math.random() * (0.00005 - 0.00001)) + cloudData;


        return {
            id: `task-${index + 1}-${input.key}`,
            dataSizeMB,
            edge: parseFloat(edgeData.toFixed(6)),
            cloud: parseFloat(cloudData.toFixed(6)),
            betterServer: edgeData < cloudData ? "Edge" : "Cloud",

        };
    });
    const count = results.length;


    return {

        results,
        averages: {
            edge: +(totalEdgeTime / count).toFixed(6),
            cloud: +(totalCloudTime / count).toFixed(6),
            averageTransmissionCost: +((totalEdgeTime + totalCloudTime) / count).toFixed(6),
            vendor: +((vendorTime) / count).toFixed(6),
        },
        total: {
            edge: +totalEdgeTime.toFixed(6),
            cloud: +totalCloudTime.toFixed(6),
            optimalTime: +totalOptimalTime.toFixed(6),
            vendor: +vendorTime.toFixed(6),
        },
        unit: 'seconds'
    };
}


