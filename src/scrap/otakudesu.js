const cheerio = require('cheerio');
const path = require('path');
const fs = require('fs');
const { fetchText } = require('../utils/http');

const BASE_URL = 'https://otakudesu.best/';

/**
 * Try to load local snapshot for development to avoid hammering the live site.
 */
function loadLocalSnapshot() {
  try {
    const p = path.resolve(__dirname, '../../scrap raw data/otakudesu/homepageOtakudesu.html');
    if (fs.existsSync(p)) {
      return fs.readFileSync(p, 'utf8');
    }
  } catch (_) {}
  return null;
}

async function getHomepageHtml({ preferLocal = true } = {}) {
  if (preferLocal) {
    const local = loadLocalSnapshot();
    if (local) return local;
  }
  return await fetchText(BASE_URL);
}

/**
 * Scrape latest update cards from homepage
 * Returns: Array<{title, url, thumbnail, episode, rating, updated_at}>
 */
async function scrapeHomepage({ preferLocal = true } = {}) {
  const html = await getHomepageHtml({ preferLocal });
  const $ = cheerio.load(html);

  const items = [];
  const weekdays = new Set(['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu']);

  const isValidAnimeUrl = (u='') => {
    if (!u) return false;
    // only accept detail pages under /anime/ and skip listing pages
    if (!/\/anime\//.test(u)) return false;
    if (/\/ongoing-anime\//.test(u)) return false;
    if (/\/complete-anime\//.test(u)) return false;
    return true;
  };
  // Otakudesu homepage has sections like .venz and .detpost or .thumb > a > img etc.
  // We'll try multiple selectors to be resilient to small changes.
  $('.venser .venutama .rseries .detpost, .venser .venutama .rseries, .rseries').each((_, el) => {
    const root = $(el);
    const a = root.find('a').first();
    const url = a.attr('href');
    const title = (root.find('h2 a, h3 a, h2, h3, .jdlbar, .jdl, .detpost a[title]').first().text() || a.attr('title') || a.text() || '').trim();
    const thumb = root.find('img').first().attr('src') || root.find('img').first().attr('data-src');

    // Parse episode info commonly located in .epz or .eps or span
    let episode = root.find('.epz, .eps, .epztipe').first().text().trim();
    if (!episode) {
      const text = root.text();
      const m = text.match(/Episode\s*\d+/i);
      episode = m ? m[0] : '';
    }

    // Parse rating if present
    const ratingText = root.find('.rt, .rating, .rate, .score').first().text().trim();
    const rating = ratingText ? Number((ratingText.match(/\d+(?:\.\d+)?/) || [0])[0]) : null;

    if (isValidAnimeUrl(url) && title && !weekdays.has(title)) {
      items.push({
        title,
        url,
        thumbnail: thumb || null,
        episode: episode || null,
        rating,
        updated_at: new Date().toISOString(),
      });
    }
  });

  // Fallback: try cards in .venz list items
  if (items.length === 0) {
    $('.venz li').each((_, li) => {
      const a = $(li).find('a').first();
      const url = a.attr('href');
      const title = (a.attr('title') || $(li).find('.jdl, .title').text() || a.text() || '').trim();
      const thumb = a.find('img').attr('src') || a.find('img').attr('data-src');
      const episode = $(li).find('.epz, .eps').text().trim() || null;
      const ratingText = $(li).find('.rating, .rate, .score').text().trim();
      const rating = ratingText ? Number((ratingText.match(/\d+(?:\.\d+)?/) || [0])[0]) : null;
      if (isValidAnimeUrl(url) && title && !weekdays.has(title)) {
        items.push({ title, url, thumbnail: thumb || null, episode, rating, updated_at: new Date().toISOString() });
      }
    });
  }

  // Deduplicate by URL
  const unique = new Map();
  for (const it of items) {
    if (!unique.has(it.url)) unique.set(it.url, it);
  }

  return Array.from(unique.values());
}

module.exports = { scrapeHomepage };
