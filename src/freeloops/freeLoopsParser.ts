import { HTMLElement, parse } from 'node-html-parser';
import { KnownWorkingTerms, constructFreeLoopsSearchUrl } from './freeLoopsConsts.js';
import { FreeLoopsProps } from './freeLoopsModel.js';
import { isDebugging } from '../helper/env.js';
import puppeteer from 'puppeteer';

// export async function fetchFreeLoopsPageHtml({
//     term = 'sound effect',
//     page = 1,
// }: {
//     readonly term: string;
//     readonly page: number;
// }) {
//     const browser = await puppeteer.launch({
//         headless: true,  // Make browser visible
//         defaultViewport: null,  // Use default viewport size
//         args: ['--start-maximized']  // Start maximized
//     });
//     const browserPage = await browser.newPage();
    
//     const url = constructFreeLoopsSearchUrl(term, page);
//     await browserPage.goto(url, { waitUntil: 'networkidle0' })

//     // Wait for the content to load
//     await browserPage.waitForSelector('a', { timeout: 10000 });

//     const content = await browserPage.content();
//     await browser.close();
//     if(isDebugging()) {
//         writeFileSync('raw_page.html', content)
//     }
//     return content;
// }

// export function parseSourcesFromHtml(html: string): FreeLoopsProps[] {
//     const sources: FreeLoopsProps[] = [];

//     const domHandle = parse(html);
//     const tags: HTMLElement[] = domHandle.querySelectorAll('[data-id]');
//     isDebugging() && console.log(JSON.stringify({
//         linksWithClass: domHandle.querySelectorAll('a[class]').length,
//         audioLinks: domHandle.querySelectorAll('a.audio-link').length,
//         linksWithDataId: domHandle.querySelectorAll('[data-id]').length,
// }, null, 2 ));
//     isDebugging() && console.log('pulled tags from page:', tags?.length)
//     for (const { attributes } of tags) {
//         const id = (attributes['data-id'] as any)?.value
//         const title = 'sample title';
//         isDebugging() && console.log('id:', id, 'title: ', title);
//         id && title && sources.push({ id, title });
//     }

//     return sources;
// }

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
    searchTerm;
    return 1
    // return parseMaxPagination(
    //     await fetchFreeLoopsPageHtml({ term: searchTerm, page: 1 })
    // );
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

    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null,
        args: ['--start-maximized']
    });
    const browserPage = await browser.newPage();
    
    const url = constructFreeLoopsSearchUrl(searchTerm, page);
    await browserPage.goto(url, { waitUntil: 'networkidle0' });

    // Wait for the content to load
    await browserPage.waitForSelector('table.standard-table', { timeout: 10000 });

    // Extract data using page.evaluate
    const results = await browserPage.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('table.standard-table tr'));
        
        // Skip header row
        return rows.slice(1).map(row => {
            const titleLink = row.querySelector('td:first-child a');
            const downloadLink = row.querySelector('a.audio-link');
            console.log(`Row:`, {
                titleLink,
                downloadLink,
               id: downloadLink?.getAttribute('data-id') || '',
            title: titleLink?.textContent?.trim() || ''
            });
            return {
                id: downloadLink?.getAttribute('data-id') || '',
                title: titleLink?.textContent?.trim() || ''
            };
        }).filter(item => item.id && item.title);
    });

    await browser.close();
    
    if(isDebugging()) {
        console.log('Found items:', results.length);
        console.log('Sample items:', results.slice(0, 3));
    }

    return results;
}
