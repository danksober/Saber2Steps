import React from 'react';
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
              label: 'Description',
              value: chart.description || '-',
            },
            {
              label: 'Credit',
              value: chart.credit || '-',
            },
          ]}
        />
      </Container>
      <StepNotesVisual measures={notes} />
    </SpaceBetween>
  );
}
