import {
  Container,
  FileInput,
  FormField,
  Header,
  SpaceBetween,
  Table,
} from '@cloudscape-design/components';
import { Controller, useFormContext } from 'react-hook-form';
import { SaberConfigurationFormState } from '../form/configurationForm';

export default function LevelMapForm() {
  const {
    control,
    formState: { errors },
  } = useFormContext<SaberConfigurationFormState>();
  return (
    <Container
      header={<Header variant="h2">Choose Beat Saber map files</Header>}
    >
      <Controller
        control={control}
        name="chartFiles"
        render={({ field }) => (
          <SpaceBetween size="s">
            <FormField
              constraintText="Choose the level .dat files such as Expert.dat, ExpertPlus.dat"
              errorText={errors.chartFiles?.message}
            >
              <FileInput
                onChange={({ detail }) => field.onChange(detail.value)}
                value={field.value || []}
                multiple
              >
                Choose files
              </FileInput>
            </FormField>
            <Table<File>
              columnDefinitions={[
                {
                  id: 'name',
                  header: 'File name',
                  cell: (file) => file.name,
                },
                {
                  id: 'size',
                  header: 'File size',
                  cell: (file) => file.size / 1000 + 'KB',
                },
              ]}
              items={field.value || []}
              empty="No map files"
              variant="embedded"
            />
          </SpaceBetween>
        )}
      />
    </Container>
  );
}
