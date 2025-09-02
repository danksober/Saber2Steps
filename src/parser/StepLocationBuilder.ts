import type { RandomnessScore } from '../form/stepConfigurationShared';
import type { StepBuilderConfig } from './StepBuilder.types';

function randomChoiceExcluding(exclude: number, pool: number[] = [0, 1, 2, 3]) {
  const choices = pool.filter((i) => i !== exclude);
  return choices[Math.floor(Math.random() * choices.length)];
}

function calculateRandomnessScore(
  lookbackBuffer: { note: string[]; time: number }[] | undefined,
): number {
  if (!lookbackBuffer || lookbackBuffer.length < 10) {
    return 1; // Not enough data to score, assume it's good
  }

  // Helper functions for metric calculation
  function getCounts(buf: { note: string[]; time: number }[] | undefined) {
    const counts = [0, 0, 0, 0];
    if (!buf || !buf.length) return counts;
    for (const entry of buf) {
      if (!entry || !entry.note) continue;
      for (let i = 0; i < 4; i++) if (entry.note[i] === '1') counts[i]++;
    }
    return counts;
  }

  function maxDiffNormalized(counts: number[]) {
    const total = counts.reduce((s, v) => s + v, 0);
    if (total === 0) return 1;
    const mean = total / 4;
    const maxDiff = Math.max(...counts.map((c) => Math.abs(c - mean)));
    return maxDiff / Math.max(1, mean);
  }

  function normalizedEntropy(counts: number[]) {
    const total = counts.reduce((s, v) => s + v, 0);
    if (total === 0) return 0;
    let ent = 0;
    for (const c of counts) {
      if (c <= 0) continue;
      const p = c / total;
      ent -= p * Math.log2(p);
    }
    return ent / 2; // max entropy is 2
  }

  function longestStreak(buf: { note: string[]; time: number }[] | undefined) {
    if (!buf || !buf.length) return 0;
    let maxStreak = 0;
    let cur: number | null = null;
    let streak = 0;
    for (const entry of buf) {
      if (!entry || !entry.note) {
        cur = null;
        streak = 0;
        continue;
      }
      const idx = entry.note.findIndex((v) => v === '1');
      if (idx === -1) {
        cur = null;
        streak = 0;
        continue;
      }
      if (cur === idx) streak++;
      else {
        cur = idx;
        streak = 1;
      }
      if (streak > maxStreak) maxStreak = streak;
    }
    return maxStreak;
  }

  const counts = getCounts(lookbackBuffer);
  const normMaxDiff = maxDiffNormalized(counts);
  const ent = normalizedEntropy(counts);
  const streak = longestStreak(lookbackBuffer);
  const streakNormalized =
    lookbackBuffer && lookbackBuffer.length
      ? streak / lookbackBuffer.length
      : 0;

  // Weights for each metric. All weights should sum to 1.
  const entropyWeight = 0.5;
  const distributionWeight = 0.3; // How evenly notes are distributed
  const streakWeight = 0.2; // How much to penalize streaks

  // For distribution and streak, a lower value is better, so we invert them.
  const score =
    ent * entropyWeight +
    (1 - normMaxDiff) * distributionWeight +
    (1 - streakNormalized) * streakWeight;

  return score;
}

const getRandomnessThreshold = (randomnessScore: RandomnessScore) => {
  switch (randomnessScore) {
    case 'none':
      return 0;
    case 'low':
      return 0.3;
    case 'medium':
      return 0.5;
    case 'high':
      return 0.7;
  }
};

function isLookbackBufferRandomEnough(
  lookbackBuffer: { note: string[]; time: number }[] | undefined,
  randomnessScore: RandomnessScore,
) {
  return (
    calculateRandomnessScore(lookbackBuffer) >=
    getRandomnessThreshold(randomnessScore)
  );
}

function getRandomChoiceForSingle(
  current: number[],
  config: StepBuilderConfig,
  lookbackBuffer: { note: string[]; time: number }[] | undefined,
  beatGap: number,
  previousFoot: { value: 'left' | 'right' | undefined },
) {
  const maxTries = 5;
  let bestLocation = [...current];
  let bestScore = calculateRandomnessScore(lookbackBuffer);

  // If the initial location is already random enough, no need to search.
  if (
    isLookbackBufferRandomEnough(
      lookbackBuffer,
      config.randomnessScore || 'none',
    )
  ) {
    return bestLocation;
  }

  for (let i = 0; i < maxTries; i++) {
    const newLocation = [randomChoiceExcluding(bestLocation[0])];

    const ruleCompliantLocation = enforcePlacementRules(
      config,
      lookbackBuffer,
      newLocation,
      beatGap,
      { ...previousFoot },
    );

    if (ruleCompliantLocation.length > 0) {
      const newLookbackBuffer = lookbackBuffer ? [...lookbackBuffer] : [];
      const noteArray = ['0', '0', '0', '0'];
      noteArray[ruleCompliantLocation[0]] = '1';
      newLookbackBuffer.push({
        note: noteArray,
        time: beatGap,
      });

      const newScore = calculateRandomnessScore(newLookbackBuffer);

      if (newScore > bestScore) {
        console.log('ruleCompliantLocation', ruleCompliantLocation);
        console.log('current', current);
        bestScore = newScore;
        bestLocation = ruleCompliantLocation;
      }
    }
  }

  return bestLocation;
}

