import { CheckHealthParameterInput } from './create-edge-server.dto';

export const testInputs: CheckHealthParameterInput[] = [
  {
    age: 25,
    sex: 'male',
    key: 'heart_rate',
    cpu_cycles: 1000,
    inputValues: { main: 105 }, 
  },
  {
    age: 30,
    sex: 'female',
    key: 'ecg_data',
    inputValues: Object.fromEntries(
      Array.from({ length: 50 }, (_, i) => [`point_${i}`, Math.random() * 100])
    ),
  },
  {
    age: 45,
    sex: 'female',
    key: 'blood_pressure',
    inputValues: { systolic: 130, diastolic: 75 },
  },
  {
    age: 50,
    sex: 'male',
    key: 'ultrasound_frames',
    inputValues: Object.fromEntries(
      Array.from({ length: 100 }, (_, i) => [`frame_${i}`, Math.random() * 255])
    ), 
  },
  {
    age: 60,
    sex: 'male',
    key: 'ct_scan',
    inputValues: Object.fromEntries(
      Array.from({ length: 500 }, (_, i) => [`pixel_${i}`, Math.random() * 4096])
    ), 
  },
  {
    age: 30,
    sex: 'female',
    key: 'kidney_size',
    inputValues: { length: 10.2 },
  },
  {
    age: 34,
    sex: 'female',
    key: 'mri_sequences',
    inputValues: Object.fromEntries(
      Array.from({ length: 200 }, (_, i) => [`sequence_${i}`, Math.random()])
    ), 
  },
  {
    age: 20,
    sex: 'male',
    key: 'heart_rate',
    inputValues: { main: 75 },
  },
];
