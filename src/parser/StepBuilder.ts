import type { StepConfigurationFormState } from '../form/configurationForm';
import type { NoteV2 } from '../types/mapTypes';
import type { Chart, Measure, StepChart } from '../types/stepTypes';
import { ITG_OFFSET } from '../wizard-flow/constants/offset';

export type StepBuilderConfig = Omit<StepChart, 'charts'> & {
  mapNotes: NoteV2[];
  difficultyName: string;
} & StepConfigurationFormState;

const DEFAULT_BEATS_PER_MEASURE = 4;

const POSSIBLE_BEATS_PER_MEASURE = [4, 8, 12, 16, 24, 32, 48, 64, 96, 128];

function generateFractions(
  maxBeatsPerMeasure: number,
  shouldIncludeSubfractions = false,
) {
  let res = 0;
  const fractions: number[] = [];
  while (res <= 1) {
    fractions.push(+res.toFixed(3));
    res += (1 / maxBeatsPerMeasure) * 4;
  }
  if (!shouldIncludeSubfractions) {
    return fractions;
  }
  if (maxBeatsPerMeasure === 12) {
    const _fractions = generateFractions(8);
    fractions.push(..._fractions);
  } else if (maxBeatsPerMeasure === 24) {
    const _fractions = generateFractions(16);
    fractions.push(..._fractions);
  } else if (maxBeatsPerMeasure === 32) {
    const _fractions = generateFractions(24);
    fractions.push(..._fractions);
  }
  return Array.from(new Set<number>(fractions)).sort();
}

const FRACTIONS = POSSIBLE_BEATS_PER_MEASURE.reduce<{
  [note: number]: number[];
}>((acc, cur) => {
  const fractions = generateFractions(cur);
  acc[cur] = fractions;
  return acc;
}, {});

export class StepBuilder {
  config: StepBuilderConfig;
  private tap: number = 0;
  private jump: number = 0;
  private mines: number = 0;
  private hands: number = 0;
  private hold: number = 0;

  private _fractions: number[] = [];
  constructor(StepConfig: StepBuilderConfig) {
    this.config = StepConfig;
    this._fractions = generateFractions(
      this.config.minGapForAutoSnapping || 24,
      true,
    );
  }

  build(): Chart {
    const chart = this.mapToChart(this.config.mapNotes);
    return chart;
  }

  getBpm() {
    return this.config.bpms;
  }

  private applyAdditionalOffset(notes: NoteV2[]) {
    // additionalOffset is stored in seconds; StepBuilder times are in beats.
    // Convert seconds -> beats using bpm: beats = seconds * (bpm / 60)
    const bpm = Number(this.getBpm()) || 120;
    const offsetSeconds =
      (this.config.additionalOffset ?? ITG_OFFSET) - ITG_OFFSET;
    const offsetInBeats = offsetSeconds * (bpm / 60);
    return notes.map((note) => ({
      ...note,
      _time: note._time + offsetInBeats,
    }));
  }

  private mapToChart(notes: NoteV2[]) {
    console.log(notes);
    const stepNotes = this.buildV2StepNotes(this.applyAdditionalOffset(notes));
    const chart: Chart = {
      type: 'dance-single',
      meter: this.getChartDifficulty(stepNotes).toString(),
      name: this.config.difficultyName,
      notes: stepNotes,
      hands: this.hands,
      jump: this.jump,
      tap: this.tap,
      hold: this.hold,
      bomb: this.mines,
    };
    return chart;
  }

  private getChartDifficulty(stepNotes: Measure[]) {
    const lastTime = this.config.mapNotes.slice(-1)[0]?._time;
    if (!lastTime) {
      return 1;
    }
    const songLengthInMins = lastTime / +this.getBpm();
    // jump counts as 3 notes because it's energy consuming
    const noteCount = this.jump * 3 + this.hands * 4 + this.tap;
    const notesPerMin = noteCount / songLengthInMins;
    // 300 notes per min is 11
    return Math.round((Math.sqrt(notesPerMin) / Math.sqrt(300)) * 11) || 1;
  }

  private getBeatsPerMeasureForFraction(fraction: number) {
    for (const beatsPerMeasure of POSSIBLE_BEATS_PER_MEASURE) {
      const fractions = FRACTIONS[beatsPerMeasure];

      if (fractions.includes(fraction)) {
        return beatsPerMeasure;
      }
    }
    return POSSIBLE_BEATS_PER_MEASURE.slice(-1)[0];
  }

  private getNeariestFraction(fraction: number) {
    let min = 1;
    let neariestFraction = 0;
    for (const target of this._fractions) {
      const delta = Math.abs(target - fraction);
      if (delta < min) {
        min = delta;
        neariestFraction = target;
      }
    }
    return neariestFraction;
  }

  private getLeastCommonMultiple(a: number, b: number) {
    // Function to compute the greatest common divisor (GCD)
    function gcd(x: number, y: number): number {
      while (y !== 0) {
        const temp = y;
        y = x % y;
        x = temp;
      }
      return x;
    }

    // Calculate and return the LCM using the formula
    return Math.abs(a * b) / gcd(a, b);
  }

