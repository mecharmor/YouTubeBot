import { FreeLoopsAudio } from '../freeloops/freeLoopsDownloader.js';
import { removeExtensionIfExists } from './path.js';

export function toTitleText(
    time: number,
    timeType: string,
    addSuffix?: string
) {
    if (time <= 0) {
        return '';
    }

    return `${time} ${timeType}${
        time === 1 ? '' + addSuffix : 's' + addSuffix
    }`;
}

export interface MediaTitle extends Pick<FreeLoopsAudio, 'fileName'> {
    readonly hours: number;
    readonly minutes: number;
    readonly seconds: number;
}
export function makeTitle({ hours, minutes, seconds, fileName }: MediaTitle) {
    return `\
    ${toTitleText(hours, 'hour', ' ')}\
    ${toTitleText(minutes, 'minute', ' ')}\
    ${toTitleText(seconds, 'second', ' ')}\
    of ${removeExtensionIfExists(fileName)} sounds`;
}
