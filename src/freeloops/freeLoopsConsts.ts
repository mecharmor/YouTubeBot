export const SEARCH_URL = 'https://free-loops.com/free-loops-find.php';
export const RANDOM_SOUND_UNTESTED = 'https://free-loops.com/random-sound.php';

export function constructDownloadUrl(id: string) {
    return `https://free-loops.com/force-audio.php?id=${id}`;
}
