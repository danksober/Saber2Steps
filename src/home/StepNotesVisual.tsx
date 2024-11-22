import { Measure } from '../types/stepTypes';
import styled from 'styled-components';
import * as awsui from '@cloudscape-design/design-tokens';

interface StepNotesVisualProps {
  measures: Measure[];
}

const CONTAINER_HEIGHT = '600px';

export default function StepNotesVisual({ measures }: StepNotesVisualProps) {
  return (
    <ChartVisualContainer>
      <NotesContainer>
        {measures.map((measure, index) => (
          <MeasureContainer measure={measure} key={index} />
        ))}
      </NotesContainer>
    </ChartVisualContainer>
  );
}

const BEATS_PER_MEASURE = 4;
const BEATS = new Array(BEATS_PER_MEASURE).fill(0);
const PADDING_PER_BEAT = '200px';

const MeasureContainer = ({ measure }: { measure: Measure }) => {
  const noteSize = measure.length;
  return (
    <StyledMeasureContainer>
      <BeatContainer>
        {BEATS.map((_, index) => (
          <Beat key={index} ishighlighted={index === 0 ? 'true' : 'false'} />
        ))}
      </BeatContainer>
      <NotesWrapper>
        {measure.map((note, index) => (
          <Note key={index} note={note} height={`${(1 / noteSize) * 100}%`} />
        ))}
      </NotesWrapper>
    </StyledMeasureContainer>
  );
};

interface NoteProps {
  note: number[];
  height: string;
}

const Note = ({ note, height }: NoteProps) => {
  return <StyledNote height={height}>{
    note.map((position, index) => <StyledNotePosition key={index}>
        {position ? '*' : <></>}
    </StyledNotePosition>)

  }</StyledNote>;
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
    top: -8px;
`;

const Beat = styled.div<BeatProps>`
    padding-bottom: ${PADDING_PER_BEAT};
    width: 100%;
    border-top: ${(props) => (props.ishighlighted === 'false' ? `1px solid ${awsui.colorTextButtonNormalDisabled}` : `1.5px solid ${awsui.colorTextBodyDefault}`)};
`;

const StyledMeasureContainer = styled.div`
    position: relative;
    top: 0;
`;

const BeatContainer = styled.div`
    
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
    &::-webkit-scrollbar {
    display: none;
  }
`;
