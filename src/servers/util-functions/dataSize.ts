
type CheckHealthParameterInput = {
    age: number;
    sex: 'male' | 'female';
    key: string;
    inputValues: Record<string, number>;
};


export function estimateDataSizeFromBinary(input: CheckHealthParameterInput): number {
    const numValues = Object.keys(input.inputValues).length;
    const bytes = numValues * 8;
    const overhead = 50;
    const totalBytes = bytes + overhead;
    return parseFloat((totalBytes / (1024 * 1024)).toFixed(6)) * 100000;
}