export function transformData(data) {
    const headers = data[0];
    const entries = data.slice(1);

    return entries.map((row) => {
        const [age, sex, key, ...inputValuesArray] = row;
        const inputValues = {};

        headers.slice(3).forEach((header, i) => {
            const val = inputValuesArray[i];
            if (val !== undefined && val !== '' && header.includes('inputValues.')) {
                const prop = header.split('.')[1];
                inputValues[prop] = val;
            }
        });

        return {
            age,
            sex,
            key,
            inputValues,
        };
    });
}
