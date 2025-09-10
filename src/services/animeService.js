const { logger } = require('../utils/logger');
const { scrapeHomepage } = require('../scrap/otakudesu');
const { upsertAnimesHomepage } = require('../repository/animeRepo');

/**
 * Scrape homepage then store to Supabase.
 * @param {Object} opts
 * @param {boolean} opts.live - if true, force live fetch. default false uses local snapshot if available.
 */
async function scrapeAndStoreHomepage({ live = false } = {}) {
  logger.info(`Scraping Otakudesu homepage. live=${live}`);
  const start = Date.now();
  const items = await scrapeHomepage({ preferLocal: !live });
  logger.debug(`Parsed ${items.length} items`);
  if (!items.length) return { count: 0, data: [] };

  const { data, error } = await upsertAnimesHomepage(items);
  if (error) {
    logger.error('Supabase upsert error', { error: error.message });
    throw error;
  }
  const ms = Date.now() - start;
  logger.info(`Upserted ${data?.length ?? 0} items in ${ms}ms`);
  return { count: data?.length ?? 0, data };
}

module.exports = { scrapeAndStoreHomepage };
