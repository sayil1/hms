import { CheckHealthParameterInput } from "../dto/create-edge-server.dto";
import { estimateDataSizeFromBinary } from "./dataSize";


type TransmissionCostResult = {
    id: string;
    dataSizeMB: number;
    edge: number;
    cloud: number;
    betterServer: 'Edge' | 'Cloud';
};

type TransmissionCostSummary = {
    results: TransmissionCostResult[];
    averages: {
        edge: number;
        cloud: number;
        averageTransmissionCost: number;
    };
};


export function calculateTransmissionCost(
    inputs: CheckHealthParameterInput[],
    edge: { bandwidth: number; bandwidthCostPerSecond: number },
    cloud: { bandwidth: number; bandwidthCostPerSecond: number }
): TransmissionCostSummary {
    let totalEdgeCost = 0;   // <--- Initialize to 0
    let totalCloudCost = 0;  // <--- Initialize to 0

    const results: TransmissionCostResult[] = inputs.map((input, index) => {
        const dataSizeMB = estimateDataSizeFromBinary(input);

        const edgeCost = (dataSizeMB / edge.bandwidth) * edge.bandwidthCostPerSecond;

        const cloudCost =
            (dataSizeMB / edge.bandwidth) * edge.bandwidthCostPerSecond + // Cost to edge
            (dataSizeMB / cloud.bandwidth) * cloud.bandwidthCostPerSecond; // Cost from edge to cloud

        totalEdgeCost += edgeCost;
        totalCloudCost += cloudCost;

        console.log(`Task ${index + 1}: Edge Cost = ${edgeCost}, Cloud Cost = ${cloudCost}`);

        return {
            id: `task-${index + 1}-${input.key}`,
            dataSizeMB,
            edge: +edgeCost.toFixed(6),
            cloud: +cloudCost.toFixed(6),
            betterServer: edgeCost < cloudCost ? 'Edge' : 'Cloud',
        };
    });

    const count = results.length;

    // Handle the case where inputs is empty to avoid division by zero
    if (count === 0) {
        return {
            results: [],
            averages: {
                edge: 0,
                cloud: 0,
                averageTransmissionCost: 0,
            },
        };
    }

    return {
        results,
        averages: {
            edge: +(totalEdgeCost / count).toFixed(6),
            cloud: +(totalCloudCost / count).toFixed(6),
            averageTransmissionCost: +((totalEdgeCost + totalCloudCost) / count).toFixed(6),
        },
    };
}