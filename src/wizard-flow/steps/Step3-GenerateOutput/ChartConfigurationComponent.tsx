import {
  Button,
  Container,
  Form,
  FormField,
  Header,
  Input,
  SpaceBetween,
} from '@cloudscape-design/components';
import { useState } from 'react';
import { Controller } from 'react-hook-form';
import {
  type ChartConfigurationFormState,
  useChartConfigurationForm,
} from '../../../form/chartConfigurationForm';
import type { Chart } from '../../../types/stepTypes';
import SharedStepFields from '../Shared/SharedStepFields';
import ShiftingSelector from './ShiftingSelector';

interface ChartConfigurationComponentProps {
  chart: Chart;
  onSave: (
    data: ChartConfigurationFormState & {
      shifting?: number | null;
      shiftingDirection?: 'forward' | 'backward' | undefined;
    },
  ) => void;
  onCancel: () => void;
  isExpanded: boolean;
}

// shifting options removed; selector is implemented via ShiftingSelector component

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
  } as Partial<ChartConfigurationFormState & { shifting?: number | null }>;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useChartConfigurationForm(defaultValues);

  const [localShifting, setLocalShifting] = useState<number | null>(null);
  const [localShiftingDirection, setLocalShiftingDirection] = useState<
    'forward' | 'backward'
  >('forward');

  const onSubmit = (data: ChartConfigurationFormState) => {
    // Merge transient shifting values into the submitted payload but do not
    // persist them into the form's default values. Parent handles one-time
    // application when it receives these fields.
    onSave({
      ...data,
      shifting: localShifting ?? undefined,
      shiftingDirection: localShifting ? localShiftingDirection : undefined,
    });
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
            <FormField
              label="Shifting"
              description="One-time shift: affects the generated preview only and is not saved to the chart"
            >
              {/* local state so changes are one-time and not persisted to form */}
              <ShiftingSelector
                onChange={(val, dir) => {
                  setLocalShifting(val);
                  setLocalShiftingDirection(dir);
                }}
              />
            </FormField>
          </SpaceBetween>
        </Container>
      </SpaceBetween>
    </Form>
  );
}
