import { ConfigurationFormState } from "../form/configurationForm";
import JSZip from "jszip";
import { convertToFile } from "./fileReader";
import { MapInfoDataV2 } from "../types/mapTypes";

const INFO_FILE_NAME = 'Info.dat';

export const getMapInfo = async (mapId: string): Promise<ConfigurationFormState> => {
    const mapInfo = await fetch(`https://api.beatsaver.com/maps/id/${mapId}`).then(res => res.json());
    console.log(mapInfo)
    const downloadLink = mapInfo.versions.find((v: any) => v.state === 'Published')?.downloadURL;
    if (!downloadLink) {
        throw 'Not a valid URL';
    }
    const buffer = await fetch(downloadLink).then(res => res.arrayBuffer())
    const {files} = await JSZip.loadAsync(buffer);
    const infoZip = files[INFO_FILE_NAME];
    if (!files[INFO_FILE_NAME]) {
        throw 'No info file found in the link';
    }
    const infoContent: MapInfoDataV2 = JSON.parse(await infoZip.async('text'));
    console.log(files);
    infoZip.async('blob')
    console.log(infoContent);
    const infoFile = await convertToFile(infoZip);
    const musicFile = await convertToFile(files[infoContent._songFilename]);
    const backgroundFile = await convertToFile(files[infoContent._coverImageFilename]);
    return {
        musicFile: musicFile!,
        infoFile: infoFile!,
        chartFiles: [],
        backgroundFile,
    };
};