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

type TransientChartConfiguration = ChartConfigurationFormState & {
  shifting?: number | null;
  shiftingDirection?: 'forward' | 'backward' | undefined;
};

import { StepBuilder } from '../../../parser/StepBuilder';
import type { Chart } from '../../../types/stepTypes';
import { getShiftTimingDifference } from '../../constants/noteShifting';
import { ITG_OFFSET } from '../../constants/offset';
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

  const handleConfigSave = (config: TransientChartConfiguration) => {
    setStepChart((prev) => {
      if (!prev) return prev;
      const editingChartIndex = prev.charts.findIndex(
        (c) => c.name === chart.name,
      );
      const editingChart = prev.charts[editingChartIndex];
      if (!editingChart) return prev;
      const { charts: prevCharts, ...prevConfig } = prev;
      // compute baseline additional offset from existing chart or default
      const baseAdditionalOffset =
        editingChart.stepConfig?.additionalOffset ?? 0;

      // compute timing difference introduced by shifting (in seconds)
      // prefer the global bpms, fall back to map info bpm when available
      const bpm = Number(prevConfig.bpms) || 120;
      const shiftTiming = getShiftTimingDifference(
        config.shifting,
        config.shiftingDirection,
        bpm,
      );

      const stepConfig = {
        ...config,
        additionalOffset: baseAdditionalOffset + shiftTiming,
      };
      const stepBuilder = new StepBuilder({
        ...prevConfig,
        ...stepConfig,
        mapNotes: editingChart.mapData?._notes || [],
        difficultyName: editingChart.name,
      });
      const newChart = {
        ...stepBuilder.build(),
        mapData: editingChart.mapData,
        stepConfig,
      };
      let finalCharts: Chart[] = [];
      if (config.shifting) {
        prevCharts.forEach((chart) => {
          const globalStepConfig = {
            ...chart.stepConfig!,
            shifting: config.shifting,
            shiftingDirection: config.shiftingDirection,
          };
          const globalStepBuilder = new StepBuilder({
            ...prevConfig,
            ...globalStepConfig,
            additionalOffset: baseAdditionalOffset + shiftTiming,
            mapNotes: chart.mapData?._notes || [],
            difficultyName: chart.name,
          });
          const newGlobalChart = {
            ...globalStepBuilder.build(),
            mapData: chart.mapData,
            stepConfig: globalStepConfig,
          };
          finalCharts.push(newGlobalChart);
        });
      } else {
        finalCharts = prevCharts;
      }
      const newCharts = [
        ...finalCharts.slice(0, editingChartIndex),
        newChart,
        ...finalCharts.slice(editingChartIndex + 1),
      ];
      return {
        ...prev,
        charts: newCharts,
        outputOffset: (
          Number(prev.outputOffset || '0') +
          shiftTiming +
          ITG_OFFSET
        ).toString(),
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
