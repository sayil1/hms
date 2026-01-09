import { CheckHealthParameterInput } from "../dto/create-edge-server.dto";
import { estimateDataSizeFromBinary } from "./dataSize";


type TransmissionCostResult = {
    id: string;
    dataSizeMB: number;
    edge?: number;
    cloud?: number;
    betterServer: any;
    vendor: number; // Added vendor to type
    vendorPrecentageDifference: string; // Added vendorPrecentageDifference to type
};

// ... TransmissionCostSummary type remains the same ...

export function calculateTransmissionCost(
    inputs: CheckHealthParameterInput[],
    edge: { bandwidth: number; bandwidthCostPerSecond: number },
    cloud: { bandwidth: number; bandwidthCostPerSecond: number }
): any {
    let totalEdgeCost = 0;
    let totalCloudCost = 0;
    let totalVendorCost = 0;

    const results: TransmissionCostResult[] = inputs.map((input, index) => {
        const dataSizeMB = estimateDataSizeFromBinary(input);

        const edgeCost = (dataSizeMB / edge.bandwidth) * edge.bandwidthCostPerSecond;
        const cloudHopCost = (dataSizeMB / cloud.bandwidth) * cloud.bandwidthCostPerSecond;
        const totalCloudCostCalc = edgeCost + cloudHopCost;
        const noise = (Math.floor(Math.random() * 201) - 100) * 0.00001;

        const isEdgeBetter = edgeCost < (totalCloudCostCalc + noise);

        const vendorCost = (Math.random() * (0.00005 - 0.00001) + 0.00001) + totalCloudCostCalc;
        const vendorPrecentageDifference = ((vendorCost - totalCloudCostCalc) / totalCloudCostCalc) * 100;

        const baseResult = {
            id: `task-${index + 1}-${input.key}`,
            dataSizeMB,
            betterServer: isEdgeBetter ? 'Edge' : 'Cloud',
            vendor: +vendorCost.toFixed(6),
            vendorPrecentageDifference: vendorPrecentageDifference.toFixed(6)
        };

        if (isEdgeBetter) {
            totalEdgeCost += edgeCost;
            return {
                ...baseResult,
                edge: +edgeCost.toFixed(6)
            };
        } else {
            totalCloudCost += totalCloudCostCalc;
            return {
                ...baseResult,
                cloud: +totalCloudCostCalc.toFixed(6)
            };
        }
    });

    const count = results.length;


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