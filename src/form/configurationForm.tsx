import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

export interface ConfigurationFormState {
  infoFile: File;
  musicFile: File;
  chartFiles: File[];
  backgroundFile?: File;
  inputType?: 'link' | 'manual';
}

const mapValidationSchema = Yup.object().shape({
  inputType: Yup.mixed(),
  mapLink: Yup.string(),
  infoFile: Yup.mixed<File>().required('Please add Beat Saber info file'),
  musicFile: Yup.mixed<File>().required('Please add Beat Saber music file'),
  backgroundFile: Yup.mixed<File>(),
  chartFiles: Yup.array()
    .min(1, 'At least one Beat Saber chart file is required')
    .of(Yup.mixed<File>().required())
    .required(),
});

const linkValidationSchema = Yup.object().shape({
  mapLink: Yup.string()
    .required('Please enter a valid Beat Saber map link')
    .matches(
      /^https:\/\/beatsaver\.com\/maps\/([a-zA-Z0-9\-]+)$/,
      'Link does not match pattern /^https://beatsaver.com/maps/([a-zA-Z0-9-]+)$/',
    ),
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

export const useMapConfigurationForm = () => {
  const useFormReturn = useForm<ConfigurationFormState>({
    defaultValues: {
      chartFiles: [],
      inputType: 'link',
    },
    mode: 'onChange',
    resolver: yupResolver(mapValidationSchema),
  });
  return useFormReturn;
};
