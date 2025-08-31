import * as Yup from 'yup';

export type JumpMode = 'swing' | 'twohands' | 'both';
export type CrossoverMode = 'true' | 'false';
export type HandsMode = 'true' | 'false';

export interface BaseStepConfiguration {
  crossover: CrossoverMode;
  hands: HandsMode;
  jumpMode: JumpMode;
  minGapForAutoSnapping: number;
  minGapForCrossovers: number;
  minGapForDoubleTap: number;
  minGapForJumps: number;
  minGapForTapJumps: number;
  minGapForJumpTap: number;
}

export const baseStepDefaultValues: BaseStepConfiguration = {
  crossover: 'false',
  hands: 'false',
  jumpMode: 'swing',
  minGapForAutoSnapping: 24,
  minGapForCrossovers: 4,
  minGapForDoubleTap: 4,
  minGapForJumps: 8,
  minGapForTapJumps: 8,
  minGapForJumpTap: 8,
};

export const baseStepValidationSchema =
  Yup.object<BaseStepConfiguration>().shape({
    crossover: Yup.string().required(),
    jumpMode: Yup.string().required(),
    hands: Yup.string().required(),
    minGapForCrossovers: Yup.number().min(4).max(32).required(),
    minGapForDoubleTap: Yup.number().min(4).max(32).required(),
    minGapForJumps: Yup.number().min(4).max(32).required(),
    minGapForTapJumps: Yup.number().min(4).max(32).required(),
    minGapForAutoSnapping: Yup.number().min(4).max(32).required(),
    minGapForJumpTap: Yup.number().min(4).max(32).required(),
  });
