import { ColorNote, NoteV2 } from '../types/mapTypes';
import { Chart, Measure, StepChart } from '../types/stepTypes';

type StepBuilderConfig = Omit<StepChart, 'charts'> & {
  mapNotes: ColorNote[] | NoteV2[];
  difficultyName: string;
  meter: string;
};

const DEFAULT_BEATS_PER_MEASURE = 4;
const MAX_BEATS_PER_MEASURE = 16;

export class StepBuilder {
  config: StepBuilderConfig;
  private _fractions: number[] = [];
  constructor(StepConfig: StepBuilderConfig) {
    this.config = StepConfig;
    this.generateFractions();
  }

  private generateFractions() {
    let res = 0;
    while (res <= 1) {
      this._fractions.push(res);
      res += (1 / MAX_BEATS_PER_MEASURE) * 4;
    }
  }

  build(): Chart {
    const chart = this.mapToChart(this.config.mapNotes);
    return chart;
  }

  getBpm() {
    return this.config.bpms;
  }

  private isV2MapNotes(notes: ColorNote[] | NoteV2[]): notes is NoteV2[] {
    return '_time' in notes[0];
  }

  private mapToChart(notes: ColorNote[] | NoteV2[]) {
    const chart: Chart = {
      type: 'dance-single',
      meter: this.config.meter,
      name: this.config.difficultyName,
      notes: [],
    };
    if (this.isV2MapNotes(notes)) {
      const stepNotes = this.buildV2StepNotes(notes);
      chart.notes = stepNotes;
    } else {
    }
    return chart;
  }

  private getBeatsPerMeasureForFraction(fraction: number) {
    let beatsPerMeasure = 4;
    while (fraction !== Math.floor(fraction)) {
      fraction *= 2;
      beatsPerMeasure *= 2;
    }
    return beatsPerMeasure;
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

  private buildStepNotesForMeasure(
    beatsPerMeasure: number,
    mapNotes: NoteV2[],
    index: number,
  ) {
    const fraction = DEFAULT_BEATS_PER_MEASURE / beatsPerMeasure;
    let start = index * DEFAULT_BEATS_PER_MEASURE;
    const measure: Measure = [];
    while (start < (index + 1) * DEFAULT_BEATS_PER_MEASURE) {
      const possibleNotes = mapNotes.filter((note) => note._time === start);
      if (possibleNotes.length) {
        const randomPosition = possibleNotes[0]._lineIndex;
        const notes = [];
        for (let i = 0; i < 4; i++) {
          if (i === randomPosition) {
            notes.push(1);
          } else {
            notes.push(0);
          }
        }
        measure.push(notes);
      } else {
        measure.push([0, 0, 0, 0]);
      }
      start += fraction;
    }
    return measure;
  }

  private buildV2StepNotes(notes: NoteV2[]) {
    const stepMeasures: Measure[] = [];
    let numberOfMeasures = 0;
    let notesByMeasure = notes.reduce(
      (
        acc: {
          [measure: number]: { notes: NoteV2[]; beatsPerMeasure?: number };
        },
        cur: NoteV2,
      ) => {
        const measureIndex = Math.floor(cur._time / DEFAULT_BEATS_PER_MEASURE);
        numberOfMeasures = Math.max(measureIndex, numberOfMeasures);
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
        const fraction = note._time - integer;
        if (!this._fractions.includes(fraction)) {
          const neariestFraction = this.getNeariestFraction(fraction);
          note._time = Math.floor(note._time) + neariestFraction;
          beatsPerMeasure = MAX_BEATS_PER_MEASURE;
        } else {
          beatsPerMeasure = Math.max(
            beatsPerMeasure,
            this.getBeatsPerMeasureForFraction(fraction),
          );
        }
      }
      byMeasure.beatsPerMeasure = beatsPerMeasure;
    }

    console.log(notesByMeasure);

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

    console.log(stepMeasures);

    return stepMeasures;
  }
}
