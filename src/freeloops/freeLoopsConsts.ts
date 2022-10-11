export const SEARCH_URL = 'https://free-loops.com/free-loops-find.php';
export const RANDOM_SOUND_UNTESTED = 'https://free-loops.com/random-sound.php';

export function constructDownloadUrl(id: string) {
    return `https://free-loops.com/force-audio.php?id=${id}`;
}

export const KnownWorkingTerms : string[] = [
    "bass",
    "drum kit",
    "drum loop",
    "sound effect",
    "instrument",
    "synth",
    "vocal",
    "hip hop",
    "rap",
    "house",
    "trance",
    "breaks / breakbeat",
    "jungle",
    "dnb",
    "techno",
    "rock",
    "piano",
    "808",
    "909",
    "606",
    "crunk",
    "drum rolls",
    "drum fills",
    "funk",
    "prank calls"
  ];
