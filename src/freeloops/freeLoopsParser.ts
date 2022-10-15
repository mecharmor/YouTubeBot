import { HTMLElement, parse } from 'node-html-parser';
import { default as axios } from 'axios';
import { KnownWorkingTerms, SEARCH_URL } from './freeLoopsConsts.js';
import { FreeLoopsProps } from './freeLoopsModel.js';
import { isDebugging } from '../helper/env.js';
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

export function parseSourcesFromHtml(html: string): FreeLoopsProps[] {
    const sources: FreeLoopsProps[] = [];

    const tags: HTMLElement[] = parse(html)
        .querySelectorAll('.row-b > td:first-child > a')
        .filter((tag: HTMLElement) => !!tag.innerText);
    for (const { rawAttrs: hrefRaw, innerText: title } of tags) {
        const [id] = hrefRaw.match(/(?<=href=')[0-9]*(?=-)/gmu) || [];
        id && title && sources.push({ id, title });
    }

    return sources;
}

export function parseMaxPagination(html: string): number {
    const existingPages: number[] = parse(html)
        .querySelectorAll('td > .paged')
        .map((elem: HTMLElement) => {
            const pagedNumber = Number(elem.innerText);
            if (Number.isNaN(pagedNumber)) {
                isDebugging() &&
                    console.warn(
                        `Somehow we parsed a NaN from ${elem.innerText}`
                    );
                return 0;
            }
            return pagedNumber;
        });
    return Math.max(...existingPages);
}

export async function getMaxPageCountForSearchTerm(
    searchTerm: string
): Promise<number> {
    return parseMaxPagination(
        await fetchFreeLoopsPageHtml({ term: searchTerm, page: 1 })
    );
}

export async function getAudioUrls(
    searchTerm: string,
    page = 1
): Promise<FreeLoopsProps[]> {
    if (!KnownWorkingTerms.includes(searchTerm.toLowerCase())) {
        isDebugging() &&
            console.warn(
                `[warning] term ${searchTerm} does not exist in the known terms. this may not work...`
            );
    }

    return parseSourcesFromHtml(
        await fetchFreeLoopsPageHtml({ term: searchTerm, page })
    );
}
