require('dotenv').config();
const cheerio = require('cheerio');
const otakudesuFetch = require('../fetch/otakudesuFetch');
const Logger = require('../../utils/logger');

const MIN_PAGE = parseInt(process.env.SCRAP_MIN_PAGE || '5', 10);

class OtakudesuScrap {
    async scrapSearchOtakudesu(query) {
        try {
            const html = await otakudesuFetch.getSearchAnimeOtakudesu(query);
            const $ = cheerio.load(html);
            const searchResults = [];

            $('ul.chivsrc li').each((i, el) => {
                const title = $(el).find('h2 a').text().trim();
                const link = $(el).find('h2 a').attr('href');
                const image = $(el).find('img').attr('src');

                const genres = [];
                $(el).find('.set b:contains("Genres")').parent().find('a').each((_, genreEl) => {
                    genres.push($(genreEl).text().trim());
                });

                const status = $(el).find('.set b:contains("Status")').parent().text().replace('Status :', '').trim();
                const rating = $(el).find('.set b:contains("Rating")').parent().text().replace('Rating :', '').trim();

                searchResults.push({ title, link, image, genres, status, rating });
            });

            return searchResults;
        } catch (error) {
            Logger.error('Error in scrapSearchOtakudesu:', error);
            return null;
        }
    }

    async scrapHomepageOtakudesu() {
        try {
            const html = await otakudesuFetch.getHomepageOtakudesu();
            const $ = cheerio.load(html);
            const homepageResults = [];

            $('div.detpost').each((i, el) => {
                const title = $(el).find('.thumbz h2').text().trim();
                const image = $(el).find('.thumbz img').attr('src');
                const episode = $(el).find('.epz').text().trim();
                const releaseDate = $(el).find('.newnime').text().trim();

                homepageResults.push({ title, image, episode, releaseDate });
            });

            return homepageResults;
        } catch (error) {
            Logger.error('Error in scrapHomepageOtakudesu:', error);
            return null;
        }
    }

    async scrapOngoingAnimeOtakudesu() {
        try {
            let results = [];
            for (let page = 1; page <= MIN_PAGE; page++) {
                const html = await otakudesuFetch.getOngoingAnimeOtakudesu(page);
                if (!html) break;
                const $ = cheerio.load(html);

                const pageResults = $('div.detpost')
                    .map((_, el) => ({
                        title: $(el).find('.thumbz h2').text().trim(),
                        image: $(el).find('.thumbz img').attr('src'),
                        episode: $(el).find('.epz').text().trim(),
                        releaseDate: $(el).find('.newnime').text().trim(),
                    }))
                    .get();

                if (pageResults.length === 0) break;
                results = results.concat(pageResults);
            }
            return results;
        } catch (error) {
            Logger.error('Error in scrapOngoingAnimeOtakudesu:', error);
            return [];
        }
    }

    async scrapCompleteAnimeOtakudesu() {
        try {
            let results = [];
            for (let page = 1; page <= MIN_PAGE; page++) {
                const html = await otakudesuFetch.getCompleteAnimeOtakudesu(page);
                if (!html) break;
                const $ = cheerio.load(html);

                const pageResults = $('div.detpost')
                    .map((_, el) => ({
                        title: $(el).find('.thumbz h2').text().trim(),
                        image: $(el).find('.thumbz img').attr('src'),
                        episode: $(el).find('.epz').text().trim(),
                        rating: $(el).find('.epztipe').text().trim(),
                    }))
                    .get();

                if (pageResults.length === 0) break;
                results = results.concat(pageResults);
            }
            return results;
        } catch (error) {
            Logger.error('Error in scrapCompleteAnimeOtakudesu:', error);
            return [];
        }
    }

