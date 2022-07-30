const { parse } = require('node-html-parser')
const fetch = require('node-fetch')

const SEARCH_URL = 'https://free-loops.com/free-loops-find.php'
const RANDOM_SOUND_UNTESTED = 'https://free-loops.com/random-sound.php'

function constructDownloadUrl(id) {
    return `https://free-loops.com/force-audio.php?id=${id}`
}

function constructFreeLoopsSearchUrl(term, page = 1) {
    if (!term) throw 'Must specify a term!'

    return `${SEARCH_URL}?term=${encodeURI(term)}&page=${page}`
}

async function fetchFreeLoopsPageHtml({
    term = 'sound effect',
    page = 1,
} = {}) {
    const url = constructFreeLoopsSearchUrl(term, page)
    let html = ''
    await fetch(url).then((res) => (html = res.text()))
    return html
}

function parseSourcesFromHtml(html) {
    let sources = []

    const tags = parse(html).querySelectorAll('.row-b > td:first-child > a')
    for (const { rawAttrs: hrefRaw, innerText: title } of tags) {
        const id = hrefRaw.match(/(?<=href=')[0-9]*(?=-)/gmu)[0]
        id && sources.push({ id, title })
    }

    return sources
}

async function getAudioUrls(searchTerm) {
    return parseSourcesFromHtml(
        await fetchFreeLoopsPageHtml({ term: searchTerm, page: 1 })
    )
}

module.exports = {
    parseSourcesFromHtml,
    fetchFreeLoopsPageHtml,
    getAudioUrls,
    constructDownloadUrl,
}
