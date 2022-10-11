export function toTitleText( time : number, timeType : string ) {
    if( time <= 0 ) {
        return '';
    }

    return `${ time } ${ timeType }${ time === 1 ? '' : 's' }`
}