import {
    DownloadFreeLoopsAudio,
    FreeLoopsAudio,
} from '../freeloops/freeLoopsDownloader.js';

const [id, title] = ['8122', 'White Noise Mp3'];

export function runMock(): void {
    DownloadFreeLoopsAudio({
        path: './temp_downloads',
        props: { id, title },
    })
        .then(
            ({
                fileName,
                fullPath,
                fileStats,
                durationSec,
            }: FreeLoopsAudio) => {
                console.log({
                    fileName,
                    fullPath,
                    blksize: fileStats.blksize,
                    durationSec,
                });
            }
        )
        .catch((err) => console.log('failed', err));
}
