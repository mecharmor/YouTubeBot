
// import { getAudioUrls } from './helper/freeLoopsParser.js';
import { DownloadFreeLoopsVideo, FreeLoopsAudio } from './helper/freeLoopsDownloader.js';
// import { default as axios } from 'axios';

const [ id, title ] = [ '8122', 'White Noise Mp3' ];

// getAudioDurationInSeconds

// getAudioDurationInSeconds( './temp_downloads/White_Noise_Mp3.mp3' )
//     .then( (num : number) => console.log( 'we have detected this', num ) );

DownloadFreeLoopsVideo( {
    path : './temp_downloads',
    props : { id, title }
} )
.then( ( {
    fileName,
    fullPath,
    fileStats,
    durationSec,
} : FreeLoopsAudio ) => {
    console.log( {
        fileName,
        fullPath,
        blksize: fileStats.blksize,
        durationSec,
    } );
} )
.catch( (err) => console.log( 'failed', err ) );

// getAudioUrls( 'white noise' ).then( sounds => {
//     for( const { id, title, ...rest } of sounds ) {
//         console.log( id, title, rest );
//     }
// })
// /**
//  * Some predefined delay values (in milliseconds).
//  */
// export enum Delays {
//     Short = 500,
//     Medium = 2000,
//     Long = 5000,
// }

// /**
//  * Returns a Promise<string> that resolves after a given time.
//  *
//  * @param {string} name - A name.
//  * @param {number=} [delay=Delays.Medium] - A number of milliseconds to delay resolution of the Promise.
//  * @returns {Promise<string>}
//  */
// function delayedHello(
//     name: string,
//     delay: number = Delays.Medium
// ): Promise<string> {
//     return new Promise((resolve: (value?: string) => void) =>
//         setTimeout(() => resolve(`Hello, ${name}`), delay)
//     )
// }

// // Below are examples of using ESLint errors suppression
// // Here it is suppressing a missing return type definition for the greeter function.

// // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
// export async function greeter(name: string) {
//     return await delayedHello(name, Delays.Long)
// }

// // console.log('smoke tests here')