function calculateNextFoot(
  previousPositions: number[],
  currentLocations: number[],
  previousFoot: { value: 'left' | 'right' | undefined },
): 'left' | 'right' | undefined {
  if (previousPositions.join('') === currentLocations.join('')) {
    return previousFoot.value; // No change
  }

  if (currentLocations.length === 1) {
    if (currentLocations[0] === 0) {
      return 'left';
    }
    if (currentLocations[0] === 3) {
      return 'right';
    }
    return previousFoot.value === 'left' ? 'right' : 'left';
  }

  return previousFoot.value; // No change for jumps
}

function enforcePlacementRules(
  config: StepBuilderConfig,
  lookbackBuffer: { note: string[]; time: number }[] | undefined,
  currentLocations: number[],
  beatGap: number,
  previousFoot: { value: 'left' | 'right' | undefined },
): number[] {
  // derive previousPositions from the last entry in the lookback buffer
  const previousPositions: number[] = [];
  const lastEntry = lookbackBuffer?.length
    ? lookbackBuffer[lookbackBuffer.length - 1]
    : undefined;
  if (lastEntry?.note) {
    lastEntry.note.forEach((_note, index) => {
      if (_note === '1') previousPositions.push(index);
    });
  }
  const {
    crossover,
    hands,
    minGapForCrossovers,
    minGapForDoubleTap,
    minGapForTapJumps,
    minGapForJumpTap,
    minGapForJumps,
  } = config;
  const DEFAULT_BEATS_PER_MEASURE = 4;
  // not jump
  if (currentLocations.length === 1) {
    // double tap
    if (
      beatGap < DEFAULT_BEATS_PER_MEASURE / minGapForDoubleTap! &&
      previousPositions.join('') === currentLocations.join('')
    ) {
      // pick a random index 0-3 excluding the current one
      currentLocations[0] = randomChoiceExcluding(currentLocations[0]);
      return enforcePlacementRules(
        config,
        lookbackBuffer,
        currentLocations,
        beatGap,
        previousFoot,
      );
    } else if (
      // jump tap
      beatGap < DEFAULT_BEATS_PER_MEASURE / minGapForJumpTap! &&
      previousPositions.length > 1
    ) {
      return [];
    } else if (
      // crossover
      crossover === 'false' ||
      beatGap < DEFAULT_BEATS_PER_MEASURE / minGapForCrossovers!
    ) {
      let currentFoot: 'left' | 'right' | undefined;
      if (currentLocations[0] === 0) {
        currentFoot = 'left';
      } else if (currentLocations[0] === 3) {
        currentFoot = 'right';
      }
      if (previousFoot.value && previousFoot.value === currentFoot) {
        // pick a random index 0-3 excluding the current one
        currentLocations[0] = randomChoiceExcluding(currentLocations[0]);
        return enforcePlacementRules(
          config,
          lookbackBuffer,
          currentLocations,
          beatGap,
          previousFoot,
        );
      }
    }
    // if (previousPositions.join('') === currentLocations.join('')) {
    //   // keep previousFoot unchanged
    // }
    return currentLocations;
  } else if (currentLocations.length >= 2) {
    // is jump
    if (hands === 'false') {
      currentLocations = currentLocations.slice(0, 2);
    }
    if (
      previousPositions.length > 1 &&
      beatGap < DEFAULT_BEATS_PER_MEASURE / minGapForJumps!
    ) {
      currentLocations = currentLocations.slice(0, 1);
      return enforcePlacementRules(
        config,
        lookbackBuffer,
        currentLocations,
        beatGap,
        previousFoot,
      );
    } else if (
      previousPositions.length === 1 &&
      beatGap < DEFAULT_BEATS_PER_MEASURE / minGapForTapJumps!
    ) {
      currentLocations = currentLocations.slice(0, 1);
      return enforcePlacementRules(
        config,
        lookbackBuffer,
        currentLocations,
        beatGap,
        previousFoot,
      );
    } else {
      return currentLocations;
    }
  }
  return currentLocations;
}

export function stepLocationBuilder(
  config: StepBuilderConfig,
  lookbackBuffer: { note: string[]; time: number }[] | undefined,
  currentLocations: number[],
  beatGap: number,
  previousFoot: { value: 'left' | 'right' | undefined },
): number[] {
  const ruleCompliantLocations = enforcePlacementRules(
    config,
    lookbackBuffer,
    currentLocations,
    beatGap,
    previousFoot,
  );

  const isRandomEnough = isLookbackBufferRandomEnough(
    lookbackBuffer,
    config.randomnessScore || 'none',
  );

  const finalLocation = isRandomEnough
    ? ruleCompliantLocations
    : getRandomChoiceForSingle(
        ruleCompliantLocations,
        config,
        lookbackBuffer,
        beatGap,
        previousFoot,
      );

  // Derive previousPositions again for the final location
  const previousPositions: number[] = [];
  const lastEntry = lookbackBuffer?.length
    ? lookbackBuffer[lookbackBuffer.length - 1]
    : undefined;
  if (lastEntry?.note) {
    lastEntry.note.forEach((_note, index) => {
      if (_note === '1') previousPositions.push(index);
    });
  }

  // Update foot after the final decision
  previousFoot.value = calculateNextFoot(
    previousPositions,
    finalLocation,
    previousFoot,
  );

  return finalLocation;
}
