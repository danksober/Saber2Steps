import type { RandomnessScore } from '../form/stepConfigurationShared';

// Minimal config shape required by stepLocationBuilder to avoid circular imports.
export type StepBuilderConfig = {
  crossover?: string | 'false';
  hands?: string | 'false';
  minGapForCrossovers?: number;
  minGapForDoubleTap?: number;
  minGapForTapJumps?: number;
  minGapForJumpTap?: number;
  minGapForJumps?: number;
  jumpMode?: string;
  randomnessScore?: RandomnessScore;
};
