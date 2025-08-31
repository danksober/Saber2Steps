import {
  Container,
  ExpandableSection,
  Header,
  KeyValuePairs,
  SpaceBetween,
} from '@cloudscape-design/components';
import { useAtom } from 'jotai';
import { useState } from 'react';
import type { ChartConfigurationFormState } from '../../../form/chartConfigurationForm';
import { StepBuilder } from '../../../parser/StepBuilder';
import type { Chart } from '../../../types/stepTypes';
import { stepChartAtom } from '../../state/wizardState';
import AudioController from './AudioController';
import ChartConfigurationComponent from './ChartConfigurationComponent';
import NotesVisualizer from './NotesVisualizer';
import PlaybackControls from './PlaybackControls';
import VolumeControls from './VolumeControls';

interface ChartPreviewProps {
  chart: Chart;
}

export default function ChartPreview({ chart }: ChartPreviewProps) {
  const [isConfigExpanded, setIsConfigExpanded] = useState(false);
  const [, setStepChart] = useAtom(stepChartAtom);

  const notes = chart.notes;

  const handleConfigSave = (config: ChartConfigurationFormState) => {
    setStepChart((prev) => {
      if (!prev) return prev;
      const editingChartIndex = prev.charts.findIndex(
        (c) => c.name === chart.name,
      );
      const editingChart = prev.charts[editingChartIndex];
      if (!editingChart) return prev;
      const { charts: prevCharts, ...prevConfig } = prev;
      const stepConfig = {
        ...config,
        additionalOffset: editingChart.stepConfig?.additionalOffset ?? 0.009,
      };
      const stepBuilder = new StepBuilder({
        ...prevConfig,
        ...stepConfig,
        additionalOffset: editingChart.stepConfig?.additionalOffset ?? 0.009,
        mapNotes: editingChart.mapData?._notes || [],
        difficultyName: editingChart.name,
        meter:
          config.difficulty !== undefined
            ? String(config.difficulty)
            : editingChart.meter,
      });
      const newChart = {
        ...stepBuilder.build(),
        mapData: editingChart.mapData,
        stepConfig,
      };
      const newCharts = [
        ...prevCharts.slice(0, editingChartIndex),
        newChart,
        ...prevCharts.slice(editingChartIndex + 1),
      ];
      return {
        ...prev,
        charts: newCharts,
      };
    });
    setIsConfigExpanded(false);
  };

  const handleConfigCancel = () => {
    setIsConfigExpanded(false);
  };

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
            { label: 'Difficulty', value: chart.meter || '-' },
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

      <ExpandableSection
        variant="container"
        headerText="Individual Chart Configuration"
        expanded={isConfigExpanded}
        onChange={({ detail }) => setIsConfigExpanded(detail.expanded)}
      >
        <ChartConfigurationComponent
          chart={chart}
          onSave={handleConfigSave}
          onCancel={handleConfigCancel}
          isExpanded={isConfigExpanded}
        />
      </ExpandableSection>

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
