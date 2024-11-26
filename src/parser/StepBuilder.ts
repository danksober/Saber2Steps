import { NoteV2 } from '../types/mapTypes';
import { Chart, Measure, StepChart } from '../types/stepTypes';

type StepBuilderConfig = Omit<StepChart, 'charts'> & {
  mapNotes: NoteV2[];
  difficultyName: string;
  meter: string;
};

const DEFAULT_BEATS_PER_MEASURE = 4;
const MAX_BEATS_PER_MEASURE = 32;

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

  private mapToChart(notes: NoteV2[]) {
    const stepNotes = this.buildV2StepNotes(notes);
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
    const notes = stepNotes.flat();
    const lastTime = this.config.mapNotes.slice(-1)[0]?._time;
    if (!lastTime) {
      return 1;
    }
    const songLengthInMins = lastTime / +this.getBpm();
    // jump counts as 3 notes because it's energy consuming
    const noteCount = this.jump * 3 + this.hands * 4 + this.tap;
    const notesPerMin = noteCount / songLengthInMins;
    // 300 notes per min is 10
    return Math.round((notesPerMin / 300) * 10) || 1;
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
        const notes = [];
        for (let i = 0; i < 4; i++) {
          const possibleNote = possibleNotes.find(
            (note) => note._lineIndex === i,
          );
          if (possibleNote) {
            if (possibleNote._type === 3) {
              this.mines += 1;
            }
            const note = possibleNote._type !== 3 ? '1' : 'M';
            notes.push(note);
          } else {
            notes.push('0');
          }
        }
        const noteCount = notes.filter((note) => note === '1').length;
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
        measure.push(notes);
      } else {
        measure.push(['0', '0', '0', '0']);
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
        const integer = Math.floor(cur._time);
        const fraction = cur._time - integer;
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
        const fraction = note._time - integer;

        beatsPerMeasure = Math.max(
          beatsPerMeasure,
          this.getBeatsPerMeasureForFraction(fraction),
        );
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
