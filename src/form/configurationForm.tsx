import { useForm, FormProvider } from 'react-hook-form';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

export interface ConfigurationFormState {
  infoFile: File;
  musicFile: File;
  chartFiles: File[];
  backgroundFile?: File;
}

const validationSchema = Yup.object().shape({
  infoFile: Yup.mixed<File>().required('Please add Beat Saber info file'),
  musicFile: Yup.mixed<File>().required('Please add Beat Saber music file'),
  backgroundFile: Yup.mixed<File>(),
  chartFiles: Yup.array()
    .min(1, 'At least one Beat Saber chart file is required')
    .of(Yup.mixed<File>().required())
    .required(),
});

export const useConfigurationForm = () => {
  const useFormReturn = useForm<ConfigurationFormState>({
    defaultValues: {
      chartFiles: [],
    },
    mode: 'onChange',
    resolver: yupResolver(validationSchema),
  });
  return useFormReturn;
};
