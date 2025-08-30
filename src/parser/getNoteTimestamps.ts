import type { Measure } from '../types/stepTypes';

export const getNoteTimestamps = (
  measures: Measure[],
  bpm: number,
  offset: number,
): number[] => {
  const noteTimestamps: number[] = [];
  let currentTime = -offset; // Start with the offset
  const SOUND_DELAY_COMPENSATION = 0.05; // 50ms

  const secondsPerBeat = 60 / bpm;

  for (const measure of measures) {
    if (measure.length === 0) continue;

    const secondsPerNote = (secondsPerBeat * 4) / measure.length;

    for (const note of measure) {
      // Check if the note is not empty (i.e., it's not '0000')
      if (note.some((n) => n.toString() !== '0' && n.toString() !== 'M')) {
        noteTimestamps.push(currentTime - SOUND_DELAY_COMPENSATION);
      }
      currentTime += secondsPerNote;
    }
  }

  console.log('secondsPerNote', measures);
  console.log('noteTimestamps', noteTimestamps);

  return noteTimestamps;
};
