import {
  Button,
  Container,
  ExpandableSection,
  Header,
  Input,
  KeyValuePairs,
  SpaceBetween,
} from '@cloudscape-design/components';
import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import type { ChartConfigurationFormState } from '../../../form/chartConfigurationForm';
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
  const [isEditing, setIsEditing] = useState(false);
  const [difficulty, setDifficulty] = useState(chart.meter);
  const [isConfigExpanded, setIsConfigExpanded] = useState(false);
  const [individualConfig, setIndividualConfig] = useState<
    ChartConfigurationFormState | undefined
  >(undefined);
  const [stepChart, setStepChart] = useAtom(stepChartAtom);

  useEffect(() => {
    setDifficulty(chart.meter);
  }, [chart.meter]);

  const notes = chart.notes;

  const handleConfigSave = (config: ChartConfigurationFormState) => {
    setIndividualConfig(config);
    setIsConfigExpanded(false);
  };

  const handleConfigCancel = () => {
    setIsConfigExpanded(false);
  };

  return (
    <SpaceBetween direction="vertical" size="l">
      <AudioController />
      <Container
        header={
          <Header
            variant="h2"
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <Button onClick={() => setIsConfigExpanded(!isConfigExpanded)}>
                  {isConfigExpanded ? 'Hide' : 'Configure'} Chart
                </Button>
                <Button
                  onClick={() => {
                    if (isEditing) {
                      setStepChart((prev) => {
                        if (!prev) return prev;
                        return {
                          ...prev,
                          charts: prev.charts.map((c) =>
                            c.name === chart.name
                              ? { ...c, meter: difficulty }
                              : c,
                          ),
                        };
                      });
                    }
                    setIsEditing(!isEditing);
                  }}
                >
                  {isEditing ? 'Save' : 'Edit'}
                </Button>
              </SpaceBetween>
            }
          >
            Chart info
          </Header>
        }
      >
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
              value: isEditing ? (
                <Input
                  type="number"
                  value={difficulty?.toString() || ''}
                  onChange={(event) => setDifficulty(event.detail.value)}
                />
              ) : (
                chart.meter || '-'
              ),
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

      <ExpandableSection
        header="Individual Chart Configuration"
        expanded={isConfigExpanded}
        onChange={({ detail }) => setIsConfigExpanded(detail.expanded)}
      >
        <ChartConfigurationComponent
          defaultValues={individualConfig}
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
