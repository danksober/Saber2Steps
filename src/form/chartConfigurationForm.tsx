import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
import type { BaseStepConfiguration } from './stepConfigurationShared';
import {
  baseStepDefaultValues,
  baseStepValidationSchema,
} from './stepConfigurationShared';

export interface ChartConfigurationFormState extends BaseStepConfiguration {
  difficulty?: number;
}

const chartConfigurationValidationSchema = baseStepValidationSchema.concat(
  Yup.object().shape({ difficulty: Yup.number().optional() }),
);

export const useChartConfigurationForm = (
  defaultValues?: Partial<ChartConfigurationFormState>,
) => {
  const useFormReturn = useForm<ChartConfigurationFormState>({
    defaultValues: {
      ...baseStepDefaultValues,
      difficulty: undefined,
      ...defaultValues,
    },
    resolver: yupResolver(chartConfigurationValidationSchema) as any,
  });
  return useFormReturn;
};
