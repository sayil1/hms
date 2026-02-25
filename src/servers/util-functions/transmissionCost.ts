import { CheckHealthParameterInput } from "../dto/create-edge-server.dto";
import { estimateDataSizeFromBinary } from "./dataSize";


type TransmissionCostResult = {
    id: string;
    dataSizeMB: number;
    edge?: number;
    cloud?: number;
    betterServer: any;
}


export function compareTransmissionCosts(
    inputs: CheckHealthParameterInput[],
    edge: { bandwidth: number; bandwidthCostPerSecond: number },
    cloud: { bandwidth: number; bandwidthCostPerSecond: number }
) {
    let totalEdgeCost = 0;
    let totalCloudCost = 0;
    let totalOptimalCost = 0;
    let totalVendorCost = 0;

    const edgeResults: any[] = [];
    const cloudResults: any[] = [];
    const results: TransmissionCostResult[] = [];

    for (let index = 0; index < inputs.length; index++) {
        const input = inputs[index];

        const taskId = `task-${index + 1}-${input.key}`;
        const dataSizeMB = estimateDataSizeFromBinary(input);

        // -------------------------
        // 1️⃣ Base Transmission Times
        // -------------------------
        const baseEdgeTime = dataSizeMB / edge.bandwidth;

        const baseCloudTime =
            (dataSizeMB / edge.bandwidth) +   // upload
            (dataSizeMB / cloud.bandwidth);   // cloud ingress

        // -------------------------
        // 2️⃣ Time Jitter (±15%)
        // -------------------------
        const timeFluctuation = 0.15;

        const edgeTime =
            Math.max(
                0,
                baseEdgeTime *
                (1 + (Math.random() * 2 - 1) * timeFluctuation)
            );

        const cloudTime =
            Math.max(
                0,
                baseCloudTime *
                (1 + (Math.random() * 2 - 1) * timeFluctuation)
            );

        // -------------------------
        // 3️⃣ Base Transmission Cost
        // -------------------------
        let edgeCost =
            edgeTime * edge.bandwidthCostPerSecond;

        let cloudCost =
            cloudTime * cloud.bandwidthCostPerSecond;

        // -------------------------
        // 4️⃣ Cost Jitter
        // Edge ±10%
        // Cloud ±20%
        // -------------------------
        const edgeCostJitter =
            1 + (Math.random() * 0.2 - 0.1);

        const cloudCostJitter =
            1 + (Math.random() * 0.4 - 0.2);

        edgeCost *= edgeCostJitter;
        cloudCost *= cloudCostJitter;

        // -------------------------
        // 5️⃣ Occasional Cloud Discount
        // (Simulates pricing optimization or burst pricing)
        // 30% chance of 15% discount
        // -------------------------
        if (Math.random() < 0.3) {
            cloudCost *= 0.85;
        }

        // -------------------------
        // Totals
        // -------------------------
        totalEdgeCost += edgeCost;
        totalCloudCost += cloudCost;
        totalOptimalCost += Math.min(edgeCost, cloudCost);

        // Vendor overhead (extra 5% penalty)
        const vendorCost =
            cloudCost + (cloudCost * (Math.random() * 0.05));

        totalVendorCost += vendorCost;

        // -------------------------
        // Store Results
        // -------------------------
        edgeResults.push({
            id: taskId,
            dataSizeMB: +dataSizeMB.toFixed(6),
            transmissionCost: +edgeCost.toFixed(6),
            server: "Edge",
        });

        cloudResults.push({
            id: taskId,
            dataSizeMB: +dataSizeMB.toFixed(6),
            transmissionCost: +cloudCost.toFixed(6),
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
            vendor: +(totalVendorCost / count).toFixed(6),
        },
        total: {
            edge: +totalEdgeCost.toFixed(6),
            cloud: +totalCloudCost.toFixed(6),
            optimalCost: +totalOptimalCost.toFixed(6),
            vendor: +totalVendorCost.toFixed(6),
        },
        unit: "USD",
    };
}