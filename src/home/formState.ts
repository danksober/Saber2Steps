import { atom } from 'jotai';
import { StepChart } from '../types/stepTypes';

// output
export const stepChartAtom = atom<StepChart>();
export const mapIdAtom = atom<string>();
