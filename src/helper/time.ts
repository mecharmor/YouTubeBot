export function padZero( t : number ) : string {
    if( t < 10 ) {
        return '0' + t;
    }
    
    return t.toString();
}