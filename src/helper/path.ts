export function ensurePathEndsWithSlash( path : string ) : string {
    return path[ path.length - 1 ] !== '/' ? `${ path }/` : path;
    
}