import {
  Box,
  Button,
  Slider,
  SpaceBetween,
} from '@cloudscape-design/components';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import styled from 'styled-components';
import {
  audioStateAtom,
  currentTimeAtom,
  durationAtom,
} from '../../state/wizardState';

export default function PlaybackControls() {
  const [audioState, setAudioState] = useAtom(audioStateAtom);
  const currentTime = useAtomValue(currentTimeAtom);
  const setCurrentTime = useSetAtom(currentTimeAtom);
  const duration = useAtomValue(durationAtom);

  const togglePlayback = () => {
    if (audioState === 'playing') {
      setAudioState('paused');
    } else {
      setAudioState('playing');
    }
  };

  const restartPlayback = () => {
    setAudioState('stopped');
    // Small delay to ensure the state is processed before playing again
    setTimeout(() => setAudioState('playing'), 50);
  };

  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
    setAudioState('paused');
    setTimeout(() => setAudioState('playing'), 50);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  return (
    <ControlsContainer>
      <SliderContainer>
        <StyledSlider
          value={currentTime}
          onChange={({ detail }) => handleSeek(detail.value)}
          min={0}
          max={duration}
          step={1}
          valueFormatter={formatTime}
        />
        <TimeDisplay>
          {formatTime(currentTime)} / {formatTime(duration)}
        </TimeDisplay>
      </SliderContainer>
      <ButtonsContainer direction="horizontal" size="s">
        <Button
          iconName={audioState === 'playing' ? 'pause' : 'play'}
          onClick={togglePlayback}
          ariaLabel={audioState === 'playing' ? 'Pause' : 'Play'}
        />
        <Button
          iconName="refresh"
          onClick={restartPlayback}
          ariaLabel="Restart"
        />
      </ButtonsContainer>
    </ControlsContainer>
  );
}

const ControlsContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  width: 100%;
`;

const TimeDisplay = styled(Box)`
  display: flex;
  flex-direction: row;
  justify-content: center;
`;

const StyledSlider = styled(Slider)`
  flex-grow: 1;
`;

const SliderContainer = styled(Box)`
  justify-content: center;
  display: flex;
  gap: 16px;
  align-items: center;
`;

const ButtonsContainer = styled(SpaceBetween)`
  display: flex;
  flex-direction: row;
  justify-content: center;
`;
