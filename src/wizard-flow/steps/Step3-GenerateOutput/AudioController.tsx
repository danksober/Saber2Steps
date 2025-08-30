import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { getNoteTimestamps } from '../../../parser/getNoteTimestamps';
import {
  activeChartAtom,
  audioStateAtom,
  currentTimeAtom,
  durationAtom,
  hitSoundVolumeAtom,
  musicVolumeAtom,
  stepChartAtom,
} from '../../state/wizardState';

export default function AudioController() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const animationFrameRef = useRef<number>(0);
  const { watch } = useFormContext();
  const musicFile = watch('musicFile');
  const [audioState, setAudioState] = useAtom(audioStateAtom);
  const setCurrentTime = useSetAtom(currentTimeAtom);
  const setDuration = useSetAtom(durationAtom);
  const stepChart = useAtomValue(stepChartAtom);
  const activeChart = useAtomValue(activeChartAtom);
  const musicVolume = useAtomValue(musicVolumeAtom);
  const hitSoundVolume = useAtomValue(hitSoundVolumeAtom);
  const currentTime = useAtomValue(currentTimeAtom);

  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const lastTimeRef = useRef(0);
  const nextNoteIndexRef = useRef(0);

  // Web Audio API refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const hitSoundBufferRef = useRef<AudioBuffer | null>(null);
  const musicSourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const musicGainNodeRef = useRef<GainNode | null>(null);
  const hitSoundGainNodeRef = useRef<GainNode | null>(null);
  const activeHitSoundSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Initialize Web Audio API and load hit sound
  useEffect(() => {
    const initAudio = async () => {
      const context = new window.AudioContext();
      audioContextRef.current = context;

      // Create gain nodes for volume control
      musicGainNodeRef.current = context.createGain();
      hitSoundGainNodeRef.current = context.createGain();

      musicGainNodeRef.current.connect(context.destination);
      hitSoundGainNodeRef.current.connect(context.destination);

      try {
        // TODO: Replace with actual sound file
        const response = await fetch('/sounds/clap3.mp3');
        if (!response.ok) {
          throw new Error(`Failed to fetch sound file: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await context.decodeAudioData(arrayBuffer);
        hitSoundBufferRef.current = audioBuffer;
      } catch (error) {
        console.warn('Could not load or decode hit sound:', error);
      }
    };

    initAudio();
  }, []);

  // Connect the <audio> element to the Web Audio graph
  // biome-ignore lint/correctness/useExhaustiveDependencies: need this
  useEffect(() => {
    const audio = audioRef.current;
    const audioContext = audioContextRef.current;
    const musicGainNode = musicGainNodeRef.current;
    if (!audio || !audioContext || !musicGainNode) return;

    if (!musicSourceNodeRef.current) {
      musicSourceNodeRef.current = audioContext.createMediaElementSource(audio);
      musicSourceNodeRef.current.connect(musicGainNode);
    }
  }, [objectUrl]); // Rerun when the audio src changes

  // Update volumes when atoms change
  useEffect(() => {
    if (musicGainNodeRef.current) {
      musicGainNodeRef.current.gain.value = musicVolume;
    }
  }, [musicVolume]);

  useEffect(() => {
    if (hitSoundGainNodeRef.current) {
      hitSoundGainNodeRef.current.gain.value = hitSoundVolume;
    }
  }, [hitSoundVolume]);

  const noteTimestamps = useMemo(() => {
    if (!activeChart || !stepChart) return [];

    const bpm = parseFloat(stepChart.bpms.split(',')[0]);
    const offset = parseFloat(stepChart.offset || '0');
    if (Number.isNaN(bpm)) return [];

    return getNoteTimestamps(activeChart.notes, bpm, offset);
  }, [activeChart, stepChart]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: activeChart is needed to reset state on chart change
  useEffect(() => {
    setAudioState('stopped');
  }, [activeChart, setAudioState]);

  // Reset note index when the chart changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: need this
  useEffect(() => {
    nextNoteIndexRef.current = 0;
  }, [noteTimestamps]);

  // Create an object URL from the music file
  useEffect(() => {
    if (musicFile) {
      const url = URL.createObjectURL(musicFile);
      setObjectUrl(url);

      return () => {
        URL.revokeObjectURL(url);
        setObjectUrl(null);
      };
    }
  }, [musicFile]);

  const playHitSound = useCallback(() => {
    const audioContext = audioContextRef.current;
    const hitSoundBuffer = hitSoundBufferRef.current;
    const hitSoundGainNode = hitSoundGainNodeRef.current;
    if (!audioContext || !hitSoundBuffer || !hitSoundGainNode) return;

    // Stop the previous sound if it's still playing
    if (activeHitSoundSourceRef.current) {
      activeHitSoundSourceRef.current.stop();
    }

    const source = audioContext.createBufferSource();
    source.buffer = hitSoundBuffer;
    source.connect(hitSoundGainNode);
    source.start();

    // Track the new source
    activeHitSoundSourceRef.current = source;
  }, []);

  // Main animation loop
  useEffect(() => {
    const loop = () => {
      const audio = audioRef.current;
      if (!audio) return;

      const currentTime = audio.currentTime;
      setCurrentTime(currentTime);

      let nextIndex = nextNoteIndexRef.current;
      while (
        nextIndex < noteTimestamps.length &&
        noteTimestamps[nextIndex] >= lastTimeRef.current &&
        noteTimestamps[nextIndex] < currentTime
      ) {
        playHitSound();
        nextIndex++;
      }
      nextNoteIndexRef.current = nextIndex;

      lastTimeRef.current = currentTime;
      animationFrameRef.current = requestAnimationFrame(loop);
    };

    if (audioState === 'playing') {
      lastTimeRef.current = audioRef.current?.currentTime ?? 0;
      animationFrameRef.current = requestAnimationFrame(loop);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioState, noteTimestamps, playHitSound, setCurrentTime]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Sync audio element's time with state when scrolling
    if (
      audioState !== 'playing' &&
      Math.abs(audio.currentTime - currentTime) > 0.1
    ) {
      audio.currentTime = currentTime;
      lastTimeRef.current = currentTime; // Keep lastTimeRef in sync

      // Find the correct next note index after seeking
      const newNoteIndex = noteTimestamps.findIndex(
        (timestamp) => timestamp >= currentTime,
      );

      // If no note is found, it means we've scrolled past the last note
      nextNoteIndexRef.current =
        newNoteIndex === -1 ? noteTimestamps.length : newNoteIndex;
    }
  }, [currentTime, audioState, noteTimestamps]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audioState === 'playing') {
      audio.play();
    } else if (audioState === 'paused') {
      audio.pause();
    } else if (audioState === 'stopped') {
      audio.pause();
      audio.currentTime = 0;
      setCurrentTime(0); // Also update state
      lastTimeRef.current = 0;
      nextNoteIndexRef.current = 0; // Reset for next playback
    }
  }, [audioState, setCurrentTime]);

  if (!stepChart?.music || !objectUrl) {
    return null;
  }

  return (
    <audio
      ref={audioRef}
      src={objectUrl}
      onLoadedMetadata={() => {
        if (audioRef.current) {
          setDuration(audioRef.current.duration);
        }
      }}
      onEnded={() => {
        setAudioState('stopped');
      }}
    >
      <track kind="captions" />
    </audio>
  );
}
