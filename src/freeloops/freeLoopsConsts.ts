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
    // 'robot',
    'meow',
    // 'slap',
    'noise',
    'background',
    'sound',
    'effect',
    'fire crackle',
    'crackle',
    'nature',
    'bird',
    'white',
    'brown',
    'loop',
    'rain',
    'background',
    'atmospheric',
    'forest',
    'creative commons',
    'soundscapes',
    'city',
    'high quality',
    'royalty'
];

// Blacklist of keywords that could violate YouTube's terms of service
export const BLACKLISTED_KEYWORDS: string[] = [
    // Violence/Weapons
    'explosion', 'bomb', 'gun', 'gunshot', 'rifle', 'pistol', 'weapon', 'war', 'battle',
    'fight', 'punch', 'hit', 'violence', 'blood', 'death', 'kill', 'murder',
    
    'boy', 'girl', 'baby',
    
    // Drugs/Alcohol
    'drug', 'alcohol', 'drunk', 'beer', 'wine',
    
    // Hate speech potential
    'hate', 'racist',
    
    // Copyright issues
    'copyright', 'trademark', 'branded', 'commercial', 'advertisement',
    
    // Other potentially problematic terms
    'scream', 'cry', 'pain', 'hurt', 'injury', 'accident', 'crash', 'emergency',
    'police', 'siren', 'alarm', 'warning', 'danger', 'toxic', 'poison'
];

// Function to check if a title contains blacklisted keywords
export function isTitleBlacklisted(title: string): boolean {
    const lowerTitle = title.toLowerCase();
    return BLACKLISTED_KEYWORDS.some(keyword => 
        lowerTitle.includes(keyword.toLowerCase())
    );
}