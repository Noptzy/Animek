const otakudesuScrap = require('./src/scrap/parser/Otakudesuscrap.js');
const fs = require('fs');
require('dotenv').config();

const saveJsonResponse = (data, filename) => {
    try {
        const dir = './test';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        const jsonString = JSON.stringify(data, null, 2);
        fs.writeFileSync(`${dir}/${filename}.json`, jsonString);
        console.log(`Saved ${dir}/${filename}.json`);
    } catch (error) {
        console.log('Error saving to JSON:', error);
    }
};

const testingFunction = async () => {
    try {
        console.log('Starting comprehensive Otakudesu scraper testing...\n');
        const minPageScrap = parseInt(process.env.MIN_PAGE_SCRAP, 10) || 5;
        console.log(`Config MIN_PAGE_SCRAP = ${minPageScrap}\n`);

        const searchResults = await otakudesuScrap.scrapSearchOtakudesu('naruto');
        console.log(`Search Results: ${searchResults?.length || 0}`);

        const homepageResults = await otakudesuScrap.scrapHomepageOtakudesu();
        console.log(`Homepage Results: ${homepageResults?.length || 0}`);

        const ongoingResults = await otakudesuScrap.scrapOngoingAnimeOtakudesu();
        console.log(`Ongoing Results (min ${minPageScrap} pages): ${ongoingResults?.length || 0}`);
        
        const completeResults = await otakudesuScrap.scrapCompleteAnimeOtakudesu();
        console.log(`Completed Results (min ${minPageScrap} pages): ${completeResults?.length || 0}`);

        const scheduleResults = await otakudesuScrap.scrapJadwalRilisAnimeOtakudesu();
        console.log(`Schedule Results: ${Object.keys(scheduleResults).length} days`);

        const detailLinks = [
            'https://otakudesu.best/anime/kimetsu-yaiba-s4-sub-indo/',
            'https://otakudesu.best/anime/hikaru-ga-shinda-natsu-sub-indo/',
            'https://otakudesu.best/anime/borot-sub-indo/'
        ];
        const detailResults = {};
        for (const link of detailLinks) {
            const result = await otakudesuScrap.scrapDetailAnimeOtakudesu(link);
            detailResults[link] = result;
            console.log(`Detail for ${link}: ${result?.title || 'FAILED'}`);
        }

        let episodeDetailResults = {};
        const firstAnimeWithEpisodes = Object.values(detailResults).find(
            (anime) => anime?.episodes?.length > 0
        );
        if (firstAnimeWithEpisodes) {
            const episodeLink = firstAnimeWithEpisodes.episodes.find(
                (ep) => !ep.title.toLowerCase().includes('batch')
            )?.link;

            if (episodeLink) {
                episodeDetailResults = await otakudesuScrap.scrapDetailAnimeEpsOtakudesu(episodeLink);
                console.log(`Episode Detail: ${episodeDetailResults?.title || 'FAILED'}`);
            } else {
                console.log('Episode Detail: (semua episode batch, tidak ada reguler)');
            }
        }

        const genreResults = await otakudesuScrap.scrapGendreListOtakudesu();
        console.log(`Genre List: ${genreResults?.length || 0}`);

        const detailGenreLink = 'https://otakudesu.best/genres/action/';
        const detailGenreResults = await otakudesuScrap.getDetailGenresOtakudesu(detailGenreLink);
        console.log(
            `Detail Genre 'Action' (min ${minPageScrap} pages): ${detailGenreResults?.length || 0}`
        );

        return {
            metadata: {
                testDate: new Date().toISOString(),
                minPageScrap,
            },
            searchResults,
            homepageResults,
            ongoingResults,
            completeResults,
            scheduleResults,
            detailResults,
            episodeDetailResults,
            genreResults,
            detailGenreResults,
        };
    } catch (error) {
        console.error('Terjadi kesalahan saat menjalankan tes:', error);
        return {
            error: {
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString(),
            },
        };
    }
};

const createSummary = (results) => {
    if (results.error) {
        return `TEST FAILED: ${results.error.message}`;
    }
    return `
OTAKUDESU SCRAPER TEST SUMMARY
================================
Test Date: ${results.metadata.testDate}
MIN_PAGE_SCRAP: ${results.metadata.minPageScrap}

BASIC RESULTS:
• Search Results: ${results.searchResults?.length || 0}
• Homepage: ${results.homepageResults?.length || 0}
• Ongoing (paged): ${results.ongoingResults?.length || 0}
• Completed (paged): ${results.completeResults?.length || 0}
• Schedule Days: ${Object.keys(results.scheduleResults || {}).length}

DETAIL RESULTS:
• Detail Animes: ${Object.keys(results.detailResults || {}).length}
• Episode Detail: ${results.episodeDetailResults?.title ? '✅' : '❌'}

GENRE RESULTS:
• Genres: ${results.genreResults?.length || 0}
• Detail Genre (paged): ${results.detailGenreResults?.length || 0}
    `.trim();
};

(async () => {
    console.log('Running Full Otakudesu Scraper Test Suite...\n');
    const results = await testingFunction();

    saveJsonResponse(results, 'testResults');
    const summary = createSummary(results);

    fs.writeFileSync('./test/testSummary.txt', summary);
    console.log('\nSaved test/testSummary.txt');

    console.log('\n--- SUMMARY ---\n');
    console.log(summary);
})();
