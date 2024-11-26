import { Chart } from '../types/stepTypes';
import {
  Container,
  Header,
  KeyValuePairs,
  SpaceBetween,
} from '@cloudscape-design/components';
import StepNotesVisual from './StepNotesVisual';

interface StepChartDetailsProps {
  chart: Chart;
}

export default function StepChartDetails({ chart }: StepChartDetailsProps) {
  const notes = chart.notes;

  return (
    <SpaceBetween direction="vertical" size="l">
      <Container header={<Header variant="h2">Chart info</Header>}>
        <KeyValuePairs
          columns={3}
          items={[
            {
              label: 'Name',
              value: chart.name || '-',
            },
            {
              label: 'Type',
              value: chart.type || '-',
            },
            {
              label: 'Difficulty',
              value: chart.meter || '-',
            },
            {
              label: 'Tap',
              value: chart.tap || 0,
            },
            {
              label: 'Jump',
              value: chart.jump || 0,
            },
            {
              label: 'Hold',
              value: chart.hold || 0,
            },
            {
              label: 'Mines',
              value: chart.bomb || 0,
            },
          ]}
        />
      </Container>
      <StepNotesVisual measures={notes} />
    </SpaceBetween>
  );
}
