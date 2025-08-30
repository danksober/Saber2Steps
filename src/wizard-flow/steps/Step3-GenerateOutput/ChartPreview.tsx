import { Button, SpaceBetween } from '@cloudscape-design/components';
import { useState } from 'react';
import type { Chart } from '../../../types/stepTypes';
import NotesVisualizer from './NotesVisualizer';
import NotesVisualizerDOM from './NotesVisualizerDOM';

interface ChartPreviewProps {
  chart: Chart;
}

export default function ChartPreview({ chart }: ChartPreviewProps) {
  const [useCanvas, setUseCanvas] = useState(true);

  return (
    <SpaceBetween size="m">
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          iconName={useCanvas ? 'zoom-to-fit' : 'view-full'}
          onClick={() => setUseCanvas((prev) => !prev)}
        >
          Toggle Renderer (Current: {useCanvas ? 'Canvas' : 'DOM'})
        </Button>
      </div>

      {useCanvas ? (
        <NotesVisualizer measures={chart.notes} />
      ) : (
        <NotesVisualizerDOM measures={chart.notes} />
      )}
    </SpaceBetween>
  );
}
