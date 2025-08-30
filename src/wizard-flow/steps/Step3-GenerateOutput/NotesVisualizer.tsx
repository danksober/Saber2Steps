import * as awsui from '@cloudscape-design/design-tokens';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import styled from 'styled-components';
import type { Measure } from '../../../types/stepTypes';
import {
  audioStateAtom,
  currentTimeAtom,
  stepChartAtom,
} from '../../../wizard-flow/state/wizardState';
import CustomScrollbar from './CustomScrollbar';

interface StepNotesVisualProps {
  measures: Measure[];
}

const CONTAINER_HEIGHT = 600;
const BEATS_PER_MEASURE = 4;
const PADDING_PER_BEAT = 200;
const NOTE_SIZE = 50;

const COLORS = {
  4: 'red',
  8: 'blue',
  12: 'purple',
  16: 'yellow',
  24: 'green',
  32: 'lightgreen',
};

const COLOR_BEAT_LINE = '#545b64'; // approx awsui.colorTextButtonNormalDisabled
const COLOR_MEASURE_LINE = '#d1d5db'; // approx awsui.colorTextBodyDefault
const COLOR_TEXT = '#d1d5db';

const ARROW_SVG_PATH = `
<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
  <path d="M7.35 2.15a.5.5 0 0 1 .3-.1.5.5 0 0 1 .3.1l5.5 4.5a.5.5 0 0 1 0 .8l-5.5 4.5a.5.5 0 0 1-.6-.8L12.04 8 7.04 4.45a.5.5 0 0 1 .3-.8z" transform="rotate(270 8 8)"/>
</svg>
`;
const ARROW_IMAGE = new Image();
const ARROW_SVG_BLOB = new Blob([ARROW_SVG_PATH.trim()], {
  type: 'image/svg+xml',
});
const ARROW_SVG_URL = URL.createObjectURL(ARROW_SVG_BLOB);
ARROW_IMAGE.src = ARROW_SVG_URL;

// =================================================================
// Arrow SVG Definitions
// =================================================================
const BASE_ARROW_SVG_STRING = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 14 14">
  <path d="m 12.668805,7 q 0,0.41592 -0.28498,0.7009 l -5.01412,5.01412 Q 7.069325,13 6.668805,13 6.275995,13 5.975615,12.71502 l -0.57767,-0.57766 q -0.29268,-0.29269 -0.29268,-0.7009 0,-0.40822 0.29268,-0.7009 l 2.25674,-2.25674 h -5.42233 q -0.40052,0 -0.65084,-0.28883 Q 1.331195,7.90116 1.331195,7.49294 V 6.50706 q 0,-0.40822 0.25032,-0.69705 0.25032,-0.28883 0.65084,-0.28883 h 5.42233 L 5.397945,3.25674 q -0.29268,-0.27728 -0.29268,-0.6932 0,-0.41591 0.29268,-0.69319 L 5.975615,1.29268 Q 6.268295,1 6.668805,1 q 0.40822,0 0.7009,0.29268 l 5.01412,5.01412 Q 12.668805,6.57638 12.668805,7 z" />
