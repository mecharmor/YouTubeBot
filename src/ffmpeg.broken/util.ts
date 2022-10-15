// import Ffmpeg from 'fluent-ffmpeg';
// // import { FfmpegCommand, FfmpegOnEventHandlers } from "./fluentffmpeg.js";
// import { AudioSample, VideoSample } from "model.js";
// import { mkdirSync, existsSync, rmdirSync } from 'fs';
// import { extname } from 'path';
// import lodash from 'lodash';
// const { noop } = lodash;

// export function AddImageToAudio(
//     { fullPath : audioPath, durationSec } : AudioSample,
//     imagePath : string,
//     outputPath : string,
//     onStartCb : () => void = noop,
//     onProgressCb : ( percent : number ) => void = noop,
//     onDoneCb : () => void = noop,
// ) : Promise<VideoSample | string> {
//     return new Promise( (resolve, reject) => {
//         const command : FfmpegCommand = new Ffmpeg();
//         command
//         .on( FfmpegOnEventHandlers.START, () => {
//             onStartCb();
//             onProgressCb( 0 );
//         } )
//         .on( FfmpegOnEventHandlers.PROGRESS, ( { percent } : any ) => onProgressCb( Math.min( percent / 100, 99.9 ) ) )
//         .on( FfmpegOnEventHandlers.ERROR, ( err : any, _stdout : string, stderr : string ) => {
//             onDoneCb();
//             reject( err.message + '' + stderr );
//             command.kill( 'SIGKILL' );
//         } )
//         .on( FfmpegOnEventHandlers.END, () => {
//             onProgressCb( 100 );
//             onDoneCb();
//             resolve( {
//                 durationSec,
//                 fileName : outputPath.split( '/' ).pop(),
//                 fullPath : outputPath,
//             } as VideoSample )
//         } )
//         .input( audioPath )
//         .input( imagePath )
//         .format( extname( outputPath ).substring( 1 ).toLowerCase() )
//         .size( '1920x?' )
//         // .videoCodec('mpeg4')
//         // .fps( 25 )
//         // .videoCodec('libx264')
//         // .outputOptions( ['-movflags', '+faststart','-pix_fmt', 'yuv420p'] )
//         .outputOptions( [
//             '-movflags',
//             '+faststart',
//             '-c:v libx264',
//             '-preset medium',
//             '-crf 18',
//             // '-c:a pcm_s16le',
//             '-c:a aac',
//             '-b:a 192k',
//             '-shortest',
//             '-tune stillimage',
//             '-pix_fmt yuv420p',
//         ] )
//         .save( outputPath );
//     } )
// }

// export function LoopAudioUntilReachedTime(
//     s : AudioSample,
//     expectedDurationSec : number,
//     outputPath : string,
//     onStartCb : () => void = noop,
//     onProgressCb : ( percent : number ) => void = noop,
//     onDoneCb : () => void = noop,
// ) : Promise<AudioSample | string> {
//     return LoopAudio(
//         s,
//         Math.ceil( expectedDurationSec / s.durationSec ),
//         outputPath,
//         onStartCb,
//         onProgressCb,
//         onDoneCb,
//     );
// }

// const TEMP_RENDER_CACHE_DIR : string = './cache';
// export function LoopAudio(
//     { fullPath, durationSec } : AudioSample,
//     times : number,
//     outputPath : string,
//     onStartCb : () => void = noop,
//     onProgressCb : ( percent : number ) => void = noop,
//     onDoneCb : () => void = noop,
// ) : Promise<AudioSample | string> {
//     return new Promise<AudioSample | string>( ( resolve, reject ) => {
//         if( !existsSync( TEMP_RENDER_CACHE_DIR ) ) {
//             mkdirSync( TEMP_RENDER_CACHE_DIR );
//         }

//         const command : FfmpegCommand = new Ffmpeg( fullPath );
//         for( let i = 0; i < times; i++ )
//             command.input( fullPath )

//         command
//         .on( FfmpegOnEventHandlers.START, () => {
//             onStartCb();
//             onProgressCb( 0 );
//         } )
//         .on( FfmpegOnEventHandlers.PROGRESS, ( { percent } : any ) => onProgressCb( Math.min( percent / 100, 99.9 ) ) )
//         .on( FfmpegOnEventHandlers.ERROR, ( err : any, _stdout : string, stderr : string ) => {
//             onDoneCb();
//             reject( err.message + '' + stderr );
//             command.kill( 'SIGKILL' );
//         } )
//         .on( FfmpegOnEventHandlers.END, () => {
//             onProgressCb( 100 );
//             rmdirSync( TEMP_RENDER_CACHE_DIR );
//             onDoneCb();
//             resolve( {
//                 fileName : outputPath.split( '/' ).pop(),
//                 fullPath : outputPath,
//                 durationSec : durationSec * times,
//             } )
//         } )
//         .mergeToFile( outputPath, TEMP_RENDER_CACHE_DIR )
//     } )
// }

// // for( let i = 0; i < INPUT_ITERATIONS; i++ )
// //     command.input( mockDownloadedFile.fullPath )

// // const bar : any = new SingleBar( {
// //     format: 'Rendering.. | {bar} | {percentage}%',
// // }, Presets.shades_classic );
// // command
// // .on( FfmpegOnEventHandlers.START, () => {
// //     bar.start( 100, 0 );
// // } )
// // .on( FfmpegOnEventHandlers.PROGRESS, ( { percent } : any ) => {
// //     bar.update( Math.min( percent / 100, 99.9 ) )
// //     // console.log( `Rendering (${ percent / 100 }%)` );
// // } )
// // .on( FfmpegOnEventHandlers.ERROR, ( err : { message : string }, stdout : string, stderr : string ) => {
// //     bar.stop();
// //     console.log( 'Failed rendering video with', err.message, stderr, stdout );
// //     command.kill( 'SIGKILL' );
// // } )
// // .on( FfmpegOnEventHandlers.END, () => {
// //     bar.update(100);
// //     bar.stop();
// //     console.log( `Finished rendering ${ mockDownloadedFile.fileName }` );
// // } )
// // .mergeToFile( './temp_downloads/mocked.mp3', './cache' )
