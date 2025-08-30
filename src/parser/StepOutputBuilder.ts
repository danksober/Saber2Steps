import * as JSZip from 'jszip';
import type { Chart, StepChart } from '../types/stepTypes';

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
    const chartInfo = this.stepChart.charts.map(this.buildChartInfo).join('\n');
    return `${this.buildSongInfo()}\n${chartInfo}`;
  }

  downloadZip() {
    const zip = new JSZip();
    const folder = zip.folder(this.stepChart.title)!;
    folder.file(`${this.stepChart.title}.sm`, this.getSongFileContent());
    const { music, background, banner } = this.stepFiles;
    folder.file(music.name.replace('egg', 'ogg'), music);
    if (background) {
      folder.file(background.name, background);
    }
    if (banner) {
      folder.file(banner.name, banner);
    }
    zip.generateAsync({ type: 'blob' }).then((content) => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `${this.stepChart.title}.zip`; // Set the name of the ZIP file
      link.click();
    });
  }

  private getSongFileContent() {
    const chartInfo = this.stepChart.charts.map(this.buildChartInfo).join('\n');
    return `${this.buildSongInfo()}\n${chartInfo}`;
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
     ${chart.name.split('_')[0]}:
     ${chart.meter}:
     0,0,0,0,0:
`;
    const measures = chart.notes;
    const notesString = measures.map((measure) => {
      const note = measure.map((notes) => notes.join(''));
      return note.join('\n');
    });
    return `${start + notesString.join('\n,\n')}\n;`;
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
      outputOffset,
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
#MUSIC:${(music || '').replace('egg', 'ogg')};
#OFFSET:${this.toDecimals(outputOffset || '0', 6)};
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
