import fs from 'fs';
import axios, {
    AxiosPromise,
    AxiosResponse,
    AxiosRequestConfig,
} from 'axios';
import { constructDownloadUrl, isTitleBlacklisted, KnownWorkingTerms } from './freeLoopsConsts.js';
import { FreeLoopsProps } from './freeLoopsModel.js';
import { extname } from 'path';
import { Stream } from 'stream';
import GetAudioDuration from 'get-audio-duration';
import { ensurePathEndsWithSlash } from '../helper/path.js';
const { getAudioDurationInSeconds } = GetAudioDuration;
import { AudioSample } from '../model.js';
import { pickRandomElem } from '../helper/random.js';
import { resolve } from 'path';
import {
    getAudioUrls,
    getMaxPageCountForSearchTerm,
} from './freeLoopsParser.js';
import { isDebugging, shouldUseMockAudio } from '../helper/env.js';
import https from 'https';

export function downloadFromFreeLoops(
    id: string,
    overrideConfig?: Partial<AxiosRequestConfig>
): AxiosPromise<Stream> {
    const httpsAgent = new https.Agent({
        rejectUnauthorized: false
    });

    return axios.default({
        method: 'GET',
        url: constructDownloadUrl(id),
        responseType: 'stream',
        httpsAgent,
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

export async function FindRandomSample(
    recurseCount = 0,
    maxRecurse = 4
): Promise<FreeLoopsProps> {
    if(shouldUseMockAudio()) {
        return Promise.resolve({
            // all of these props get skipped due to flag
            id: '',
            title: 'live bass guitar sound effect'
        })
    }
    const randomTerm: string = pickRandomElem(KnownWorkingTerms);
    const maxPageCount: number = await getMaxPageCountForSearchTerm(randomTerm);
    if (recurseCount >= maxRecurse) {
        throw new Error('Failed to find a term successfully');
    }

    if (maxPageCount === 0 && recurseCount < maxRecurse) {
        isDebugging() &&
            console.warn(
                `FindRandomSample recursing and failed on term ${randomTerm} that has 0 pages`
            );
        return FindRandomSample(recurseCount + 1, maxRecurse);
    }

    const randomPage: number = Math.max(Math.floor(Math.random() * maxPageCount), 1);
    isDebugging() && console.log("Using page ", randomPage)

    const records: FreeLoopsProps[] = await getAudioUrls(
        randomTerm,
        randomPage
    ).then(records => records.filter(record => !isTitleBlacklisted(record.title)));
    if (records.length === 0) {
        // sometimes scraping records returns empty or all are blacklisted so we should retry
        isDebugging() &&
            console.warn(
                'FindRandomSample, the term and page we picked returned zero records (possibly all blacklisted)'
            );
        return FindRandomSample(recurseCount + 1, maxRecurse);
    }

    return pickRandomElem(records);
}

export async function DownloadFreeLoopsAudio({
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

    if(shouldUseMockAudio()) {
        const fileName = 'mock.mp3';
        const fullPath = `${path}${fileName}`
        console.warn("Using Mock Audio Sample at", fullPath)
        fs.copyFileSync(resolve(process.cwd(), './mock/mock.mp3'), fullPath);
        return getAudioDurationInSeconds(fullPath).then(durationSec => ({
            durationSec,
            fullPath,
            fileName,
            fileStats: fs.statSync(fullPath),
        }))
    }

    let downloadedBytes = 0;
    const startTime = Date.now();

    const fileName = `${title}.${extname(title) || 'mp3'}`;
    const fullPath = `${path}${fileName}`;

    const { data }: AxiosResponse<Stream> = await downloadFromFreeLoops(id);
    data.pipe(fs.createWriteStream(fullPath));

    let downloadedFile: Omit<FreeLoopsAudio, 'durationSec'>;
    try {
        downloadedFile = (await new Promise((resolve, reject) => {
            data.on('data', (chunk: Buffer) => {
                downloadedBytes += chunk.length;
                const elapsed = (Date.now() - startTime) / 1000;
                const speed = downloadedBytes / elapsed;
                const speedKB = (speed / 1024).toFixed(1);
                const sizeKB = (downloadedBytes / 1024).toFixed(1);
                
                // Clear the line and show progress
                console.log(`Downloading... ${sizeKB} KB (${speedKB} KB/s)`);
            });
            data.on('end', () => {
                const elapsed = (Date.now() - startTime) / 1000;
                const totalKB = (downloadedBytes / 1024).toFixed(1);
                console.log(`\nDownload complete: ${totalKB} KB in ${elapsed.toFixed(1)}s`);
                resolve({
                    fullPath,
                    fileName,
                    fileStats: fs.statSync(fullPath),
                });
            });
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
