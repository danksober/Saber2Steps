import {
  Container,
  Header,
  KeyValuePairs,
  SpaceBetween,
  Tabs,
  TabsProps,
} from '@cloudscape-design/components';
import { useAtomValue } from 'jotai';
import React, { useState } from 'react';
import { stepChartAtom } from './formState';

export default function StepCharts() {
  const stepChart = useAtomValue(stepChartAtom);
  const [tabId, setTabId] = useState(stepChart?.charts?.[0]?.name);

  if (!stepChart) {
    return <></>;
  }

  const tabs: TabsProps.Tab[] = stepChart.charts.map((chart) => ({
    id: chart.name,
    label: chart.name,
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
              value: stepChart.offset || '-',
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
      {stepChart.charts?.length && <Tabs variant="default" tabs={tabs} activeTabId={tabId} onChange={(e) => setTabId(e.detail.activeTabId)}></Tabs>}
    </SpaceBetween>
  );
}
