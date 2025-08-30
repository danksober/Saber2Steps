import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

type JumpMode = 'swing' | 'twohands' | 'both';
type CrossoverMode = 'true' | 'false';
type HandsMode = 'true' | 'false';

export interface SaberConfigurationFormState {
  infoFile: File;
  musicFile: File;
  chartFiles: File[];
  backgroundFile?: File;
  inputType: 'link' | 'manual';
}

export interface StepConfigurationFormState {
  crossover: CrossoverMode;
  hands: HandsMode;
  jumpMode: JumpMode;
  minGapForAutoSnapping: number;
  minGapForCrossovers: number;
  minGapForDoubleTap: number; // min double tap default 8th notes
  minGapForJumps: number; // min gap for jumps default 8th notes otherwise the note will be single
  minGapForTapJumps: number;
  minGapForJumpTap: number; // min gap for tap right after a jump
  additionalOffset: number;
}

const mapValidationSchema = Yup.object<SaberConfigurationFormState>().shape({
  inputType: Yup.mixed<SaberConfigurationFormState['inputType']>().required(),
  infoFile: Yup.mixed<File>().required('Please add Beat Saber info file'),
  musicFile: Yup.mixed<File>().required('Please add Beat Saber music file'),
  backgroundFile: Yup.mixed<File>().optional().nullable(),
  chartFiles: Yup.array()
    .min(1, 'At least one Beat Saber chart file is required')
    .of(Yup.mixed<File>().required())
    .required(),
});

const linkValidationSchema = Yup.object().shape({
  mapLink: Yup.string()
    .required('Please enter a valid Beat Saber map link')
    .matches(
      /^https:\/\/beatsaver\.com\/maps\/([a-zA-Z0-9-]+)$/,
      'Link does not match pattern /^https://beatsaver.com/maps/([a-zA-Z0-9-]+)$/',
    ),
});

const stepValidationSchema = Yup.object<StepConfigurationFormState>().shape({
  crossover: Yup.string<CrossoverMode>().required(),
  jumpMode: Yup.string<JumpMode>().required(),
  hands: Yup.string<HandsMode>().required(),
  minGapForCrossovers: Yup.number().min(4).max(32).required(),
  minGapForDoubleTap: Yup.number().min(4).max(32).required(),
  minGapForJumps: Yup.number().min(4).max(32).required(),
  minGapForTapJumps: Yup.number().min(4).max(32).required(),
  minGapForAutoSnapping: Yup.number().min(4).max(32).required(),
  minGapForJumpTap: Yup.number().min(4).max(32).required(),
  additionalOffset: Yup.number().required(),
});

interface LinkFormState {
  mapLink: string;
}

export const useLinkForm = () => {
  const useFormReturn = useForm<LinkFormState>({
    mode: 'onBlur',
    resolver: yupResolver(linkValidationSchema),
  });
  return useFormReturn;
};

export const useStepConfigForm = () => {
  const useFormReturn = useForm<StepConfigurationFormState>({
    defaultValues: {
      jumpMode: 'swing',
      minGapForDoubleTap: 8,
      minGapForTapJumps: 8,
      minGapForJumpTap: 8,
      minGapForJumps: 8,
      minGapForCrossovers: 4,
      minGapForAutoSnapping: 32,
      crossover: 'true',
      hands: 'false',
      additionalOffset: 0.009,
    },
    resolver: yupResolver(stepValidationSchema),
  });
  return useFormReturn;
};

export const useMapConfigurationForm = () => {
  const useFormReturn = useForm<SaberConfigurationFormState>({
    defaultValues: {
      chartFiles: [],
      inputType: 'link',
    },
    mode: 'onChange',
    // @ts-expect-error because the resolver is not typed correctly
    resolver: yupResolver(mapValidationSchema),
  });
  return useFormReturn;
};
