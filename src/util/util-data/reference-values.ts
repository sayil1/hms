export const ref_values = [
  {
    key: 'heart_rate',
    measured_parameter: 'Heart Rate',
    unit: 'bpm',
    age_groups: [
      {
        min_age: 10,
        max_age: 120,
        male: {
          value: [{ lower_bound: 600, upper_bound: 1000, label: 'main' }],
        },
        female: {
          value: [{ lower_bound: 600, upper_bound: 1000, label: 'main' }],
        },
      },
    ],
  },
  {
    key: 'blood_pressure',
    measured_parameter: 'Blood Pressure',
    unit: 'mmHg',
    age_groups: [
      {
        min_age: 40,
        max_age: 59,
        male: {
          value: [
            { lower_bound: 100, upper_bound: 124, label: 'systolic' },
            { lower_bound: 70, upper_bound: 77, label: 'diastolic' },
          ],
        },
        female: {
          value: [
            { lower_bound: 100, upper_bound: 122, label: 'systolic' },
            { lower_bound: 70, upper_bound: 74, label: 'diastolic' },
          ],
        },
      },
    ],
  },
  {
    key: 'blood_sugar',
    measured_parameter: 'Blood Sugar (Fasting)',
    unit: 'mmol/L',
    age_groups: [
      {
        min_age: 18,
        max_age: 120,
        male: {
          value: [{ lower_bound: 3.9, upper_bound: 5.5, label: 'fasting' }],
        },
        female: {
          value: [{ lower_bound: 3.9, upper_bound: 5.5, label: 'fasting' }],
        },
      },
    ],
  },
  {
    key: 'kidney_size',
    measured_parameter: 'Kidney Size',
    unit: 'cm',
    age_groups: [
      {
        min_age: 18,
        max_age: 120,
        male: {
          value: [{ lower_bound: 10, upper_bound: 12.5, label: 'length' }],
        },
        female: {
          value: [{ lower_bound: 9.5, upper_bound: 11.5, label: 'length' }],
        },
      },
    ],
  },
  {
    key: 'liver_size',
    measured_parameter: 'Liver Size',
    unit: 'cm',
    age_groups: [
      {
        min_age: 18,
        max_age: 120,
        male: {
          value: [
            { lower_bound: 13, upper_bound: 15.5, label: 'craniocaudal' },
          ],
        },
        female: {
          value: [
            { lower_bound: 12, upper_bound: 14.5, label: 'craniocaudal' },
          ],
        },
      },
    ],
  },
  {
    key: 'liver_stiffness',
    measured_parameter: 'Liver Stiffness',
    unit: 'kPa',
    age_groups: [
      {
        min_age: 18,
        max_age: 120,
        male: {
          value: [{ lower_bound: 2.5, upper_bound: 7.0, label: 'main' }],
        },
        female: {
          value: [{ lower_bound: 2.5, upper_bound: 7.0, label: 'main' }],
        },
      },
    ],
  },
  {
    key: 'body_temperature',
    measured_parameter: 'Body Temperature',
    unit: '°C',
    age_groups: [
      {
        min_age: 0,
        max_age: 120,
        male: {
          value: [{ lower_bound: 35.5, upper_bound: 37.5, label: 'main' }],
        },
        female: {
          value: [{ lower_bound: 35.5, upper_bound: 37.5, label: 'main' }],
        },
      },
    ],
  },
];
