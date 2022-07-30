import { HTMLElement, parse } from 'node-html-parser';
import { default as axios } from 'axios';
const { get } = axios;

export const SEARCH_URL = 'https://free-loops.com/free-loops-find.php';
// const RANDOM_SOUND_UNTESTED : string = 'https://free-loops.com/random-sound.php';

export function constructDownloadUrl(id: string) {
    return `https://free-loops.com/force-audio.php?id=${id}`;
}

export function constructFreeLoopsSearchUrl(term: string, page = 1) {
    if (!term) throw 'Must specify a term!';

    return `${SEARCH_URL}?term=${encodeURI(term)}&page=${page}`;
}

export async function fetchFreeLoopsPageHtml({
    term = 'sound effect',
    page = 1,
}: {
    readonly term: string;
    readonly page: number;
}) {
    return (await get(constructFreeLoopsSearchUrl(term, page))).data;
}

export function parseSourcesFromHtml(html: string) {
    const sources = [];

    const tags: HTMLElement[] = parse(html).querySelectorAll(
        '.row-b > td:first-child > a'
    );
    for (const { rawAttrs: hrefRaw, innerText: title } of tags) {
        const id = hrefRaw.match(/(?<=href=')[0-9]*(?=-)/gmu)[0];
        id && sources.push({ id, title });
    }

    return sources;
}

export async function getAudioUrls(searchTerm: string) {
    return parseSourcesFromHtml(
        await fetchFreeLoopsPageHtml({ term: searchTerm, page: 1 })
    );
}
