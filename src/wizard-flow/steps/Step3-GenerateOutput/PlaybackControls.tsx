import {
  Button,
  ProgressBar,
  SpaceBetween,
} from '@cloudscape-design/components';
import { useAtom, useAtomValue } from 'jotai';
import {
  audioStateAtom,
  currentTimeAtom,
  durationAtom,
} from '../../state/wizardState';

export default function PlaybackControls() {
  const [audioState, setAudioState] = useAtom(audioStateAtom);
  const currentTime = useAtomValue(currentTimeAtom);
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

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <SpaceBetween direction="vertical" size="m" alignItems="center">
      <SpaceBetween direction="horizontal" size="s">
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
      </SpaceBetween>
      <div style={{ flexGrow: 1 }}>
        <ProgressBar
          value={progress}
          additionalInfo={
            <SpaceBetween direction="horizontal" size="xs">
              <span>{formatTime(currentTime)}</span>
              <span>/</span>
              <span>{formatTime(duration)}</span>
            </SpaceBetween>
          }
        />
      </div>
    </SpaceBetween>
  );
}
