/**
 * Calculate timing difference in seconds introduced by shifting notes to a
 * different fractional grid. Returns a positive number indicating how many
 * seconds the notes are moved forward (positive) or backward (negative)
 * relative to the original timestamps.
 */
export function getShiftTimingDifference(
  shifting: number | null | undefined,
  shiftingDirection: 'forward' | 'backward' | undefined,
  bpm: number,
): number {
  if (!shifting || shifting <= 0) return 0;

  const secondsPerBeat = 60 / bpm;
  const beatsPerSubdivision = 4 / shifting;
  const shiftInSeconds = beatsPerSubdivision * secondsPerBeat;

  return shiftingDirection === 'backward' ? -shiftInSeconds : shiftInSeconds;
}
