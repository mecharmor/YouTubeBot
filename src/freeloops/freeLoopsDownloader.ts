import fs from 'fs';
import {
    default as axios,
    AxiosPromise,
    AxiosResponse,
    AxiosRequestConfig,
} from 'axios';
import { constructDownloadUrl } from './freeLoopsConsts.js';
import { FreeLoopsProps } from './freeLoopsModel.js';
import { extname } from 'path';
import { Stream } from 'stream';
import GetAudioDuration from 'get-audio-duration';
import { ensurePathEndsWithSlash } from '../helper/path.js';
const { getAudioDurationInSeconds } = GetAudioDuration;
import ProgressBar from 'progress';
import { AudioSample } from '../model.js';

export function downloadFromFreeLoops(
    id: string,
    overrideConfig?: Partial<AxiosRequestConfig>
): AxiosPromise<Stream> {
    return axios({
        method: 'GET',
        url: constructDownloadUrl(id),
        responseType: 'stream',
        ...overrideConfig,
    });
}

export interface FreeLoopsAudio extends AudioSample {
    // readonly fullPath : string;
    // readonly fileName : string;
    readonly fileStats: fs.Stats;
    // readonly durationSec : number;
}

export interface FreeLoopsError {
    readonly message: string;
}

export async function DownloadFreeLoopsVideo({
    path,
    props: { title, id },
}: {
    readonly path: string;
    readonly props: FreeLoopsProps;
}): Promise<FreeLoopsAudio | FreeLoopsError> {
    path = ensurePathEndsWithSlash(path);
    if (!fs.statSync(path).isDirectory()) {
        return Promise.reject(`${path} is not a directory`);
    }

    const { data, headers }: AxiosResponse<Stream> =
        await downloadFromFreeLoops(id);
    const progBar = new ProgressBar(`Downloading [:bar] :percent`, {
        width: 40,
        complete: '=',
        incomplete: ' ',
        total: parseInt(headers['content-length']),
    });

    const fileName = `${title}.${extname(title) || 'mp3'}`;
    const fullPath = `${path}${fileName}`;
    data.pipe(fs.createWriteStream(fullPath));

    let downloadedFile: Omit<FreeLoopsAudio, 'durationSec'>;
    try {
        downloadedFile = (await new Promise((resolve, reject) => {
            data.on('data', ({ length }: any) => progBar.tick(length));
            data.on('end', () =>
                resolve({
                    fullPath,
                    fileName,
                    fileStats: fs.statSync(fullPath),
                })
            );
            data.on('error', (e: any) =>
                reject({
                    message: e || `Failed to stream into file for ${fullPath}`,
                })
            );
        })) as Omit<FreeLoopsAudio, 'durationSec'>;
    } catch (err: any) {
        return Promise.reject(err as FreeLoopsError);
    }

    return getAudioDurationInSeconds(downloadedFile.fullPath).then(
        (durationSec: number) =>
            Object.assign(downloadedFile, { durationSec } as Pick<
                FreeLoopsAudio,
                'durationSec'
            >)
    ) as Promise<FreeLoopsAudio>;
}
