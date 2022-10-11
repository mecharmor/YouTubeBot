import dotenv from 'dotenv';
dotenv.config();
import {
    mkdirSync,
    rmdirSync
} from 'fs';
import { DownloadFreeLoopsAudio, FindRandomSample, FreeLoopsAudio } from './freeloops/freeLoopsDownloader.js';
import { FreeLoopsProps } from './freeloops/freeLoopsModel.js';
import { ensurePathEndsWithSlash, removeExtensionIfExists } from './helper/path.js';
import { DownloadImageFromSearch } from './helper/pexel.js';
import { makeVideo } from './helper/renderer.js';
import { toTitleText } from './helper/string.js';
import { padZero } from './helper/time.js';
import { upload2YouTube } from './helper/youtube.js';

const CACHE_DIR = ensurePathEndsWithSlash( `./cache-${ ( new Date() ).toISOString() }` );
const THUMBNAIL_NAME = 'image.jpeg';
mkdirSync( CACHE_DIR );

FindRandomSample()
.then( ( sample : FreeLoopsProps ) => {
    console.log( 'Downloading audio sample...');
    return DownloadFreeLoopsAudio( {
        path : CACHE_DIR,
        props : sample,
    } )
} )
.then( ( audio : FreeLoopsAudio ) => {
    return DownloadImageFromSearch(
        removeExtensionIfExists( audio.fileName ),
        CACHE_DIR,
        THUMBNAIL_NAME
    )
        .then( ( thumbnailPath : string ) => {
            return {
                thumbnailPath,
                audio
            };
        } )
} )
.then( ( { thumbnailPath, audio } : { thumbnailPath : string, audio : FreeLoopsAudio } ) => {
    const outputFilePath : string = CACHE_DIR + 'output.mp4';
    const [ hours, minutes, seconds ] = [ 0, 5, 0 ];
    return makeVideo( {
        audio,
        outputFilePath,
        duration : `${ padZero( hours ) }:${ padZero( minutes ) }:${ padZero( seconds ) }.000`,
        backgroundImagePath : thumbnailPath,
    } ).then( () => ( {
        thumbnailPath,
        outputFilePath,
        audio,
        duration : {
            hours, minutes, seconds
        },
    } ) );
} )
.then( ( {
    thumbnailPath,
    outputFilePath,
    audio,
    duration : { hours, minutes, seconds },
} : {
    thumbnailPath : string,
    outputFilePath : string,
    audio : FreeLoopsAudio,
    duration : { hours : number, minutes : number, seconds : number },
} ) => {
    const title : string = `\
    ${ toTitleText( hours, 'hour' ) } \
    ${ toTitleText( minutes, 'minute' ) } \
    ${ toTitleText( seconds, 'second' ) } \
    of ${ removeExtensionIfExists( audio.fileName ) } sounds
    `
    return upload2YouTube( {
        title,
        description : 'Like and Subscribe for more content!',
        video : {
            fullPath : outputFilePath,
            thumbnailPath : thumbnailPath,
        }
    } )
} )
.catch( e => console.log( e ) )
.finally( () => {
    rmdirSync( CACHE_DIR, { recursive : true } )
} )


// import { FreeLoopsAudio } from "./freeloops/freeLoopsDownloader.js";


// import Ffmpeg from 'fluent-ffmpeg';
// import { FfmpegCommand, FfmpegOnEventHandlers } from "./ffmpeg/fluentffmpeg.js";
// import { AddImageToAudio, LoopAudioUntilReachedTime } from "./ffmpeg.broken/util.js";
// import CLIProgress from 'cli-progress'; // https://www.npmjs.com/package/cli-progress
// import { formatMessageForProgBar } from "./helper/progressBar.js";
// const { Presets, MultiBar } = CLIProgress;

// const mockDownloadedFile : AudioSample = {
//     fileName: 'Small Waterfall.wav',
//     fullPath: './temp_downloads/Small Waterfall.wav',
//     durationSec: 86.0
// };

// How to Render a video start
// import { AudioSample } from "./model.js";
// import { makeVideo } from './helper/renderer.js';
// makeVideo( {
//     duration : '00:30:00.000',
//     backgroundImagePath : './temp_downloads/test.jpg',
//     audio : mockDownloadedFile,
//     outputFilePath : './temp_downloads/test.mp4',
// } ).then( () => {
//     console.log( 'success!' );
// } ).catch( () => {
//     console.log( 'failed!' );
// } )
// -------------------

// Download thumbnail
// import { DownloadImageFromSearch } from './helper/pexel.js';
// DownloadImageFromSearch(
//     'mountain',
//     './temp_downloads'
// )
// -----

