import dotenv from 'dotenv';
dotenv.config();
import { makeRandomVideoTask } from './tasks.js';
import { getDurationFromEnv, isDebugging, shouldUploadVideoForEveryHourInDuration } from './helper/env.js';
import { makeTitle } from './helper/string.js';

async function makeRandomVideoTaskRecurse( hours : number, minutes : number, seconds: number, currentHours  = 1 ) {
    console.log( `Creating Video of length: ${ makeTitle( {
        hours : currentHours,
        minutes,
        seconds,
        fileName : '',
    } ) }` )
    return makeRandomVideoTask( [ currentHours, minutes, seconds ] )
        .then( ()=> {
            if( currentHours >= hours ) {
                return Promise.resolve( 'finished!' );
            }

            return makeRandomVideoTaskRecurse( hours, minutes, seconds, currentHours + 1 );
        } )
}

const [ hours, minutes, seconds ] : number[] = getDurationFromEnv();

if( shouldUploadVideoForEveryHourInDuration() && hours > 1 ) {
    isDebugging() && console.log("Running recursive workflow")
    makeRandomVideoTaskRecurse( hours, minutes, seconds );
} else {
    isDebugging() && console.log(`Generating with duration: HH:MM:SS as ${hours}:${minutes}:${seconds}`)
    makeRandomVideoTask( [ hours, minutes, seconds ] );
}