    async scrapJadwalRilisAnimeOtakudesu() {
        try {
            const html = await otakudesuFetch.getJadwalRilisAnimeOtakudesu();
            const $ = cheerio.load(html);
            const scheduleResults = {};

            $('div.kglist321').each((i, el) => {
                const day = $(el).find('h2').text().trim();
                const list = [];
                $(el).find('ul li').each((i, li) => {
                    const title = $(li).find('a').text().trim();
                    const link = $(li).find('a').attr('href');
                    list.push({ title, link });
                });
                scheduleResults[day] = list;
            });

            return scheduleResults;
        } catch (error) {
            Logger.error('Error in scrapJadwalRilisAnimeOtakudesu:', error);
            return null;
        }
    }

    async scrapDetailAnimeOtakudesu(link) {
        try {
            const html = await otakudesuFetch.getDetailAnimeOtakudesu(link);
            if (!html) return { title: '', poster: undefined, info: {}, synopsis: '', episodes: [] };

            const $ = cheerio.load(html);

            let title =
                $('.jdlrx h1').text().trim() ||
                $('.posttl').text().trim() ||
                $('meta[property="og:title"]').attr('content') ||
                $('title').text().replace('Subtitle Indonesia', '').trim();

            let poster =
                $('.fotoanime img').attr('src') ||
                $('.thumb img').attr('src') ||
                $('meta[property="og:image"]').attr('content');

            const info = {};
            $('.infozin .infozingle p, .infoanime p').each((i, el) => {
                const $el = $(el);
                const label = $el.find('b').text().replace(':', '').trim().toLowerCase();
                let value = $el.text().replace($el.find('b').text(), '').replace(':', '').trim();

                if (label === 'genre' || label === 'genres') {
                    const genres = [];
                    $el.find('a').each((_, g) => genres.push($(g).text().trim()));
                    info['genres'] = genres;
                } else if (label) {
                    info[label] = value;
                }
            });

            let synopsis =
                $('.sinopc p').map((i, el) => $(el).text().trim()).get().join('\n\n') ||
                $('.sinopc').text().trim() ||
                $('.desc p').text().trim();

            const episodes = [];
            $('.episodelist').each((_, section) => {
                const sectionTitle = $(section).find('.smokelister .monktit').text().toLowerCase();
                if (sectionTitle.includes('lengkap')) return;
                $(section).find('ul li').each((i, el) => {
                    const epTitle = $(el).find('a').text().trim();
                    const epLink = $(el).find('a').attr('href');
                    const epDate = $(el).find('.zeebr').text().trim();
                    if (epTitle && epLink) {
                        episodes.push({ title: epTitle, link: epLink, date: epDate });
                    }
                });
            });

            return { title, poster, info, synopsis, episodes };
        } catch (error) {
            Logger.error('Error in scrapDetailAnimeOtakudesu:', error);
            return { title: '', poster: undefined, info: {}, synopsis: '', episodes: [] };
        }
    }

