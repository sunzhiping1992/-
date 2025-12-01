
export enum CircuitType {
  VOLTAGE_DIVIDER = '电压分压电路',
  INVERTING_OPAMP = '反向放大器',
  NON_INVERTING_OPAMP = '同向放大器',
  LOW_PASS_FILTER = 'RC 低通滤波器',
  SUMMING_AMPLIFIER = '加法运算放大器',
  DIFFERENCE_AMPLIFIER = '减法运算放大器',
  PHOTODIODE_SENSOR = '光电池采样电路',
  TRANS_IMPEDANCE_AMPLIFIER = '跨阻放大器 (TIA)',
  BAND_PASS_FILTER = '有源带通滤波器',
  SIGNAL_GENERATOR = '信号发生电路 (文氏电桥)',
}

export interface CircuitParam {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
}

export interface SimulationDataPoint {
  time: number;
  input: number;
  output: number;
  input2?: number; // For summing/diff amp
}

export interface CircuitDefinition {
  type: CircuitType;
  description: string;
  defaultParams: Record<string, number>;
}
