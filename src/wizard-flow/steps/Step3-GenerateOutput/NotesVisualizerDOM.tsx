import { Icon } from '@cloudscape-design/components';
import * as awsui from '@cloudscape-design/design-tokens';
import { useAtomValue } from 'jotai';
import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import type { Measure } from '../../../types/stepTypes';
import {
  currentTimeAtom,
  stepChartAtom,
} from '../../../wizard-flow/state/wizardState';

interface StepNotesVisualProps {
  measures: Measure[];
}

const CONTAINER_HEIGHT = '600px';
const PADDING_PER_BEAT_NUM = 200;

export default function StepNotesVisualDOM({ measures }: StepNotesVisualProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentTime = useAtomValue(currentTimeAtom);
  const stepChart = useAtomValue(stepChartAtom);

  useEffect(() => {
    if (!stepChart || !containerRef.current) return;

    const bpm = parseFloat(stepChart.bpms.split(',')[0]);
    if (isNaN(bpm)) return;

    const beatsPerSecond = bpm / 60;
    const currentBeat = currentTime * beatsPerSecond;
    const scrollTop = currentBeat * PADDING_PER_BEAT_NUM;

    containerRef.current.scrollTop = scrollTop;
  }, [currentTime, stepChart]);

  return (
    <ChartVisualContainer ref={containerRef}>
      <NotesContainer>
        {measures.map((measure, index) => (
          <MeasureContainer measure={measure} key={index} index={index} />
        ))}
      </NotesContainer>
    </ChartVisualContainer>
  );
}

const BEATS_PER_MEASURE = 4;
const BEATS = new Array(BEATS_PER_MEASURE).fill(0);
const PADDING_PER_BEAT = '200px';

const MeasureContainer = ({
  measure,
  index: measureIndex,
}: {
  measure: Measure;
  index: number;
}) => {
  const noteSize = measure.length;
  return (
    <StyledMeasureContainer>
      <BeatContainer index={measureIndex.toString()}>
        {BEATS.map((_, index) => (
          <Beat
            key={index}
            ishighlighted={index === 0 ? 'true' : 'false'}
          ></Beat>
        ))}
      </BeatContainer>
      <NotesWrapper>
        {measure.map((note, index) => (
          <Note
            key={index}
            note={note}
            index={index}
            height={`${(1 / noteSize) * 100}%`}
            noteSize={noteSize}
          />
        ))}
      </NotesWrapper>
    </StyledMeasureContainer>
  );
};

const COLORS = {
  4: 'red',
  8: 'blue',
  12: 'purple',
  16: 'yellow',
  24: 'green',
  32: 'lightgreen',
};

const getNoteColor = (index: number, noteSize: number) => {
  const fraction = index / noteSize;

  for (const divisor of Object.keys(COLORS)) {
    const numDivisor = parseInt(divisor, 10);
    if (noteSize >= numDivisor && (index * numDivisor) % noteSize === 0) {
      return (COLORS as any)[numDivisor];
    }
  }
  return 'gray';
};

interface NoteProps {
  note: string[];
  height: string;
  noteSize: number;
  index: number;
}

const Note = ({ note, height, noteSize, index }: NoteProps) => {
  const color = getNoteColor(index, noteSize);
  return (
    <StyledNote height={height}>
      {note.map((position, index) => (
        <StyledNotePosition key={index}>
          {position === '1' && <NoteArrow position={index} color={color} />}
          {position === 'M' && <Mine />}
        </StyledNotePosition>
      ))}
    </StyledNote>
  );
};

const ARROW_ROTATE_DEGS = {
  0: 270,
  1: 180,
  2: 0,
  3: 90,
};

const Mine = () => {
  return (
    <StyledMine>
      <span>☢️</span>
    </StyledMine>
  );
};

const NoteArrow = ({
  position,
  color,
}: {
  position: number;
  color: string;
}) => {
  return (
    <div
      style={{
        color,
        transform: `rotate(${(ARROW_ROTATE_DEGS as any)[position]}deg)`,
      }}
    >
      <Icon size="big" name="arrow-up" />
    </div>
  );
};

interface BeatProps {
  ishighlighted: 'true' | 'false';
}

const NotesWrapper = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0;
`;

interface StyledNoteProps {
  height: string;
}

const StyledNote = styled.div<StyledNoteProps>`
  height: ${(props) => props.height};
  position: relative;
  top: -12px;
`;

const StyledMine = styled.div`
  span {
    font-size: 30px;
  }
`;

const Beat = styled.div<BeatProps>`
  & {
    padding-bottom: ${PADDING_PER_BEAT};
    width: 100%;
    border-top: ${(props) =>
      props.ishighlighted === 'false'
        ? `1px solid ${awsui.colorTextButtonNormalDisabled}`
        : `1.5px solid ${awsui.colorTextBodyDefault}`};
  }
`;

const StyledMeasureContainer = styled.div`
  position: relative;
  top: 0;
`;

interface StyledBeatProps {
  index: string;
}

const BeatContainer = styled.div<StyledBeatProps>`
  position: relative;
  &:before {
    content: '${(props) => props.index}';
    position: absolute;
    right: calc(100% + 20px);
    width: 30px;
    top: -10px;
  }
`;

const StyledNotePosition = styled.div`
  width: 25%;
  display: inline-block;
`;

const NotesContainer = styled.div`
  min-width: 500px;
  max-width: 50%;
  padding: 0 32px;
  text-align: center;
`;

const ChartVisualContainer = styled.div`
  height: ${CONTAINER_HEIGHT};
  border: 1px solid ${awsui.colorBorderDividerDefault};
  border-radius: ${awsui.borderRadiusContainer};
  background-color: ${awsui.colorBackgroundHomeHeader};
  overflow: auto;
  display: flex;
  justify-content: center;
  scroll-behavior: smooth;
`;
