export class CreateEdgeServerDto {}

// src/servers/server.model.ts
export interface EdgeServer {
  id: string;
  cpuSpeedGHz: number;
  availableMemoryMB: number;
  bandwidthMbps: number;
  costPerSec: number;
  latencyMs: number;
  status: 'online' | 'offline';
}

export interface ReferenceValue {
  lower_bound: number;
  upper_bound: number;
  label: string;
}

export interface SexGroup {
  value: ReferenceValue[];
}

export interface AgeGroup {
  min_age: number;
  max_age: number;
  male: SexGroup;
  female: SexGroup;
}

export interface HealthParameter {
  key: string;
  measured_parameter: string;
  unit: string;
  age_groups: AgeGroup[];
}

export type HealthInputValues = Record<string, number>;

export interface CheckHealthParameterInput {
  age: number;
  sex: 'male' | 'female';
  key: string;
  inputValues: HealthInputValues;
}

export interface CheckResult {
  label: string;
  value?: number;
  status: 'within range' | 'out of range' | 'missing';
  difference?: number;
  unit: string;
  expected_range: {
    lower_bound: number;
    upper_bound: number;
  };
  message?: string;
}

export interface CheckHealthParameterResponse {
  measured_parameter?: string;
  key?: string;
  age?: number;
  sex?: string;
  unit?: string;
  results?: CheckResult[];
  error?: string;
}
