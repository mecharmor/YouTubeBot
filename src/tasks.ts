import {
    mkdirSync,
    rmdirSync
} from 'fs';
import { DownloadFreeLoopsAudio, FindRandomSample, FreeLoopsAudio } from './freeloops/freeLoopsDownloader.js';
import { FreeLoopsProps } from './freeloops/freeLoopsModel.js';
import { cacheCleanupDisabled, isDebugging, shouldSkipAiContentGeneration, shouldSkipYouTubeUpload } from './helper/env.js';
import { ensurePathEndsWithSlash, removeExtensionIfExists } from './helper/path.js';
import { DownloadImageFromSearch } from './helper/pexel.js';
import { makeVideo } from './helper/renderer.js';
import { makeTitle } from './helper/string.js';
import { padZero } from './helper/time.js';
import lodash from 'lodash';
const { uniqueId } = lodash;
import { upload2YouTube } from './helper/youtube.js';
import { generateDescription, generateTitle } from './helper/openai.js';
import { sendDiscordUpdate } from './helper/discord.js';
const THUMBNAIL_NAME = 'image.jpeg';

export function makeRandomVideoTask( [ hours, minutes, seconds ] : number[] ) {
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
    
        sendDiscordUpdate({
            status: 'started',
            message: `Starting video generation for ${sample.title} with a runtime of ${hours}:${minutes}:${seconds}`,
            details: {
                timestamp
            }
        })
        console.log( `Downloading ${ sample.title }...` );
        return DownloadFreeLoopsAudio( {
            path : CACHE_DIR,
            props : sample,
        } ).then((audio: FreeLoopsAudio) => {
            isDebugging() && console.log('Using audio at:', audio.fullPath)
            return audio;
        })
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
        let title = makeTitle( {
            hours, minutes, seconds, fileName : audio.fileName
        } );
        let description = title;
        if(!shouldSkipAiContentGeneration()) {
            title = await generateTitle(title) ?? title;
            description = await generateDescription(title)
        }
        if(shouldSkipYouTubeUpload()) {
            console.log("AI Generated Title: ", title)
            console.log("AI Generated Description: ", description)
            return 'https://youtu.be/N_7lZyP99Ag'
        }
        return upload2YouTube( {
            title,
            description: description + " Credit to free-loops.com for source",
            video : {
                fullPath : outputFilePath,
                thumbnailPath : thumbnailPath,
            }
        } )
    } )
    .then( ( videoUrl : string ) => {
        sendDiscordUpdate({
            status: 'completed',
            message: `Uploaded to YouTube at ${videoUrl}`,
        })
        return videoUrl;
    } )
    .catch( e => {
        console.log( e )
        sendDiscordUpdate({
            status: 'error',
            message: `Failed to create video`,
            details: {
                error: e
            }
        })
    } )
    .finally( () => {
        !cacheCleanupDisabled() && rmdirSync( CACHE_DIR, { recursive : true } );
    } )
}