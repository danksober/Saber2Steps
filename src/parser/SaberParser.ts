import { readFileSync } from '../constants/fileReader';
import type {
  SaberConfigurationFormState,
  StepConfigurationFormState,
} from '../form/configurationForm';
import type { MapDataV2, MapDataV3, MapInfoDataV2 } from '../types/mapTypes';
import type { StepChart } from '../types/stepTypes';
import { ITG_OFFSET } from '../wizard-flow/constants/offset';
import { StepBuilder } from './StepBuilder';

const ITG_LEVEL_MAP = ['Challenge', 'Hard', 'Medium', 'Easy', 'Beginner'];

export const useParseSaber = () => {
  const parse = async (
    saberFormState: SaberConfigurationFormState,
    stepFormState: StepConfigurationFormState,
  ) => {
    const saberParser = new SaberParser(
      saberFormState.infoFile,
      saberFormState.chartFiles,
      stepFormState,
    );
    await saberParser.init();
    const stepFile = saberParser.toStepFile();
    stepFile.background = saberFormState.backgroundFile?.name;
    stepFile.music = saberFormState.musicFile.name;
    stepFile.outputOffset = (
      Number(stepFile.offset || '0') +
      stepFormState.additionalOffset +
      ITG_OFFSET
    ).toString();

    return stepFile;
  };
  return parse;
};

export class SaberParser {
  infoFile: File;
  mapFiles: File[];

  private infoData: MapInfoDataV2 | undefined = undefined;
  private stepConfig: StepConfigurationFormState;
  private chartData:
    | ((MapDataV3 | MapDataV2) & { name: string })[]
    | undefined = undefined;

  constructor(
    infoFile: File,
    mapFiles: File[],
    stepConfig: StepConfigurationFormState,
  ) {
    this.infoFile = infoFile;
    this.mapFiles = mapFiles;
    this.stepConfig = stepConfig;
  }

  async init() {
    this.infoData = await readFileSync<MapInfoDataV2>(this.infoFile);
    this.chartData = (await Promise.all(
      this.mapFiles.map(async (file) => {
        const data: any = await readFileSync(file);
        return data;
      }),
    )) as any;
  }

  toStepFile() {
    if (!this.infoData || !this.chartData) {
      throw new Error('No data');
    }
    let parsedData = this.chartData.map((data) => {
      if (this.isV3Map(data)) {
        return this.parseMapDataV3(data);
      } else {
        return data;
      }
    });
    parsedData = this.sortChartData(parsedData);
    const difficultyNames = this.getChartDifficultyNames(parsedData);
    const stepCharts = parsedData.map((data, index) => {
      return this.buildSteps(data, difficultyNames[index]);
    });
    const stepChart: StepChart = {
      ...this.getStepChartConfig(),
      charts: stepCharts,
    };
    return stepChart;
  }

  private isV3Map(data: MapDataV2 | MapDataV3): data is MapDataV3 {
    return parseFloat((data as any).version || '0') >= 3;
  }

  private sortChartData(chartData: MapDataV2[]) {
    return chartData
      .sort((a, b) => b._notes.length - a._notes.length)
      .slice(0, ITG_LEVEL_MAP.length * 2);
  }

  private getChartDifficultyNames(chartData: MapDataV2[]) {
    const length = chartData.length;
    const res = ITG_LEVEL_MAP.slice();
    const remains = length - ITG_LEVEL_MAP.length;
    let index = 0;
    while (index < remains) {
      res.splice(index * 2, 0, `${ITG_LEVEL_MAP[index]}_Edit`);
      index++;
    }
    return res;
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

  private buildSteps(data: MapDataV2, name: string) {
    if (!this.infoData || !this.chartData) {
      throw new Error('No data');
    }

    const stepBuilder = new StepBuilder({
      ...this.getStepChartConfig(),
      ...this.stepConfig,
      mapNotes: data._notes,
      difficultyName: name,
    });
    return {
      ...stepBuilder.build(),
      mapData: data,
      stepConfig: this.stepConfig,
    };
  }

  private parseMapDataV3(data: MapDataV3) {
    const v2Data: MapDataV2 = {
      _notes: data.colorNotes.map((note) => ({
        _cutDirection: note.a,
        _lineIndex: note.x,
        _lineLayer: note.y,
        _type: note.c,
        _time: note.b,
      })),
      _obstacles: [],
      _version: '2',
    };
    return v2Data;
  }
}
