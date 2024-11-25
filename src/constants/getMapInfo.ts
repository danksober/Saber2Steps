import { ConfigurationFormState } from '../form/configurationForm';
import JSZip from 'jszip';
import { convertToFile } from './fileReader';
import { MapInfoDataV2 } from '../types/mapTypes';

const INFO_FILE_NAME = 'Info.dat';
const INFO_FILE_NAME2 = 'info.dat';

export const getMapInfo = async (
  mapId: string,
): Promise<ConfigurationFormState> => {
  const mapInfo = await fetch(
    `https://api.beatsaver.com/maps/id/${mapId}`,
  ).then((res) => res.json());
  console.log(mapInfo);
  if (mapInfo.errors) {
    throw new Error(mapInfo.errors[0]);
  }
  const downloadLink = mapInfo.versions.find(
    (v: any) => v.state === 'Published',
  )?.downloadURL;
  if (!downloadLink) {
    throw new Error('Not a valid URL');
  }
  const buffer = await fetch(downloadLink).then((res) => res.arrayBuffer());
  const { files } = await JSZip.loadAsync(buffer);
  const infoZip = files[INFO_FILE_NAME] || files[INFO_FILE_NAME2];
  if (!infoZip) {
    throw new Error('No info file found in the link');
  }
  const infoContent: MapInfoDataV2 = JSON.parse(await infoZip.async('text'));
  console.log(files);
  console.log(infoContent);
  const infoFile = await convertToFile(infoZip);
  const musicFile = await convertToFile(files[infoContent._songFilename]);
  const backgroundFile = await convertToFile(
    files[infoContent._coverImageFilename],
  );
  const chartFileNames = infoContent._difficultyBeatmapSets.reduce<string[]>(
    (acc, cur) => {
      const fileNames = cur._difficultyBeatmaps.map(
        (beatMap) => beatMap._beatmapFilename,
      );
      acc.push(...fileNames);
      return acc;
    },
    [],
  );
  const chartFiles = await Promise.all(
    chartFileNames.map((fileName) => convertToFile(files[fileName])),
  );
  return {
    musicFile: musicFile!,
    infoFile: infoFile!,
    chartFiles: chartFiles.filter((file) => !!file),
    backgroundFile,
  };
};
