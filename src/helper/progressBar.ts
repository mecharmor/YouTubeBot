export function formatMessageForProgBar( text : string ) : string {
    const MAX_LEN : number = 20;
    text += "...";
    while( text.length < MAX_LEN ) {
        text += ' ';
    }

    return text.substring( 0, MAX_LEN );
}