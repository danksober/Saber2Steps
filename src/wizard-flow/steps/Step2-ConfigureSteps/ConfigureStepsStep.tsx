import { FormField, Input, SpaceBetween } from '@cloudscape-design/components';
import { Controller, useFormContext } from 'react-hook-form';
import type { StepConfigurationFormState } from '../../../form/configurationForm';
import SharedStepFields from '../Shared/SharedStepFields';

export default function StepConfiguration() {
  const { control } = useFormContext<StepConfigurationFormState>();
  return (
    <SpaceBetween size="l" direction="vertical">
      <SharedStepFields
        control={control}
        renderParserExtras={
          <Controller
            control={control}
            name="additionalOffset"
            render={({ field }) => (
              <FormField
                label="Additional offset"
                description="An additional offset to apply to the generated step chart. This is useful for compensating for timing differences between Beat Saber and StepMania."
              >
                <Input
                  {...field}
                  type="number"
                  step={0.001}
                  value={(field.value ?? '').toString()}
                  onChange={(e) => field.onChange(e.detail.value)}
                />
              </FormField>
            )}
          />
        }
      />
    </SpaceBetween>
  );
}
