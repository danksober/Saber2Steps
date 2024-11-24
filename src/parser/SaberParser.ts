import { MapDataV3, MapDataV2, MapInfoDataV2 } from '../types/mapTypes';
import { StepChart } from '../types/stepTypes';
import { StepBuilder } from './StepBuilder';
import { ConfigurationFormState } from '../form/configurationForm';
import { readFileSync } from '../constants/fileReader';

export const useParseSaber = () => {
  const parse = async (formState: ConfigurationFormState) => {
    const saberParser = new SaberParser(
      formState.infoFile,
      formState.chartFiles,
    );
    await saberParser.init();
    const stepFile = saberParser.toStepFile();
    stepFile.background = formState.backgroundFile?.name;
    stepFile.music = formState.musicFile.name;
    return stepFile;
  };
  return parse;
};

export class SaberParser {
  infoFile: File;
  mapFiles: File[];

  private infoData: MapInfoDataV2 | undefined = undefined;
  private chartData:
    | ((MapDataV3 | MapDataV2) & { name: string })[]
    | undefined = undefined;

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
        };
      }),
    )) as any;
  }

  toStepFile() {
    if (!this.infoData || !this.chartData) {
      throw new Error('No data');
    }
    const charts = this.chartData.map(({ data, name }: any) => {
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
    const v2Data: MapDataV2 = {
      _notes: data.colorNotes.map((note) => ({
        _cutDirection: note.c,
        _lineIndex: note.x,
        _lineLayer: note.y,
        _type: note.a,
        _time: note.b,
      })),
      _obstacles: [],
      _version: '2',
    };
    return this.getStepBuilder(v2Data, name);
  }

  private processMapDataV2(data: MapDataV2, name: string) {
    return this.getStepBuilder(data, name);
  }
}


