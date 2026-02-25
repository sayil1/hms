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
    edge: { bandwidth: number },
    cloud: { bandwidth: number }
) {
    let totalEdgeTime = 0;
    let totalCloudTime = 0;
    let totalOptimalTime = 0;
    let totalVendorTime = 0;

    const edgeResults: any[] = [];
    const cloudResults: any[] = [];
    const results: TaskResult[] = [];

    for (let index = 0; index < inputs.length; index++) {
        const input = inputs[index];

        const taskId = `task-${index + 1}-${input.key}`;
        const dataSizeMB = estimateDataSizeFromBinary(input);

        // Base times
        const baseEdgeTime = dataSizeMB / edge.bandwidth;
        const baseCloudTime =
            (dataSizeMB / edge.bandwidth) +
            (dataSizeMB / cloud.bandwidth);

        // Percentage-based jitter (±15%)
        const fluctuationRange = 0.15;

        const edgeFluctuation =
            (Math.random() * 2 - 1) * fluctuationRange;

        const cloudFluctuation =
            (Math.random() * 2 - 1) * fluctuationRange;

        const edgeTime = Math.max(
            0,
            baseEdgeTime * (1 + edgeFluctuation)
        );

        const cloudTime = Math.max(
            0,
            baseCloudTime * (1 + cloudFluctuation)
        );

        totalEdgeTime += edgeTime;
        totalCloudTime += cloudTime;
        totalOptimalTime += Math.min(edgeTime, cloudTime);

        const vendorOverhead =
            baseCloudTime * (Math.random() * 0.05);

        const vendorTime = cloudTime + vendorOverhead;
        totalVendorTime += vendorTime;

        edgeResults.push({
            id: taskId,
            dataSizeMB: +dataSizeMB.toFixed(6),
            transmissionTime: +edgeTime.toFixed(6),
            server: "Edge",
        });

        cloudResults.push({
            id: taskId,
            dataSizeMB: +dataSizeMB.toFixed(6),
            transmissionTime: +cloudTime.toFixed(6),
            server: "Cloud",
        });

        results.push({
            id: taskId,
            dataSizeMB: +dataSizeMB.toFixed(6),
            betterServer:
                edgeTime < cloudTime ? "Edge" : "Cloud",
            edge: +edgeTime.toFixed(6),
            cloud: +cloudTime.toFixed(6),
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
            vendor: +(totalVendorTime / count).toFixed(6),
        },
        total: {
            edge: +totalEdgeTime.toFixed(6),
            cloud: +totalCloudTime.toFixed(6),
            optimalTime: +totalOptimalTime.toFixed(6),
            vendor: +totalVendorTime.toFixed(6),
        },
        unit: "seconds",
    };
}