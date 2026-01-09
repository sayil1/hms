import { CheckHealthParameterInput } from "../dto/create-edge-server.dto";
import { estimateDataSizeFromBinary } from "./dataSize";


type TaskResult = {
    id: string;
    dataSizeMB: number;
    edge?: number;
    cloud?: number;
    betterServer: any;
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
        const edgeTime = dataSizeMB / edge.bandwidth;
        const cloudTime = (dataSizeMB / edge.bandwidth) + (dataSizeMB / cloud.bandwidth);

        const noise = (Math.floor(Math.random() * 201) - 100) * 0.00001;
        const isEdgeBetter = edgeTime < (cloudTime + noise);

        totalEdgeTime += edgeTime;
        totalOptimalTime += Math.min(edgeTime, cloudTime);
        vendorTime += (Math.random() * 0.00004 + 0.00001) + cloudTime;

        const baseInfo = {
            id: `task-${index + 1}-${input.key}`,
            dataSizeMB,
            betterServer: isEdgeBetter ? "Edge" : "Cloud"
        };

        if (isEdgeBetter) {
            return {
                ...baseInfo,
                edge: parseFloat(edgeTime.toFixed(6))
            };
        } else {
            totalCloudTime += cloudTime;
            return {
                ...baseInfo,
                cloud: parseFloat(cloudTime.toFixed(6))
            };
        }
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


