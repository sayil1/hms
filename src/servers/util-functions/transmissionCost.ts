import { CheckHealthParameterInput } from "../dto/create-edge-server.dto";
import { estimateDataSizeFromBinary } from "./dataSize";


type TransmissionCostResult = {
    id: string;
    dataSizeMB: number;
    edge: number;
    cloud: number;
    betterServer: 'Edge' | 'Cloud';
    vendor: number; // Added vendor to type
    vendorPrecentageDifference: string; // Added vendorPrecentageDifference to type
};

// ... TransmissionCostSummary type remains the same ...

export function calculateTransmissionCost(
    inputs: CheckHealthParameterInput[],
    edge: { bandwidth: number; bandwidthCostPerSecond: number },
    cloud: { bandwidth: number; bandwidthCostPerSecond: number }
): any {
    let totalEdgeCost = 0;   // <--- Initialize to 0
    let totalCloudCost = 0;  // <--- Initialize to 0
    let totalVendorCost = 0; // <--- Initialize to 0

    const results: TransmissionCostResult[] = inputs.map((input, index) => {
        const dataSizeMB = estimateDataSizeFromBinary(input);

        const edgeCost = (dataSizeMB / edge.bandwidth) * edge.bandwidthCostPerSecond;

        const cloudCost =
            (dataSizeMB / edge.bandwidth) * edge.bandwidthCostPerSecond + // Cost to edge
            (dataSizeMB / cloud.bandwidth) * cloud.bandwidthCostPerSecond; // Cost from edge to cloud

        let vendorCost = (Math.random() * (0.00005 - 0.00001) + 0.00001) + cloudCost;
        // NOTE: The percentage calculation is now a positive markup
        let vendorPrecentageDifference = ((vendorCost - cloudCost) / cloudCost) * 100;

        // **FIX: ACCUMULATE TOTAL COSTS HERE**
        totalEdgeCost += edgeCost;
        totalCloudCost += cloudCost;
        totalVendorCost += vendorCost;

        // console.log(`Task ${index + 1}: Edge Cost = ${edgeCost}, Cloud Cost = ${cloudCost}`);

        return {
            id: `task-${index + 1}-${input.key}`,
            dataSizeMB,
            edge: +edgeCost.toFixed(6),
            cloud: +cloudCost.toFixed(6),
            betterServer: edgeCost < cloudCost ? 'Edge' : 'Cloud',
            vendor: +vendorCost.toFixed(6),
            vendorPrecentageDifference: vendorPrecentageDifference.toFixed(6)

        };
    });

    const count = results.length;

    // ... (rest of the function for handling empty input and return remains the same)

    if (count === 0) {
        return {
            results: [],
            averages: { edge: 0, cloud: 0, averageTransmissionCost: 0, vendor: 0 },
            total: { edge: 0, cloud: 0 },
            unit: 'dollars'
        };
    }

    return {
        results,
        averages: {
            edge: +(totalEdgeCost / count).toFixed(6),
            cloud: +(totalCloudCost / count).toFixed(6),
            averageTransmissionCost: +((totalEdgeCost + totalCloudCost) / count).toFixed(6),
            vendor: +(totalVendorCost / count).toFixed(6)
        },
        total: {
            edge: +totalEdgeCost.toFixed(6),
            cloud: +totalCloudCost.toFixed(6),
            vendor: +totalVendorCost.toFixed(6),
        },
        unit: 'dollars'
    };
}