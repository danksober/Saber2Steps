import { useAtom, useAtomValue } from 'jotai';
import { MapDataV3, MapDataV2, MapInfoDataV2 } from '../types/mapTypes';
import { StepChart } from '../types/stepTypes';
import {
  musicFileAtom,
  backgroundFileAtom,
  infoFileAtom,
  chartFilesAtom,
} from '../home/formState';
import { StepBuilder } from './StepBuilder';

export const useParseSaber = () => {
  const musicFile = useAtomValue(musicFileAtom);
  const backgroundFile = useAtomValue(backgroundFileAtom);
  const infoFile = useAtomValue(infoFileAtom);
  const mapFiles = useAtomValue(chartFilesAtom);
  const parse = async () => {
    const saberParser = new SaberParser(infoFile[0], mapFiles);
    await saberParser.init();
    return saberParser.toStepFiles();
  };
  return parse;
};

export class SaberParser {
  infoFile: File;
  mapFiles: File[];

  private infoData: MapInfoDataV2 | undefined = undefined;
  private chartData: ((MapDataV3 | MapDataV2) & {name: string})[] | undefined = undefined;

  constructor(infoFile: File, mapFiles: File[]) {
    this.infoFile = infoFile;
    this.mapFiles = mapFiles;
  }

  async init() {
    this.infoData = await readFileSync<MapInfoDataV2>(this.infoFile);
    this.chartData = (await Promise.all(
      this.mapFiles.map(async (file) => {
        const data: any = await readFileSync(file);
        return {
          data,
          name: file.name,
        }
      }),
    )) as any;
  }

  toStepFiles() {
    if (!this.infoData || !this.chartData) {
      throw new Error('No data');
    }
    const charts = this.chartData.map(({data, name}: any) => {
      return this.parseMapFile(data, name);
    });
    const stepChart: StepChart = { ...this.getStepChartConfig(), charts };
    return stepChart;
  }

  private isV3Map(data: MapDataV2 | MapDataV3): data is MapDataV3 {
    return parseFloat((data as any).version || '0') >= 3;
  }

  private parseMapFile(data: MapDataV2 | MapDataV3, name: string) {
    if (this.isV3Map(data)) {
      return this.processMapDataV3(data, name);
    } else {
      return this.processMapDataV2(data, name);
    }
  }

  private getStepChartConfig() {
    if (!this.infoData || !this.chartData) {
      throw new Error('No data');
    }
    return {
      title: this.infoData?._songName,
      subtitle: this.infoData?._songSubName,
      artist: this.infoData?._songAuthorName,
      credit: this.infoData?._levelAuthorName,
      sampleStart: (this.infoData?._previewStartTime || '').toString(),
      sampleLength: (this.infoData?._previewDuration || '').toString(),
      offset: this.infoData?._songTimeOffset
        ? this.infoData._songTimeOffset.toString()
        : '0',
      bpms: this.infoData._beatsPerMinute.toString(),
    };
  }

  private getStepBuilder(data: any, name: string) {
    if (!this.infoData || !this.chartData) {
      throw new Error('No data');
    }

    const stepBuilder = new StepBuilder({
      ...this.getStepChartConfig(),
      mapNotes: data.colorNotes || data._notes,
      difficultyName: name,
      meter: '10',
    });
    return stepBuilder.build();
  }

  private processMapDataV3(data: MapDataV3, name: string) {
    return this.getStepBuilder(data, name);
  }

  private processMapDataV2(data: MapDataV2, name: string) {
    return this.getStepBuilder(data, name);
  }
}

function readFileSync<T>(file: File): Promise<T> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    // This function will be called once the file has been read
    reader.onload = () => {
      resolve(JSON.parse(reader.result as string) as T); // Return the file content
    };

    // In case of error, reject the promise
    reader.onerror = (error) => {
      reject(error);
    };

    // Start reading the file as text (can also be read as Data URL, Binary String, etc.)
    reader.readAsText(file);
  });
}