</svg>`;

const arrowImageCache: { [color: string]: HTMLImageElement } = {};
const parser = new DOMParser();
const serializer = new XMLSerializer();

const getColoredArrowImage = (color: string): Promise<HTMLImageElement> => {
  return new Promise((resolve) => {
    if (arrowImageCache[color]) {
      resolve(arrowImageCache[color]);
      return;
    }

    const svgDoc = parser.parseFromString(
      BASE_ARROW_SVG_STRING,
      'image/svg+xml',
    );
    const path = svgDoc.querySelector('path');
    if (path) {
      path.setAttribute('fill', color);
    }

    const modifiedSvgString = serializer.serializeToString(svgDoc);
    const img = new Image();
    img.src = `data:image/svg+xml;base64,${btoa(modifiedSvgString)}`;
    img.onload = () => {
      arrowImageCache[color] = img;
      resolve(img);
    };
  });
};

const ARROW_ROTATIONS_RAD = {
  0: (180 * Math.PI) / 180, // Left
  1: (90 * Math.PI) / 180, // Down
  2: (270 * Math.PI) / 180, // Up
  3: 0, // Right (default direction of the SVG)
};

const drawImageWithRotation = (
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  angleInRadians: number,
) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angleInRadians);
  ctx.drawImage(image, -NOTE_SIZE / 2, -NOTE_SIZE / 2, NOTE_SIZE, NOTE_SIZE);
  ctx.restore();
};

const drawNote = (
  ctx: CanvasRenderingContext2D,
  note: string[],
  x: number,
  y: number,
  noteSize: number,
  noteIndex: number,
  noteColumnWidth: number,
) => {
  for (let i = 0; i < note.length; i++) {
    const noteType = note[i];
    if (noteType === '1') {
      const color = getNoteColor(noteIndex, noteSize);
      getColoredArrowImage(color).then((arrowImage) => {
        const arrowCenterX = x + i * noteColumnWidth + noteColumnWidth / 2;
        const arrowCenterY = y;
        const rotation = (ARROW_ROTATIONS_RAD as any)[i] ?? 0;

        drawImageWithRotation(
          ctx,
          arrowImage,
          arrowCenterX,
          arrowCenterY,
          rotation,
        );
      });
    } else if (noteType === 'M') {
      // Draw mine emoji
      const _font = ctx.font;
      const mineX = x + i * noteColumnWidth + noteColumnWidth / 2;
      const mineY = y;
      ctx.font = `30px Arial`; // Reduced size from 0.7 to 0.5
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('☢️', mineX, mineY);
      ctx.font = _font;
    }
  }
};

export default function StepNotesVisual({ measures }: StepNotesVisualProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(0);

  const currentTime = useAtomValue(currentTimeAtom);
  const setCurrentTime = useSetAtom(currentTimeAtom);
  const stepChart = useAtomValue(stepChartAtom);
  const [audioState, setAudioState] = useAtom(audioStateAtom);

  // Measure container to set canvas width dynamically
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      setCanvasWidth(container.offsetWidth);
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  const bpm = stepChart ? parseFloat(stepChart.bpms.split(',')[0]) : 0;
  const beatsPerSecond = bpm / 60;
  const autoScrollOffset = currentTime * beatsPerSecond * PADDING_PER_BEAT;

  const handleScroll = useCallback(
    (newScrollTop: number) => {
      if (beatsPerSecond > 0) {
        const newTime = newScrollTop / (beatsPerSecond * PADDING_PER_BEAT);
        setCurrentTime(newTime);
        if (audioState === 'playing' || audioState === 'stopped') {
          setAudioState('paused');
        }
      }
    },
    [beatsPerSecond, setCurrentTime, audioState, setAudioState],
  );

  // Handle manual scroll events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const totalChartHeight =
      measures.length * BEATS_PER_MEASURE * PADDING_PER_BEAT;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const currentScroll = autoScrollOffset;
      const newScroll = currentScroll + event.deltaY;
      const clampedScroll = Math.max(
        0,
        Math.min(newScroll, totalChartHeight - CONTAINER_HEIGHT),
      );
      handleScroll(clampedScroll);
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [handleScroll, autoScrollOffset, measures.length]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !stepChart || canvasWidth === 0) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, CONTAINER_HEIGHT);

    if (Number.isNaN(bpm)) return;

    const scrollOffset = autoScrollOffset;

    // Calculate the chart's drawing area to match the DOM version's style
    const chartAreaWidth = Math.max(500, canvasWidth * 0.5);
    const chartAreaXOffset = (canvasWidth - chartAreaWidth) / 2;
    const NOTE_COLUMN_WIDTH = chartAreaWidth / 4;

    // --- DRAWING LOGIC ---
    // Set text style for measure numbers
    ctx.font = '16px "Open Sans", "Helvetica Neue", Roboto, Arial, sans-serif';
    ctx.textAlign = 'right';

    let currentY = 0;
    for (let i = 0; i < measures.length; i++) {
      const measure = measures[i];
      const measureHeight = PADDING_PER_BEAT * BEATS_PER_MEASURE;
      const measureY = currentY - scrollOffset;

      // Draw measure number
      if (measureY > -measureHeight && measureY < CONTAINER_HEIGHT) {
        ctx.fillStyle = COLOR_TEXT; // Reset fill style before drawing text
        ctx.fillText(i.toString(), chartAreaXOffset - 20, measureY + 7);
      }

      // Draw beats within the measure
      for (let j = 0; j < BEATS_PER_MEASURE; j++) {
        const beatY = currentY + j * PADDING_PER_BEAT - scrollOffset;
        if (beatY > -PADDING_PER_BEAT && beatY < CONTAINER_HEIGHT) {
          ctx.strokeStyle = j === 0 ? COLOR_MEASURE_LINE : COLOR_BEAT_LINE;
          ctx.lineWidth = j === 0 ? 1.5 : 1;
          ctx.beginPath();
          ctx.moveTo(chartAreaXOffset, beatY);
          ctx.lineTo(chartAreaXOffset + chartAreaWidth, beatY);
          ctx.stroke();
        }
      }

      // Draw notes within the measure
      const noteSize = measure.length;
      if (noteSize > 0) {
        const noteHeight = measureHeight / noteSize;
        for (let k = 0; k < measure.length; k++) {
          const note = measure[k];
          const noteY = currentY + k * noteHeight - scrollOffset;

          if (noteY > -noteHeight && noteY < CONTAINER_HEIGHT) {
            drawNote(
              ctx,
              note,
              chartAreaXOffset,
              noteY,
              noteSize,
              k,
              NOTE_COLUMN_WIDTH,
            );
          }
        }
      }

      currentY += measureHeight;
    }
  }, [measures, stepChart, bpm, canvasWidth, autoScrollOffset]);

  const totalChartHeight =
    measures.length * BEATS_PER_MEASURE * PADDING_PER_BEAT;

  return (
    <Container>
      <ChartVisualContainer ref={containerRef}>
        <canvas ref={canvasRef} width={canvasWidth} height={CONTAINER_HEIGHT} />
      </ChartVisualContainer>
      <CustomScrollbar
        scrollHeight={totalChartHeight}
        clientHeight={CONTAINER_HEIGHT}
        scrollTop={autoScrollOffset}
        onScroll={handleScroll}
      />
    </Container>
  );
}

const getNoteColor = (noteIndex: number, noteSize: number): string => {
  // This logic is equivalent to the original DOM-based component's color calculation.
  // It uses integer math to avoid potential floating-point rounding errors.

  for (const divisor of Object.keys(COLORS)) {
    const numDivisor = parseInt(divisor, 10);
    if (noteSize >= numDivisor && (noteIndex * numDivisor) % noteSize === 0) {
      return (COLORS as any)[numDivisor];
    }
  }
  return 'gray';
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  margin: 0 auto;
`;

const ChartVisualContainer = styled.div`
  height: ${CONTAINER_HEIGHT}px;
  border: 1px solid ${awsui.colorBorderDividerDefault};
  border-right: none;
  border-radius: ${awsui.borderRadiusContainer} 0 0 ${awsui.borderRadiusContainer};
  background-color: ${awsui.colorBackgroundHomeHeader};
  overflow: hidden; /* Canvas handles its own scrolling */
  display: flex;
  flex-grow: 1;
`;
