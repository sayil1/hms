import { CheckHealthParameterInput } from './create-edge-server.dto';

// export const testInputs: CheckHealthParameterInput[] = [
//   {
//     age: 25,
//     sex: 'male',
//     key: 'heart_rate',
//     inputValues: { main: 105 }, // High heart rate
//   },
//   {
//     age: 45,
//     sex: 'female',
//     key: 'blood_pressure',
//     inputValues: { systolic: 130, diastolic: 75 }, // Slightly elevated systolic
//   },
//   {
//     age: 60,
//     sex: 'male',
//     key: 'blood_sugar',
//     inputValues: { fasting: 6.2 }, // Slightly high fasting sugar
//   },
//   {
//     age: 30,
//     sex: 'female',
//     key: 'kidney_size',
//     inputValues: { length: 10.2 }, // Within normal range
//   },
//   {
//     age: 50,
//     sex: 'male',
//     key: 'liver_size',
//     inputValues: { craniocaudal: 15.8 }, // Slightly high
//   },
//   {
//     age: 40,
//     sex: 'female',
//     key: 'liver_stiffness',
//     inputValues: { main: 6.5 }, // Normal
//   },
//   {
//     age: 34,
//     sex: 'female',
//     key: 'body_temperature',
//     inputValues: { main: 38.2 }, // Fever
//   },
//   {
//     age: 20,
//     sex: 'male',
//     key: 'heart_rate',
//     inputValues: { main: 75 }, // Normal
//   },
// ];



export const testInputs: CheckHealthParameterInput[] = [
  {
    age: 25,
    sex: 'male',
    key: 'heart_rate',
    inputValues: { main: 105 }, // Very small data
  },
  {
    age: 30,
    sex: 'female',
    key: 'ecg_data',
    inputValues: Object.fromEntries(
      Array.from({ length: 50 }, (_, i) => [`point_${i}`, Math.random() * 100])
    ), // Medium-size data
  },
  {
    age: 45,
    sex: 'female',
    key: 'blood_pressure',
    inputValues: { systolic: 130, diastolic: 75 }, // Small
  },
  {
    age: 50,
    sex: 'male',
    key: 'ultrasound_frames',
    inputValues: Object.fromEntries(
      Array.from({ length: 100 }, (_, i) => [`frame_${i}`, Math.random() * 255])
    ), // Large
  },
  {
    age: 60,
    sex: 'male',
    key: 'ct_scan',
    inputValues: Object.fromEntries(
      Array.from({ length: 500 }, (_, i) => [`pixel_${i}`, Math.random() * 4096])
    ), // Very large data
  },
  {
    age: 30,
    sex: 'female',
    key: 'kidney_size',
    inputValues: { length: 10.2 }, // Small
  },
  {
    age: 34,
    sex: 'female',
    key: 'mri_sequences',
    inputValues: Object.fromEntries(
      Array.from({ length: 200 }, (_, i) => [`sequence_${i}`, Math.random()])
    ), // High but not max
  },
  {
    age: 20,
    sex: 'male',
    key: 'heart_rate',
    inputValues: { main: 75 }, // Small again
  },
];
