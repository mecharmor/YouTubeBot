import fs from 'fs';
import { default as axios, AxiosPromise, AxiosResponse } from 'axios';
import { constructDownloadUrl } from './freeLoopsConsts.js';
import { FreeLoopsProps } from './freeLoopsModel.js';
import { extname } from 'path';

const downloadFromFreeLoops : ( id: string ) => AxiosPromise<any> = ( id: string ) => {
    return axios( {
        method : 'GET',
        url : constructDownloadUrl( id ),
        responseType : 'stream',
    } );
};

export async function DownloadFreeLoopsVideo( {
    path,
    props : { title, id },
} : {
    readonly path : string;
    readonly props : FreeLoopsProps;
} ) : Promise<string> {
    // fs.createWriteStream()
    const { data } : AxiosResponse = await downloadFromFreeLoops( id );

    // Add slash if one does not exist
    if( path[ path.length - 1 ] !== '/' ) {
        path += '/';
    }

    if( !fs.statSync( path ).isDirectory() ) {
        return Promise.reject( `${ path } is not a directory` );
    }

    data.pipe(
        fs.createWriteStream( `${ path }${ title }.${ extname( title ) || 'mp3' }` )
    );

    return new Promise( ( resolve, reject ) => {
        data.on( 'end', resolve.bind( this ) );
        data.on( 'error', reject.bind( this ) );
    } )
}