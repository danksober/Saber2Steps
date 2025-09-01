import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { ITG_OFFSET } from '../wizard-flow/constants/offset';
import type { BaseStepConfiguration } from './stepConfigurationShared';
import {
  baseStepDefaultValues,
  baseStepValidationSchema,
} from './stepConfigurationShared';

export interface SaberConfigurationFormState {
  infoFile: File;
  musicFile: File;
  chartFiles: File[];
  backgroundFile?: File;
  inputType: 'link' | 'manual';
}

export interface StepConfigurationFormState extends BaseStepConfiguration {
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

const stepValidationSchema = baseStepValidationSchema.concat(
  Yup.object<Pick<StepConfigurationFormState, 'additionalOffset'>>()
    .shape({ additionalOffset: Yup.number().required() })
    .required(),
);

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
      ...baseStepDefaultValues,
      additionalOffset: ITG_OFFSET,
    },
    resolver: yupResolver(stepValidationSchema) as any,
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
