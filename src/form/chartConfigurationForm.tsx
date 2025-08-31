import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import type { BaseStepConfiguration } from './stepConfigurationShared';
import {
  baseStepDefaultValues,
  baseStepValidationSchema,
} from './stepConfigurationShared';

export type ChartConfigurationFormState = BaseStepConfiguration;

const chartConfigurationValidationSchema = baseStepValidationSchema;

export const useChartConfigurationForm = (
  defaultValues?: Partial<ChartConfigurationFormState>,
) => {
  const useFormReturn = useForm<ChartConfigurationFormState>({
    defaultValues: {
      ...baseStepDefaultValues,
      ...defaultValues,
    },
    resolver: yupResolver(chartConfigurationValidationSchema) as any,
  });
  return useFormReturn;
};
