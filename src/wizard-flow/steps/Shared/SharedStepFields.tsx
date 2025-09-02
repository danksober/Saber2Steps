import {
  Container,
  FormField,
  Header,
  RadioGroup,
  Select,
  SpaceBetween,
} from '@cloudscape-design/components';
import type { Control } from 'react-hook-form';
import { Controller } from 'react-hook-form';

const noteGapOptions = [
  { value: '4', label: '4th notes' },
  { value: '8', label: '8th notes' },
  { value: '12', label: '12th notes' },
  { value: '16', label: '16th notes' },
  { value: '24', label: '24th notes' },
  { value: '32', label: '32nd notes' },
];

const lookbackSizeOptions = [
  { value: '5', label: '5 notes' },
  { value: '10', label: '10 notes' },
  { value: '20', label: '20 notes' },
  { value: '30', label: '30 notes' },
  { value: '40', label: '40 notes' },
  { value: '50', label: '50 notes' },
];

const randomnessScoreItems = [
  {
    value: 'none',
    label: 'None',
    description:
      'No randomness applied. Steps will be placed based on rules only.',
  },
  {
    value: 'low',
    label: 'Low',
    description:
      'Slightly randomize step placement to avoid repetitive patterns.',
  },
  {
    value: 'medium',
    label: 'Medium',
    description:
      'Balanced randomization to create more varied and interesting patterns.',
  },
  {
    value: 'high',
    label: 'High',
    description:
      'Aggressively randomize step placement for maximum pattern variety.',
  },
];

const getNoteSelectionLabel = (value: number) =>
  `${value}${value !== 32 ? 'th' : 'nd'} notes`;

interface SharedStepFieldsProps {
  control: Control<any>;
  errors?: any;
  renderParserExtras?: React.ReactNode;
}

export default function SharedStepFields({
  control,
  renderParserExtras,
}: SharedStepFieldsProps) {
  return (
    <>
      <Container header={<Header variant="h2">Parser options</Header>}>
        <SpaceBetween size="l">
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
          />
          {renderParserExtras}
        </SpaceBetween>
      </Container>

      <Container
        header={
          <Header
            variant="h2"
            description="Configure randomness options for step generation"
          >
            Randomness options
          </Header>
        }
      >
        <SpaceBetween size="l">
          <Controller
            control={control}
            name="lookbackSize"
            render={({ field }) => (
              <FormField
                label="Lookback size"
                description="The number of previous notes to consider when checking for randomness. Larger sizes prevent long-term patterns."
              >
                <Select
                  selectedOption={{
                    value: field.value?.toString(),
                    label: `${field.value} notes`,
                  }}
                  options={lookbackSizeOptions}
                  onChange={({ detail }) =>
                    field.onChange(+detail.selectedOption.value!)
                  }
                />
              </FormField>
            )}
          />

          <Controller
            control={control}
            name="randomnessScore"
            render={({ field }) => (
              <FormField label="Randomness intensity">
                <RadioGroup
                  value={field.value as any}
                  onChange={(e) => field.onChange(e.detail.value)}
                  items={randomnessScoreItems}
                />
              </FormField>
            )}
          />
        </SpaceBetween>
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
          />

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
                    { value: '4', label: '4th notes' },
                    ...noteGapOptions,
                  ]}
                  onChange={({ detail }) =>
                    field.onChange(+detail.selectedOption.value!)
                  }
                />
              </FormField>
            )}
          />
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
          />

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
          />

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
          />

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
          />

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
          />

          <Controller
            control={control}
            name="hands"
            render={({ field }) => (
              <FormField label="Include hands">
                <RadioGroup
                  value={field.value as any}
                  onChange={(e) => field.onChange(e.detail.value)}
                  items={[
                    { value: 'true', label: 'Yes' },
                    { value: 'false', label: 'No' },
                  ]}
                />
              </FormField>
            )}
          />
        </SpaceBetween>
      </Container>
    </>
  );
}
