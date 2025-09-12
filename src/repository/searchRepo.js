const { supabase } = require('../config/supabase');
const { logger } = require('../utils/logger');

const TABLE = process.env.SUPABASE_SEARCH_TABLE || 'search_results';
const ENABLE_WRITE = String(process.env.SUPABASE_ENABLE_WRITE || 'false').toLowerCase() === 'true';

/**
 * Upsert search results. No-op when ENABLE_WRITE=false.
 * Item: { title, url, thumbnail, episode_label, episode_num, rating, source, crawled_at }
 */
async function upsertSearchResults(items) {
  if (!ENABLE_WRITE) {
    logger.info(`[searchRepo] Write disabled. Skipping upsert for ${items.length} items.`);
    return { data: [], error: null, skipped: true };
  }

  const payload = items.map((x) => ({
    title: x.title?.trim(),
    url: x.url,
    thumbnail: x.thumbnail ?? null,
    episode_label: x.episode_label ?? null,
    episode_num: x.episode_num ?? null,
    rating: x.rating ?? null,
    source: x.source,
    crawled_at: x.crawled_at || new Date().toISOString(),
  }));

  const { data, error } = await supabase
    .from(TABLE)
    .upsert(payload, { onConflict: 'url' })
    .select();

  return { data, error, skipped: false };
}

module.exports = { upsertSearchResults };
