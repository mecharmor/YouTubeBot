// https://www.pexels.com/api/documentation/?language=javascript

import fs from 'fs';
import {
    default as pexels,
    PhotosWithTotalResults,
    Photo,
    ErrorResponse,
} from 'pexels';
const { createClient } = pexels;
import { resolve } from 'path';
import { default as axios, AxiosResponse } from 'axios';
import { Stream } from 'stream';
import { ensurePathEndsWithSlash } from './path.js';

export function FetchImageWithSearch(
    searchText: string
): Promise<Photo | ErrorResponse> {
    const client = createClient(process.env.PEXEL_API_KEY);

    return client.photos
        .search({
            query: searchText,
            per_page: 1,
            size: 'medium',
            orientation: 'landscape',
        })
        .then((photos: PhotosWithTotalResults) => {
            if (photos.photos.length === 0) {
                return client.photos.random();
            }

            return photos.photos[0];
        });
}

export async function DownloadImageFromSearch(
    searchText: string,
    outputPath: string,
    fileName = 'image.jpeg'
) {
    outputPath = ensurePathEndsWithSlash(resolve(outputPath));
    if (!fs.existsSync(outputPath)) {
        throw new Error(`Invalid path ${outputPath}`);
    }

    const photo: Photo | ErrorResponse = await FetchImageWithSearch(searchText);
    if ('error' in photo) {
        // Handle ErrorResponse
        throw new Error(`Failed to fetch valid photo with: ${photo.error}`);
    }
    const {
        src: { landscape },
    } = photo as Photo;

    const { data }: AxiosResponse<Stream> = await axios({
        method: 'GET',
        url: landscape,
        responseType: 'stream',
    });

    const fullPath: string = outputPath + fileName;
    data.pipe(fs.createWriteStream(fullPath));
    return new Promise((res, rej) => {
        data.on('error', (e: any) => {
            rej(`Failed to download image with ${e}`);
        });
        data.on('end', () => {
            res(fullPath);
        });
    });
}