  private countNotes(notes: string[]) {
    const noteCount = notes.filter((note) => note === '1').length;
    const minesCount = notes.filter((note) => note === 'M').length;
    this.mines += minesCount;
    if (noteCount === 1) {
      this.tap += 1;
    } else if (noteCount === 2) {
      this.jump += 1;
      this.tap += 1;
    } else if (noteCount > 2) {
      this.hands += 1;
      this.jump += 1;
      this.tap += 1;
    }
  }

  private _previousTimeNotes: { note: string[] | undefined; time: number } = {
    note: undefined,
    time: -1,
  };

  private _previousFoot: 'left' | 'right' | undefined = undefined;

  private getLocationForNotes(
    previousPositions: number[],
    currentLocations: number[],
    beatGap: number,
  ): number[] {
    const {
      crossover,
      hands,
      minGapForCrossovers,
      minGapForDoubleTap,
      minGapForTapJumps,
      minGapForJumpTap,
      minGapForJumps,
    } = this.config;
    if (currentLocations.length === 1) {
      if (
        beatGap < DEFAULT_BEATS_PER_MEASURE / minGapForDoubleTap! &&
        previousPositions.join('') === currentLocations.join('')
      ) {
        currentLocations[0] = (currentLocations[0] + 1) % 4;
        return this.getLocationForNotes(
          previousPositions,
          currentLocations,
          beatGap,
        );
      } else if (
        beatGap < DEFAULT_BEATS_PER_MEASURE / minGapForJumpTap! &&
        previousPositions.length > 1
      ) {
        return [];
      } else if (
        crossover === 'false' ||
        beatGap < DEFAULT_BEATS_PER_MEASURE / minGapForCrossovers!
      ) {
        let currentFoot: 'left' | 'right' | undefined;
        if (currentLocations[0] === 0) {
          currentFoot = 'left';
        } else if (currentLocations[0] === 3) {
          currentFoot = 'right';
        }
        if (this._previousFoot && this._previousFoot === currentFoot) {
          currentLocations[0] = (currentLocations[0] + 1) % 4;
          return this.getLocationForNotes(
            previousPositions,
            currentLocations,
            beatGap,
          );
        }
      }
      // is double tap foot location unchanged
      if (previousPositions.join('') === currentLocations.join('')) {
        this._previousFoot = this._previousFoot;
      } else {
        if (currentLocations[0] === 0) {
          this._previousFoot = 'left';
        } else if (currentLocations[0] === 3) {
          this._previousFoot = 'right';
        } else {
          this._previousFoot = this._previousFoot === 'left' ? 'right' : 'left';
        }
      }
      return currentLocations;
    } else if (currentLocations.length >= 2) {
      if (hands === 'false') {
        currentLocations = currentLocations.slice(0, 2);
      }
      if (
        previousPositions.length > 1 &&
        beatGap < DEFAULT_BEATS_PER_MEASURE / minGapForJumps!
      ) {
        currentLocations = currentLocations.slice(0, 1);
        return this.getLocationForNotes(
          previousPositions,
          currentLocations,
          beatGap,
        );
      } else if (
        previousPositions.length === 1 &&
        beatGap < DEFAULT_BEATS_PER_MEASURE / minGapForTapJumps!
      ) {
        currentLocations = currentLocations.slice(0, 1);
        return this.getLocationForNotes(
          previousPositions,
          currentLocations,
          beatGap,
        );
      } else {
        return currentLocations;
      }
    }
    return currentLocations;
  }

