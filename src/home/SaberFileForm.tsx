import {
  Box,
  Container,
  FileUpload,
  FormField,
  Header,
  Link,
  SpaceBetween,
} from '@cloudscape-design/components';
import { Controller, useFormContext } from 'react-hook-form';
import { commonFileUploadProps } from '../constants/fileUpload';
import type { SaberConfigurationFormState } from '../form/configurationForm';

export default function SaberFileForm() {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext<SaberConfigurationFormState>();

  const watchInfo = watch('infoFile');
  const watchMusic = watch('musicFile');
  const watchBackground = watch('backgroundFile');
  return (
    <Container
      header={
        <Header
          variant="h2"
          description={
            <Box>
              This can be downloaded from Beat Saber map websites such as
              <Link
                variant="primary"
                external
                href="https://bsaber.com/getting-started/custom-songs"
              >
                {' '}
                bsaber
              </Link>
            </Box>
          }
        >
          Choose Beat Saber files
        </Header>
      }
    >
      <SpaceBetween direction="vertical" size="m">
        <Controller
          control={control}
          name="infoFile"
          render={({ field }) => (
            <FormField
              label=" Choose info file"
              description="Choose info file for the song, the file should be in the zip you downloaded named info.dat"
              errorText={errors.infoFile?.message}
              constraintText="File name should be like info.dat"
            >
              <FileUpload
                value={watchInfo ? [watchInfo] : []}
                onChange={({ detail }) => field.onChange(detail.value[0])}
                {...commonFileUploadProps}
                accept=".dat"
              />
            </FormField>
          )}
        ></Controller>

        <Controller
          control={control}
          name="musicFile"
          render={({ field }) => (
            <FormField
              label=" Choose music file"
              description="Choose music file for the song, the music file should be in the zip you downloaded, might need conversion to ogg or mp3 format"
              errorText={errors.musicFile?.message}
              constraintText=".mp3,.egg or .ogg format"
            >
              <FileUpload
                value={watchMusic ? [watchMusic] : []}
                onChange={({ detail }) => field.onChange(detail.value[0])}
                {...commonFileUploadProps}
                accept=".mp3,.ogg,.egg"
              />
            </FormField>
          )}
        ></Controller>

        <Controller
          control={control}
          name="backgroundFile"
          render={({ field }) => (
            <FormField
              label=" Choose background file (Optional)"
              description="Choose background file for the song, the file should be in the zip you downloaded"
              errorText={errors.backgroundFile?.message}
              constraintText=".jpg, .jpeg, .png etc."
            >
              <FileUpload
                value={watchBackground ? [watchBackground] : []}
                onChange={({ detail }) => field.onChange(detail.value[0])}
                {...commonFileUploadProps}
                accept=".jpg,.jpeg,.png,.tif,.bmp"
              />
            </FormField>
          )}
        ></Controller>
      </SpaceBetween>
    </Container>
  );
}
