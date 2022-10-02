import { HTMLElement, parse } from 'node-html-parser';
import { default as axios } from 'axios';
import { SEARCH_URL } from './freeLoopsConsts.js';
const { get } = axios;

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
