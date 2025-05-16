export const SEARCH_URL = 'https://free-loops.com/audio.php';
export const RANDOM_SOUND_UNTESTED = 'https://free-loops.com/random-sound.php';

export function constructDownloadUrl(id: string) {
    return `https://free-loops.com/force-audio.php?id=${id}`;
}

export function constructFreeLoopsSearchUrl(term: string, page = 1) {
    if (!term) throw 'Must specify a term!';

    return `${SEARCH_URL}?term=${encodeURI(term)}&page=${page}`;
}

export const KnownWorkingTerms: string[] = [
    'sound effect',
    'waterfall',
    'wind',
    'water',
    'test',
    'guitar',
    'robot',
    'meow',
    'slap'
];
