import { Chart, StepChart } from '../types/stepTypes';

export class StepOutputBuilder {
  stepChart: StepChart;
  constructor(stepChart: StepChart) {
    this.stepChart = stepChart;
  }

  copySMContent() {
    console.log(
      this.buildSongInfo() +
        '\n' +
        this.buildChartInfo(this.stepChart.charts[0]),
    );
    navigator.clipboard.writeText(
      this.buildSongInfo() +
        '\n' +
        this.buildChartInfo(this.stepChart.charts[0]),
    );
    return (
      this.buildSongInfo() +
      '\n' +
      this.buildChartInfo(this.stepChart.charts[0])
    );
  }

  private toDecimals(num: string, trailingZeros: number) {
    const float = parseFloat(num);
    return float.toFixed(trailingZeros);
  }

  private buildChartInfo(chart: Chart) {
    const start = `
#NOTES:
//---------------${chart.type} - ----------------
     ${chart.type}:
     :
     Challenge:
     ${chart.meter}:
     0,0,0,0,0:
`;
    const measures = chart.notes;
    const notesString = measures.map((measure) => {
      const note = measure.map((notes) => notes.join(''));
      return note.join('\n');
    });
    return start + notesString.join('\n,\n') + '\n;';
  }

  private buildSongInfo() {
    const {
      title,
      subtitle,
      artist,
      genre,
      credit,
      banner,
      background,
      music,
      offset,
      sampleStart,
      sampleLength,
      bpms,
    } = this.stepChart;

    return `
#TITLE:${title};
#SUBTITLE:${subtitle || ''};
#ARTIST:${artist || ''};
#TITLETRANSLIT:;
#SUBTITLETRANSLIT:;
#ARTISTTRANSLIT:;
#GENRE:${genre || ''};
#CREDIT:${credit || ''};
#BANNER:${banner || ''};
#BACKGROUND:${background || ''};
#LYRICSPATH:;
#CDTITLE:;
#MUSIC:${music || ''};
#OFFSET:${this.toDecimals(offset || '0', 6)};
#SAMPLESTART:${this.toDecimals(sampleStart || '0', 6)};
#SAMPLELENGTH:${this.toDecimals(sampleLength || '10', 6)};
#SELECTABLE:YES;
#BPMS:0.000000=${this.toDecimals(bpms, 6)};
#STOPS:;
#BGCHANGES:;
#FGCHANGES:;
#KEYSOUNDS:;
#ATTACKS:;
        `;
  }
}
