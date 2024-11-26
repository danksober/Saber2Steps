export type Measure = string[][];

export interface StepChart {
  title: string;
  subtitle?: string;
  artist?: string;
  genre?: string;
  credit?: string;
  banner?: string;
  background?: string;
  music?: string;
  offset?: string;
  bpms: string;
  sampleStart?: string;
  sampleLength?: string;
  charts: Chart[];
}

export interface Chart {
  type: 'dance-single' | 'dance-double';
  name: string;
  meter: string;
  radarValues?: string[];
  notes: Measure[];
  tap?: number;
  jump?: number;
  bomb?: number;
  hold?: number;
  hands?: number;
}