  private buildNotes(currentTimeNotes: NoteV2[]) {
    let beatGap = Number.MAX_SAFE_INTEGER;
    if (this._previousTimeNotes.time > 0) {
      beatGap = currentTimeNotes[0]._time - this._previousTimeNotes.time;
    }
    const notes = ['0', '0', '0', '0'];
    let currentLocations: number[] = [];
    const notesIndexMap = currentTimeNotes
      .filter((note) => note._type !== 3)
      .reduce<{ [type: number]: number[] }>((acc, cur) => {
        const direction = cur._type;
        if (!acc[direction]) {
          acc[direction] = [cur._lineIndex];
        } else {
          if (acc[direction].includes(cur._lineIndex)) {
            const newIndex = (cur._lineIndex + 1) % 4;
            acc[direction].push(newIndex);
          } else {
            acc[direction].push(cur._lineIndex);
          }
        }
        return acc;
      }, {});
    if (Object.keys(notesIndexMap).length === 1) {
      currentLocations = Object.values(notesIndexMap)[0];
    } else {
      const handIndices = Object.values(notesIndexMap);
      const swingIndices = handIndices.filter((indices) => indices.length >= 2);
      if (this.config.jumpMode === 'swing') {
        currentLocations = Array.from(new Set(swingIndices.flat()).values());
        // treating two hands as one note here
        if (!currentLocations.length) {
          currentLocations = handIndices.flat().slice(0, 1);
        }
      } else if (this.config.jumpMode === 'both') {
        const twoHandIndices = Array.from(new Set(handIndices.flat()));
        if (twoHandIndices.length <= 1) {
          const newIndex = (twoHandIndices[0] + 1) % 4;
          twoHandIndices.push(newIndex);
        }
        currentLocations = twoHandIndices;
      } else if (this.config.jumpMode === 'twohands') {
        // treating swings as one note here
        const twoHandIndices = Array.from(
          new Set(
            handIndices.flatMap((indices) => indices.slice(0, 1)),
          ).values(),
        );
        if (twoHandIndices.length <= 1) {
          const newIndex = (twoHandIndices[0] + 1) % 4;
          twoHandIndices.push(newIndex);
        }
        currentLocations = twoHandIndices;
      }
    }
    const previousPositions: number[] = [];
    (this._previousTimeNotes.note || []).forEach((_note, index) => {
      if (_note === '1') {
        previousPositions.push(index);
      }
    });

    const locations = this.getLocationForNotes(
      previousPositions,
      currentLocations,
      beatGap,
    );
    if (locations.length > 1) {
      this._previousFoot = undefined;
    }

    for (const location of locations || []) {
      notes[location] = '1';
    }

    const bombs = currentTimeNotes.filter((note) => note._type === 3);
    this.mines += bombs.length;
    let bombCount = bombs.length;
    for (const bomb of bombs) {
      if (notes[bomb._lineIndex] !== '1') {
        notes[bomb._lineIndex] = 'M';
        bombCount--;
      }
    }

    if (bombCount) {
      for (let i = 0; i < 4; i++) {
        if (notes[i] !== '0' && bombCount) {
          notes[i] = 'M';
          bombCount--;
        }
      }
    }

    this.countNotes(notes);
    return notes;
  }

  private buildStepNotesForMeasure(
    beatsPerMeasure: number,
    mapNotes: NoteV2[],
    index: number,
  ) {
    const fractions = FRACTIONS[beatsPerMeasure];
    let fractionIndex = 1;
    let start = index * DEFAULT_BEATS_PER_MEASURE;
    const measure: Measure = [];
    while (start < (index + 1) * DEFAULT_BEATS_PER_MEASURE) {
      const possibleNotes = mapNotes.filter((note) => note._time === start);
      if (possibleNotes.length) {
        const note = this.buildNotes(possibleNotes);
        measure.push(note);
        if (note.find((n) => n === '1')) {
          this._previousTimeNotes = { note, time: start };
        }
      } else {
        measure.push(['0', '0', '0', '0']);
      }
      try {
        start = Math.floor(start) + fractions[fractionIndex];
      } catch (e) {
        console.error(e, FRACTIONS, beatsPerMeasure);
      }

      if (fractionIndex >= fractions.length - 1) {
        fractionIndex = 1;
      } else {
        fractionIndex += 1;
      }
    }
    return measure;
  }

  private buildV2StepNotes(notes: NoteV2[]) {
    const stepMeasures: Measure[] = [];
    let numberOfMeasures = 0;
    const notesByMeasure = notes.reduce(
      (
        acc: {
          [measure: number]: { notes: NoteV2[]; beatsPerMeasure?: number };
        },
        cur: NoteV2,
      ) => {
        const integer = Math.floor(cur._time);
        const fraction = +(cur._time - integer).toFixed(3);
        if (!this._fractions.includes(fraction)) {
          const neariestFraction = this.getNeariestFraction(fraction);
          cur._time = Math.floor(cur._time) + neariestFraction;
        }
        const measureIndex = Math.floor(cur._time / DEFAULT_BEATS_PER_MEASURE);
        numberOfMeasures = Math.max(measureIndex + 1, numberOfMeasures);
        if (acc[measureIndex]?.notes) {
          acc[measureIndex].notes.push(cur);
        } else {
          acc[measureIndex] = {
            notes: [cur],
          };
        }
        return acc;
      },
      {},
    );

    for (const byMeasure of Object.values(notesByMeasure)) {
      let beatsPerMeasure = DEFAULT_BEATS_PER_MEASURE;
      for (const note of byMeasure.notes || []) {
        const integer = Math.floor(note._time);
        const fraction = +(note._time - integer).toFixed(3);
        const beatsPerMeasureForFraction =
          this.getBeatsPerMeasureForFraction(fraction);
        beatsPerMeasure = this.getLeastCommonMultiple(
          beatsPerMeasure,
          beatsPerMeasureForFraction,
        );
      }
      byMeasure.beatsPerMeasure = beatsPerMeasure;
    }

    for (let i = 0; i < numberOfMeasures; i++) {
      if (!notesByMeasure[i]) {
        stepMeasures[i] = new Array(DEFAULT_BEATS_PER_MEASURE)
          .fill('')
          .map(() => new Array(4).fill(0));
      } else {
        const currentMeasure = notesByMeasure[i];
        const beatsPerMeasure =
          currentMeasure.beatsPerMeasure || DEFAULT_BEATS_PER_MEASURE;
        const mapNotes = currentMeasure.notes;
        stepMeasures[i] = this.buildStepNotesForMeasure(
          beatsPerMeasure,
          mapNotes,
          i,
        );
      }
    }

    return stepMeasures;
  }
}
