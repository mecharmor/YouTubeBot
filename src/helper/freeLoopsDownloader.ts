import fs from 'fs';
import { default as axios, AxiosPromise, AxiosResponse } from 'axios';
import { constructDownloadUrl } from './freeLoopsConsts.js';
import { FreeLoopsProps } from './freeLoopsModel.js';
import { extname } from 'path';
import { Stream } from 'stream';
import GetAudioDuration from 'get-audio-duration';
const { getAudioDurationInSeconds } = GetAudioDuration;

const downloadFromFreeLoops : ( id: string ) => AxiosPromise<Stream> = ( id: string ) => {
    return axios( {
        method : 'GET',
        url : constructDownloadUrl( id ),
        responseType : 'stream',
    } );
};

export interface FreeLoopsAudio {
    readonly fullPath : string;
    readonly fileName : string;
    readonly fileStats : fs.Stats;
    readonly durationSec : number;
}

export interface FreeLoopsError {
    readonly message : string;
}

export async function DownloadFreeLoopsVideo( {
    path,
    props : { title, id },
} : {
    readonly path : string;
    readonly props : FreeLoopsProps;
} ) : Promise<FreeLoopsAudio | FreeLoopsError> {
    const { data } : AxiosResponse = await downloadFromFreeLoops( id );

    // Add slash if one does not exist
    if( path[ path.length - 1 ] !== '/' ) {
        path += '/';
    }

    if( !fs.statSync( path ).isDirectory() ) {
        return Promise.reject( `${ path } is not a directory` );
    }

    const fileName : string = `${ title }.${ extname( title ) || 'mp3' }`;
    const fullPath : string = `${ path }${ fileName }`;
    data.pipe(
        fs.createWriteStream( fullPath )
    );

    let downloadedFile : Omit<FreeLoopsAudio, 'durationSec'>;
    try{
        downloadedFile = await new Promise( ( resolve, reject ) => {
            data.on( 'end', () => resolve( {
                fullPath,
                fileName,
                fileStats : fs.statSync( fullPath ),
            } ) );
            data.on( 'error', ( e : any ) => reject( {
                message : e || `Failed to stream into file for ${ fullPath }`,
            } ) );
        } ) as Omit<FreeLoopsAudio, 'durationSec'>;
    } catch( err : any ) {
        return Promise.reject( err as FreeLoopsError );
    }

    return getAudioDurationInSeconds( downloadedFile.fullPath )
        .then( ( durationSec : number ) => Object.assign(
            downloadedFile,
            { durationSec } as Pick<FreeLoopsAudio, 'durationSec'> )
        ) as Promise<FreeLoopsAudio>;
}