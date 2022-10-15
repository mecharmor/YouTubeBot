export function ensurePathEndsWithSlash(path: string): string {
    return path[path.length - 1] !== '/' ? `${path}/` : path;
}

export function removeExtensionIfExists(fileName: string) {
    const idxOfDot: number = fileName.lastIndexOf('.');
    if (idxOfDot !== -1) {
        return fileName.substring(0, idxOfDot);
    }

    return fileName;
}
