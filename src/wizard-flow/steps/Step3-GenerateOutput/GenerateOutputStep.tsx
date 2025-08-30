import {
  Container,
  Header,
  KeyValuePairs,
  SpaceBetween,
  Tabs,
  type TabsProps,
} from '@cloudscape-design/components';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { activeChartAtom, stepChartAtom } from '../../state/wizardState';
import ChartPreview from './ChartPreview';

export default function StepCharts() {
  const stepChart = useAtomValue(stepChartAtom);
  const setActiveChart = useSetAtom(activeChartAtom);
  const [tabId, setTabId] = useState(stepChart?.charts?.[0]?.name);

  useEffect(() => {
    if (stepChart?.charts?.[0]) {
      setActiveChart(stepChart.charts[0]);
    }
  }, [stepChart, setActiveChart]);

  if (!stepChart) {
    // biome-ignore lint/complexity/noUselessFragments: it's a placeholder
    return <></>;
  }

  const handleTabChange = (newTabId: string) => {
    setTabId(newTabId);
    const newChart = stepChart.charts.find((c) => c.name === newTabId);
    setActiveChart(newChart);
  };

  const tabs: TabsProps.Tab[] = stepChart.charts.map((chart) => ({
    id: chart.name,
    label: chart.name,
    content: <ChartPreview chart={chart} />,
  }));
  return (
    <SpaceBetween direction="vertical" size="l">
      <Container header={<Header variant="h2">Song info</Header>}>
        <KeyValuePairs
          columns={3}
          items={[
            {
              label: 'Title',
              value: stepChart.title,
            },
            {
              label: 'Subtitle',
              value: stepChart.subtitle || '-',
            },
            {
              label: 'Artist',
              value: stepChart.artist || '-',
            },
            {
              label: 'BPM',
              value: stepChart.bpms,
            },
            {
              label: 'Offset',
              value: stepChart.outputOffset || '-',
            },
            {
              label: 'Credit',
              value: stepChart.credit || '-',
            },
            {
              label: 'Background',
              value: stepChart.background || '-',
            },
            {
              label: 'Music',
              value: stepChart.music || '-',
            },
            {
              label: 'Genre',
              value: stepChart.genre || '-',
            },
            {
              label: 'Sample start',
              value: stepChart.sampleStart || '-',
            },
            {
              label: 'Sample length',
              value: stepChart.sampleLength || '-',
            },
          ]}
        />
      </Container>
      {stepChart.charts?.length && (
        <Tabs
          variant="default"
          tabs={tabs}
          activeTabId={tabId}
          onChange={(e) => handleTabChange(e.detail.activeTabId)}
        ></Tabs>
      )}
    </SpaceBetween>
  );
}