    async scrapDetailAnimeEpsOtakudesu(link) {
        try {
            const html = await otakudesuFetch.getDetailAnimeEpsOtakudesu(link);
            const $ = cheerio.load(html);

            let title = $('h1.jdl-h1').text().trim() || $('.jdlrx h1').text().trim() || $('.posttl').text().trim();

            const streamingServers = [];
            $('iframe').each((i, el) => {
                const embed = $(el).attr('src');
                if (embed) {
                    streamingServers.push({ server: `Iframe ${i + 1}`, embed });
                }
            });
            $('.mirrorstream a').each((i, el) => {
                const server = $(el).text().trim() || `Mirror ${i + 1}`;
                const embed = $(el).attr('href') || $(el).attr('data-src') || $(el).attr('data-iframe') || '#';
                streamingServers.push({ server, embed });
            });
            $('script').each((_, el) => {
                const scriptText = $(el).html();
                if (scriptText && scriptText.includes('iframe')) {
                    const match = scriptText.match(/src\s*=\s*"(https?:\/\/[^"]+)"/);
                    if (match) {
                        streamingServers.push({ server: 'InlineScript', embed: match[1] });
                    }
                }
            });

            const downloadLinks = [];
            $('.download-eps').each((i, el) => {
                const quality = $(el).find('p').text().trim();
                const links = [];
                $(el).find('ul li a').each((_, a) => {
                    const host = $(a).text().trim();
                    const link = $(a).attr('href');
                    if (host && link) links.push({ host, link });
                });
                if (quality && links.length > 0) downloadLinks.push({ quality, links });
            });
            if (downloadLinks.length === 0) {
                $('.download ul').each((i, el) => {
                    const quality = $(el).prev('li').find('strong').text().trim();
                    const links = [];
                    $(el).find('a').each((_, a) => {
                        const host = $(a).text().trim();
                        const link = $(a).attr('href');
                        if (host && link) links.push({ host, link });
                    });
                    if (quality && links.length > 0) downloadLinks.push({ quality, links });
                });
            }
            if (downloadLinks.length === 0) {
                $('.download li').each((i, el) => {
                    const quality = $(el).find('strong').text().trim();
                    const links = [];
                    $(el).find('a').each((_, a) => {
                        const host = $(a).text().trim();
                        const link = $(a).attr('href');
                        if (host && link) links.push({ host, link });
                    });
                    if (quality && links.length > 0) downloadLinks.push({ quality, links });
                });
            }

            return { title, streamingServers, downloadLinks };
        } catch (error) {
            Logger.error('Error in scrapDetailAnimeEpsOtakudesu:', error);
            return { title: '', streamingServers: [], downloadLinks: [] };
        }
    }

    async scrapGendreListOtakudesu() {
        try {
            const html = await otakudesuFetch.getGendreListOtakudesu();
            const $ = cheerio.load(html);
            let genreList = [];

            const selectors = [
                '.genres ul li a',
                '.genre-list ul li a',
                '.genre ul li a',
                'ul.genre li a',
                '.genres-list ul li a',
                '.genres-list a',
                '.genrelist a',
                '.genrelist ul li a',
                'a[href*="/genres/"]',
                'a[href*="/genre/"]',
            ];

            for (const selector of selectors) {
                const found = $(selector);
                if (found.length > 0) {
                    found.each((i, el) => {
                        const name = $(el).text().trim();
                        const link = $(el).attr('href');
                        if (name && link && (link.includes('/genres/') || link.includes('/genre/')) && !genreList.some((g) => g.link === link)) {
                            genreList.push({ name, link });
                        }
                    });
                }
            }

            return genreList;
        } catch (error) {
            Logger.error('Error in scrapGendreListOtakudesu:', error);
            return null;
        }
    }

    async getDetailGenresOtakudesu(link) {
        try {
            let results = [];
            for (let page = 1; page <= MIN_PAGE; page++) {
                const html = await otakudesuFetch.getDetailGenre(link, page);
                if (!html) break;
                const $ = cheerio.load(html);

                const pageResults = $('.col-anime-con .col-anime')
                    .map((_, el) => {
                        const title = $(el).find('.col-anime-title a').text().trim();
                        const link = $(el).find('.col-anime-title a').attr('href');
                        const studio = $(el).find('.col-anime-studio').text().trim();
                        const eps = $(el).find('.col-anime-eps').text().trim();
                        const rating = $(el).find('.col-anime-rating').text().trim();
                        const cover = $(el).find('.col-anime-cover img').attr('src');
                        const date = $(el).find('.col-anime-date').text().trim();
                        const genres = $(el).find('.col-anime-genre a').map((_, g) => $(g).text().trim()).get();

                        return title && link ? { title, link, studio, eps, rating, cover, genres, date } : null;
                    })
                    .get();

                if (pageResults.length === 0) break;
                results = results.concat(pageResults);
            }
            return results;
        } catch (error) {
            Logger.error('Error in getDetailGenresOtakudesu:', error);
            return [];
        }
    }
}

module.exports = new OtakudesuScrap();
