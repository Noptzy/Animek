const pLimit = require('p-limit');
const { fetchSearchPage } = require('../scrap/fetch/oploverzFetch');
const { parseSearchPage } = require('../scrap/parser/oploverzParser');
const { upsertSearchResults } = require('../repository/searchRepo');
const { logger } = require('../utils/logger');

/**
 * Orchestrate Oploverz search with pagination and persistence.
 * @param {Object} opts
 * @param {string} opts.query
 * @param {number} [opts.pageLimit=5]
 * @param {boolean} [opts.persist=true]
 * @returns {Promise<{total:number, inserted?:number, items:any[]}>}
 */
async function searchOploverz({ query, pageLimit = 5, persist = true } = {}) {
  if (!query || String(query).trim().length < 2) {
    throw new Error('query must be at least 2 characters');
  }

  const limit = pLimit(Number(process.env.SEARCH_CONCURRENCY || 2));
  const pages = [...Array(Math.max(1, pageLimit)).keys()].map((i) => i + 1);

  logger.info(`[oploverzSearch] query="${query}" pages=${pages.length}`);
  const results = [];

  // Serial fetching is safer; use concurrency only if needed
  for (const page of pages) {
    const res = await fetchSearchPage(query, page);
    if (!res.ok) {
      logger.warn('[oploverzSearch] fetch failed', { page, error: res.error });
      continue;
    }
    const parsed = parseSearchPage({ ...res.data });
    results.push(...parsed.items);
    logger.debug(`[oploverzSearch] page=${page} items=${parsed.items.length} next=${parsed.nextPageExists}`);
    if (!parsed.nextPageExists) break;
    await sleep(randomInt(150, 600));
  }

  // Deduplicate by url
  const map = new Map();
  for (const it of results) if (!map.has(it.url)) map.set(it.url, it);
  const unique = Array.from(map.values());

  let inserted = 0;
  if (persist) {
    const { data, error, skipped } = await upsertSearchResults(unique);
    if (error) {
      logger.error('[oploverzSearch] upsert error', { error: error.message });
      throw error;
    }
    inserted = skipped ? 0 : (data?.length ?? 0);
  }

  return { total: unique.length, inserted, items: unique };
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

module.exports = { searchOploverz };
