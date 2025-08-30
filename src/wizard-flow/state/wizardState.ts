import { atom } from 'jotai';
import type { Chart, StepChart } from '../../types/stepTypes';

// output
export const stepChartAtom = atom<StepChart | undefined>(undefined);
export const mapIdAtom = atom<string | undefined>(undefined);

export type AudioState = 'playing' | 'paused' | 'stopped';
export const audioStateAtom = atom<AudioState>('stopped');
export const currentTimeAtom = atom(0);
export const durationAtom = atom(0);
export const activeChartAtom = atom<Chart | undefined>(undefined);
export const musicVolumeAtom = atom(0.5); // Default to 50%
export const hitSoundVolumeAtom = atom(1.5); // Default to 150%
export const scrollSpeedAtom = atom(400);
