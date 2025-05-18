import {
    mkdirSync,
    rmdirSync
} from 'fs';
import { DownloadFreeLoopsAudio, FindRandomSample, FreeLoopsAudio } from './freeloops/freeLoopsDownloader.js';
import { FreeLoopsProps } from './freeloops/freeLoopsModel.js';
import { cacheCleanupDisabled, isDebugging } from './helper/env.js';
import { ensurePathEndsWithSlash, removeExtensionIfExists } from './helper/path.js';
import { DownloadImageFromSearch } from './helper/pexel.js';
import { makeVideo } from './helper/renderer.js';
import { makeTitle } from './helper/string.js';
import { padZero } from './helper/time.js';
import lodash from 'lodash';
const { uniqueId } = lodash;
import { upload2YouTube } from './helper/youtube.js';
import { generateDescription, generateTitle } from './helper/openai.js';
const THUMBNAIL_NAME = 'image.jpeg';

export function makeRandomVideoTask( [ hours, minutes, seconds ] : number[] ) : Promise<void> {
    if( hours == 0 && minutes == 0 && seconds == 0 ) {
        isDebugging() && console.log( 'No time specified!' );
        return Promise.reject( 'No time specified!' );
    }

    const timestamp = (new Date()).toISOString().replace(/:/g, '_');
    const CACHE_DIR = ensurePathEndsWithSlash(`./cache-${timestamp}-${uniqueId()}`);
    mkdirSync(CACHE_DIR);

    return FindRandomSample()
    .then( ( sample : FreeLoopsProps ) => {
        if( !sample ) {
            return Promise.reject( 'Finding a random sample audio failed even after retrying multiple times' );
        }
    
        console.log( `Downloading ${ sample.title }...` );
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
    .then( async ( {
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
        const title = await generateTitle(makeTitle( {
            hours, minutes, seconds, fileName : audio.fileName
        } ))
        const description = await generateDescription(title)
        return upload2YouTube( {
            title,
            description: description + " Credit to https://free-loops.com/",
            video : {
                fullPath : outputFilePath,
                thumbnailPath : thumbnailPath,
            }
        } )
    } )
    .catch( e => console.log( e ) )
    .finally( () => {
        !cacheCleanupDisabled() && rmdirSync( CACHE_DIR, { recursive : true } );
    } )
}