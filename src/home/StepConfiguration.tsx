import {
  Container,
  FormField,
  Header,
  RadioGroup,
  Select,
  SpaceBetween,
} from '@cloudscape-design/components';
import { Controller, useFormContext } from 'react-hook-form';
import type { StepConfigurationFormState } from '../form/configurationForm';

const noteGapOptions = [
  {
    value: '4',
    label: '4th notes',
  },
  {
    value: '8',
    label: '8th notes',
  },
  {
    value: '12',
    label: '12th notes',
  },
  {
    value: '16',
    label: '16th notes',
  },
  {
    value: '24',
    label: '24th notes',
  },
  {
    value: '32',
    label: '32nd notes',
  },
];

const getNoteSelectionLabel = (value: number) =>
  `${value}${value !== 32 ? 'th' : 'nd'} notes`;

export default function StepConfiguration() {
  const { control } = useFormContext<StepConfigurationFormState>();
  return (
    <SpaceBetween size="l" direction="vertical">
      <Container header={<Header variant="h2">Parser options</Header>}>
        <Controller
          control={control}
          name="minGapForAutoSnapping"
          render={({ field }) => (
            <FormField
              label="Mininum notes to auto snap"
              description="Some Beat Saber maps are not perfectly formatted in time, an auto snapping algorithm is applied to snap Beat Saber notes to approximate times. This option configures the minimum notes to snap the map notes to."
            >
              <Select
                selectedOption={{
                  value: field.value?.toString(),
                  label: getNoteSelectionLabel(field.value!),
                }}
                options={noteGapOptions}
                onChange={({ detail }) =>
                  field.onChange(+detail.selectedOption.value!)
                }
              />
            </FormField>
          )}
        ></Controller>
      </Container>
      <Container
        header={
          <Header
            variant="h2"
            description="Configure step output crossover options"
          >
            Crossover options
          </Header>
        }
      >
        <SpaceBetween size="l">
          <Controller
            control={control}
            name="crossover"
            render={({ field }) => (
              <FormField label="Include crossovers">
                <RadioGroup
                  value={field.value as any}
                  onChange={(e) => field.onChange(e.detail.value)}
                  items={[
                    {
                      value: 'true',
                      label: 'Yes',
                      description: 'Generate crossovers',
                    },
                    {
                      value: 'false',
                      label: 'No',
                      description: (
                        <span>
                          Do <b>NOT</b> generate crossovers
                        </span>
                      ),
                    },
                  ]}
                />
              </FormField>
            )}
          ></Controller>
          <Controller
            control={control}
            name="minGapForCrossovers"
            render={({ field }) => (
              <FormField
                label="Mininum gaps between crossovers"
                description="The minimum gaps in notes between crossovers, this will prevent consecutive crossovers in short amount of time"
              >
                <Select
                  selectedOption={{
                    value: field.value?.toString(),
                    label: getNoteSelectionLabel(field.value!),
                  }}
                  options={[
                    {
                      value: '4',
                      label: '4th notes',
                    },
                    ...noteGapOptions,
                  ]}
                  onChange={({ detail }) =>
                    field.onChange(+detail.selectedOption.value!)
                  }
                />
              </FormField>
            )}
          ></Controller>
        </SpaceBetween>
      </Container>
      <Container
        header={
          <Header variant="h2" description="Configure step output jump options">
            Jump options
          </Header>
        }
      >
        <SpaceBetween direction="vertical" size="l">
          <Controller
            control={control}
            name="jumpMode"
            render={({ field }) => (
              <FormField label="Jump treatment">
                <RadioGroup
                  value={field.value as any}
                  onChange={(e) => field.onChange(e.detail.value)}
                  items={[
                    {
                      value: 'swing',
                      label: 'Swing',
                      description: 'Treat >2 note big swings as jumps',
                    },
                    {
                      value: 'twohands',
                      label: 'Two hands',
                      description: 'Treat two hand note hits as jumps',
                    },
                    {
                      value: 'both',
                      label: 'Both',
                      description: 'Treat both swings and two hands as jumps',
                    },
                  ]}
                />
              </FormField>
            )}
          ></Controller>
          <Controller
            control={control}
            name="minGapForJumps"
            render={({ field }) => (
              <FormField
                label="Mininum gaps between jumps"
                description="The minimum gaps in notes between two jumps, this will prevent consecutive jumps in short amount of time"
              >
                <Select
                  selectedOption={{
                    value: field.value?.toString(),
                    label: getNoteSelectionLabel(field.value!),
                  }}
                  options={noteGapOptions}
                  onChange={({ detail }) =>
                    field.onChange(+detail.selectedOption.value!)
                  }
                />
              </FormField>
            )}
          ></Controller>
          <Controller
            control={control}
            name="minGapForTapJumps"
            render={({ field }) => (
              <FormField
                label="Mininum gaps between a tap and a jump"
                description="The minimum gaps in notes between a tap and a jump, this will prevent consecutive tap jumps in short amount of time"
              >
                <Select
                  selectedOption={{
                    value: field.value?.toString(),
                    label: getNoteSelectionLabel(field.value!),
                  }}
                  options={noteGapOptions}
                  onChange={({ detail }) =>
                    field.onChange(+detail.selectedOption.value!)
                  }
                />
              </FormField>
            )}
          ></Controller>
          <Controller
            control={control}
            name="minGapForDoubleTap"
            render={({ field }) => (
              <FormField
                label="Mininum gaps between double taps"
                description="The minimum gaps in notes between two consecutive same note taps, this will prevent double taps in short amount of time"
              >
                <Select
                  selectedOption={{
                    value: field.value?.toString(),
                    label: getNoteSelectionLabel(field.value!),
                  }}
                  options={noteGapOptions}
                  onChange={({ detail }) =>
                    field.onChange(+detail.selectedOption.value!)
                  }
                />
              </FormField>
            )}
          ></Controller>
          <Controller
            control={control}
            name="minGapForJumpTap"
            render={({ field }) => (
              <FormField
                label="Mininum gaps for a tap right after a jump"
                description="The minimum gaps in for a tap right after a jump, this will prevent quick taps after jumps in short amount of time"
              >
                <Select
                  selectedOption={{
                    value: field.value?.toString(),
                    label: getNoteSelectionLabel(field.value!),
                  }}
                  options={noteGapOptions}
                  onChange={({ detail }) =>
                    field.onChange(+detail.selectedOption.value!)
                  }
                />
              </FormField>
            )}
          ></Controller>
          <Controller
            control={control}
            name="hands"
            render={({ field }) => (
              <FormField label="Include hands">
                <RadioGroup
                  value={field.value as any}
                  onChange={(e) => field.onChange(e.detail.value)}
                  items={[
                    {
                      value: 'true',
                      label: 'Yes',
                    },
                    {
                      value: 'false',
                      label: 'No',
                    },
                  ]}
                />
              </FormField>
            )}
          ></Controller>
        </SpaceBetween>
      </Container>
    </SpaceBetween>
  );
}
