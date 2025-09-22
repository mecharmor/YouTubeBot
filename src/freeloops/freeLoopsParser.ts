import { KnownWorkingTerms, constructFreeLoopsSearchUrl, isTitleBlacklisted } from './freeLoopsConsts.js';
import { FreeLoopsProps } from './freeLoopsModel.js';
import { isDebugging } from '../helper/env.js';
import puppeteer from 'puppeteer';

const puppeteerOptions = {
    headless: true,
    defaultViewport: null,
    args: [
        '--start-maximized',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--ignore-certificate-errors',
        '--ignore-certificate-errors-spki-list',
        '--allow-running-insecure-content',
        '--disable-web-security',
        '--reduce-security-for-testing',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-site-isolation-trials'
    ],
    timeout: 30000
};

export async function getMaxPageCountForSearchTerm(
    searchTerm: string,
): Promise<number> {
    const browser = await puppeteer.launch(puppeteerOptions);
    const browserPage = await browser.newPage();
    isDebugging() && console.log("Launching browser...")
    const url = constructFreeLoopsSearchUrl(searchTerm, 1);
    isDebugging() && console.log("Opening At URL:", url)
    await browserPage.goto(url, { waitUntil: 'networkidle0' });

    // Wait for the content to load
    isDebugging() && console.log("Waiting for content to render in browser...")
    await browserPage.waitForSelector('table.standard-table', { timeout: 10000 });

    // Extract the last page number from pagination
    isDebugging() && console.log("Starting page extraction...");
    
    const maxPage = await browserPage.evaluate(() => {
        const paginationLinks = Array.from(document.querySelectorAll('div.pagination a'));
        if(paginationLinks.length === 0) {
            return 1;
        }
        console.log("Pagination links:", paginationLinks)
        const lastLink = paginationLinks[paginationLinks.length - 1];
        console.log("Last link:", lastLink)
        const href = lastLink?.getAttribute?.('href')
        const pageMatch = href?.match(/page=(\d+)/);
        const pageNumber = pageMatch ? Number(pageMatch[1]) : 0;
        console.log("Page number:", pageNumber)
        return pageNumber;
    });

    isDebugging() && console.log("Extracted max page:", maxPage);
    isDebugging() && console.log("Closing browser...");

    await browser.close();

    if(maxPage === 0 || Number.isNaN(maxPage)) {
        console.error("Failed to extract max page number. falling back to 1")
        return 1;
    }

    return maxPage;
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

    isDebugging() && console.log("Launching browser...")
    const browser = await puppeteer.launch(puppeteerOptions);
    const browserPage = await browser.newPage();
    
    const url = constructFreeLoopsSearchUrl(searchTerm, page);
    await browserPage.goto(url, { waitUntil: 'networkidle0' });

    // Wait for the content to load
    isDebugging() && console.log("Waiting for content to render in browser...")
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
        });
    })

    await browser.close();
    
    if(isDebugging()) {
        console.log('Found items:', results.length);
        console.log('Sample items:', results.slice(0, 3));
    }

    return results.filter(item => {
        // Filter out items without id or title
        if (!item.id || !item.title) return false;
        
        // Filter out blacklisted titles
        if (isTitleBlacklisted(item.title)) {
            isDebugging() && console.log(`Filtered out blacklisted title: "${item.title}"`);
            return false;
        }
        
        return true;
    });
}
