import {
  Container,
  Header,
  KeyValuePairs,
  SpaceBetween,
} from '@cloudscape-design/components';
import type { Chart } from '../../../types/stepTypes';
import AudioController from './AudioController';
import NotesVisualizer from './NotesVisualizer';
import PlaybackControls from './PlaybackControls';
import VolumeControls from './VolumeControls';

interface ChartPreviewProps {
  chart: Chart;
}

export default function ChartPreview({ chart }: ChartPreviewProps) {
  const notes = chart.notes;

  return (
    <SpaceBetween direction="vertical" size="l">
      <AudioController />
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
      <NotesVisualizer measures={notes} />
      <Container header={<Header variant="h2">Playback</Header>}>
        <SpaceBetween size="m">
          <PlaybackControls />
          <VolumeControls />
        </SpaceBetween>
      </Container>
    </SpaceBetween>
  );
}
