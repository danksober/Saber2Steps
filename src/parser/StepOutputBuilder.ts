import { Chart, StepChart } from '../types/stepTypes';
import * as JSZip from 'jszip';

interface StepFiles {
  background?: File;
  music: File;
  banner?: File;
}

export class StepOutputBuilder {
  stepChart: StepChart;
  stepFiles: StepFiles;
  constructor(stepChart: StepChart, files: StepFiles) {
    this.stepChart = stepChart;
    this.stepFiles = files;
  }

  copySMContent() {
    return (
      this.buildSongInfo() +
      '\n' +
      this.buildChartInfo(this.stepChart.charts[0])
    );
  }

  

  downloadZip() {
    const zip = new JSZip();
    zip.file(`${this.stepChart.title}.sm`, this.getSongFileContent());
    const {music, background, banner} = this.stepFiles;
    zip.file(music.name, music);
    if (background) {
      zip.file(background.name, background);
    }
    if (banner) {
      zip.file(banner.name, banner);
    }
    zip.generateAsync({type: 'blob'}).then((content) => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `${this.stepChart.title}.zip`;  // Set the name of the ZIP file
      link.click();
    });
  }


  private getSongFileContent() {
    return this.buildSongInfo() +
        '\n' +
        this.buildChartInfo(this.stepChart.charts[0]);
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