// Uploading To Youtube
// import { upload2YouTube } from "./helper/youtube.js";
// import { resolve } from 'path';
// upload2YouTube( {
//     title : 'test uploaded youtube video',
//     description : "this is a youtube video test description",
//     video : {
//         fullPath : resolve( './temp_downloads/test.mp4' ),
//         fileName : 'N/A',
//         durationSec : 1800,
//         thumbnailPath : './temp_downloads/test.jpg',
//     }
// } )
// --------------




// const multiBar : any = new MultiBar( {
//     clearOnComplete : false,
//     hideCursor : true,
//     format : '{message} |{bar}| {percentage}%',
// },  Presets.shades_grey );

// const stitchingAudioBar : any = multiBar.create( 100, 0, { message : formatMessageForProgBar( "Waiting" ) } );
// const attachingImageToAudio : any = multiBar.create( 100, 0, { message : formatMessageForProgBar( "Waiting" ) } );

// const tempBigAudio : string = './temp_downloads/long.wav';
// LoopAudioUntilReachedTime(
//     mockDownloadedFile,
//     60, tempBigAudio,
//     () => stitchingAudioBar.update( 0, { message : formatMessageForProgBar( "Looping Audio" ) } ),
//     ( percent : number ) => stitchingAudioBar.update( percent ),
// ).then( ( renderedAudio : AudioSample ) => AddImageToAudio(
//         renderedAudio,
//         './temp_downloads/test.jpg',
//         './temp_downloads/test.mp4',
//         () => attachingImageToAudio.update( 0, { message : formatMessageForProgBar('Adding video') } ),
//         ( percent : number ) => attachingImageToAudio.update( percent ),
//     )
//     // console.log( renderedAudio );
//     // attachingImageToAudio.stop();
// )
// .finally( () => {
//     multiBar.stop();
//     console.log( 'finished...' );
// } )

// const command : FfmpegCommand = new Ffmpeg( mockDownloadedFile.fullPath );

// const DURATION_IN_SECONDS : number = 3600;
// const INPUT_ITERATIONS : number = Math.ceil( DURATION_IN_SECONDS / mockDownloadedFile.durationSec );
// for( let i = 0; i < INPUT_ITERATIONS; i++ )
//     command.input( mockDownloadedFile.fullPath )


// const bar : any = new SingleBar( {
//     format: 'Rendering.. | {bar} | {percentage}%',
// }, Presets.shades_classic );
// command
// .on( FfmpegOnEventHandlers.START, () => {
//     bar.start( 100, 0 );
// } )
// .on( FfmpegOnEventHandlers.PROGRESS, ( { percent } : any ) => {
//     bar.update( Math.min( percent / 100, 99.9 ) )
//     // console.log( `Rendering (${ percent / 100 }%)` );
// } )
// .on( FfmpegOnEventHandlers.ERROR, ( err : { message : string }, stdout : string, stderr : string ) => {
//     bar.stop();
//     console.log( 'Failed rendering video with', err.message, stderr, stdout );
//     command.kill( 'SIGKILL' );
// } )
// .on( FfmpegOnEventHandlers.END, () => {
//     bar.update(100);
//     bar.stop();
//     console.log( `Finished rendering ${ mockDownloadedFile.fileName }` );
// } )
// .mergeToFile( './temp_downloads/truncate.wav', './cache' )



// // import { getAudioUrls } from './helper/freeLoopsParser.js';

// // import { default as axios } from 'axios';

// // getAudioDurationInSeconds

// // getAudioDurationInSeconds( './temp_downloads/White_Noise_Mp3.mp3' )
// //     .then( (num : number) => console.log( 'we have detected this', num ) );



// // getAudioUrls( 'white noise' ).then( sounds => {
// //     for( const { id, title, ...rest } of sounds ) {
// //         console.log( id, title, rest );
// //     }
// // })
// // /**
// //  * Some predefined delay values (in milliseconds).
// //  */
// // export enum Delays {
// //     Short = 500,
// //     Medium = 2000,
// //     Long = 5000,
// // }

// // /**
// //  * Returns a Promise<string> that resolves after a given time.
// //  *
// //  * @param {string} name - A name.
// //  * @param {number=} [delay=Delays.Medium] - A number of milliseconds to delay resolution of the Promise.
// //  * @returns {Promise<string>}
// //  */
// // function delayedHello(
// //     name: string,
// //     delay: number = Delays.Medium
// // ): Promise<string> {
// //     return new Promise((resolve: (value?: string) => void) =>
// //         setTimeout(() => resolve(`Hello, ${name}`), delay)
// //     )
// // }

// // // Below are examples of using ESLint errors suppression
// // // Here it is suppressing a missing return type definition for the greeter function.

// // // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
// // export async function greeter(name: string) {
// //     return await delayedHello(name, Delays.Long)
// // }

// // // console.log('smoke tests here')
