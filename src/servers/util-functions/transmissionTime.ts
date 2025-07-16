type CheckHealthParameterInput = {
    age: number;
    sex: 'male' | 'female';
    key: string;
    inputValues: Record<string, number>;
};

type TaskResult = {
    id: string;
    dataSizeMB: number;
    edgeTime: number;
    cloudTime: number;
    betterServer: "Edge" | "Cloud";
};



// 1️⃣ Estimate data size in MB based on raw binary (Float64) + overhead
export function estimateDataSizeFromBinary(input: CheckHealthParameterInput): number {
    const numValues = Object.keys(input.inputValues).length;
    const bytes = numValues * 8; // Float64 = 8 bytes
    const overhead = 50; // bytes
    const totalBytes = bytes + overhead;
    return parseFloat((totalBytes / (1024 * 1024)).toFixed(6));
}

export function compareTransmissionTimes(
    inputs: CheckHealthParameterInput[],
    edge: any,
    cloud: any
): any {
    let totalEdgeTime = 0;
    let totalCloudTime = 0;
    let totalOptimalTime = 0; // Added for optimal time calculation

    const results: TaskResult[] = inputs.map((input, index) => {
        const dataSizeMB = estimateDataSizeFromBinary(input);
        const edgeTime = dataSizeMB / edge.bandwidth;
        const cloudTime = (dataSizeMB / edge.bandwidth) + (dataSizeMB / cloud.bandwidth);

        totalEdgeTime += edgeTime;
        totalCloudTime += cloudTime;
        totalOptimalTime += Math.min(edgeTime, cloudTime); // Accumulate the minimum time for each task

        return {
            id: `task-${index + 1}-${input.key}`,
            dataSizeMB,
            edgeTime: parseFloat(edgeTime.toFixed(6)),
            cloudTime: parseFloat(cloudTime.toFixed(6)),
            betterServer: edgeTime < cloudTime ? "Edge" : "Cloud",
        };
    });
    const averages = calculateAverageTimes(results);
    console.log(`Edge average: ${averages.edgeAverage.toFixed(6)} seconds`);
    console.log(`Cloud average: ${averages.cloudAverage.toFixed(6)} seconds`);

    return { results, averages };
}

function calculateAverageTimes(results) {
    const edgeSum = results.reduce((sum, item) => sum + item.edgeTime, 0);
    const cloudSum = results.reduce((sum, item) => sum + item.cloudTime, 0);

    return {
        edgeAverage: edgeSum / results.length,
        cloudAverage: cloudSum / results.length
    };
}

