import {
  Button,
  Container,
  Form,
  FormField,
  Header,
  Input,
  SpaceBetween,
} from '@cloudscape-design/components';
import { Controller } from 'react-hook-form';
import {
  type ChartConfigurationFormState,
  useChartConfigurationForm,
} from '../../../form/chartConfigurationForm';
import type { Chart } from '../../../types/stepTypes';
import SharedStepFields from '../Shared/SharedStepFields';

interface ChartConfigurationComponentProps {
  chart: Chart;
  onSave: (data: ChartConfigurationFormState) => void;
  onCancel: () => void;
  isExpanded: boolean;
}

export default function ChartConfigurationComponent({
  chart,
  onSave,
  onCancel,
  isExpanded,
}: ChartConfigurationComponentProps) {
  const defaultValues = {
    ...(chart.stepConfig ?? {}),
    difficulty: Number.isNaN(Number(chart.meter))
      ? undefined
      : Number(chart.meter),
  } as Partial<ChartConfigurationFormState>;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useChartConfigurationForm(defaultValues);

  const onSubmit = (data: ChartConfigurationFormState) => {
    onSave(data);
  };

  if (!isExpanded) {
    return null;
  }

  return (
    <Form
      actions={
        <SpaceBetween direction="horizontal" size="xs">
          <Button onClick={onCancel}>Cancel</Button>
          <Button variant="primary" onClick={() => handleSubmit(onSubmit)()}>
            Apply Configuration
          </Button>
        </SpaceBetween>
      }
    >
      <SpaceBetween direction="vertical" size="l">
        <SharedStepFields control={control} errors={errors} />
        <Container header={<Header variant="h3">Other configurations</Header>}>
          <SpaceBetween size="l">
            <FormField
              label="Difficulty"
              errorText={errors.difficulty?.message}
            >
              <Controller
                name="difficulty"
                control={control}
                render={({ field }) => (
                  <Input
                    type="number"
                    value={(field.value ?? '') as unknown as string}
                    onChange={({ detail }) =>
                      field.onChange(
                        detail.value === '' ? undefined : Number(detail.value),
                      )
                    }
                  />
                )}
              />
            </FormField>
          </SpaceBetween>
        </Container>
      </SpaceBetween>
    </Form>
  );
}
