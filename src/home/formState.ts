import { atom } from 'jotai';
import { StepChart } from '../types/stepTypes';

// input
export const infoFileAtom = atom<File[]>([]);
export const musicFileAtom = atom<File[]>([]);
export const backgroundFileAtom = atom<File[]>([]);
export const chartFilesAtom = atom<File[]>([]);

// output
export const stepChartAtom = atom<StepChart>();
