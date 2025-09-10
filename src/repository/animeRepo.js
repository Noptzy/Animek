const { supabase } = require('../config/supabase');

/**
 * Upsert homepage anime items into table `animes_homepage`.
 * Expect columns: title(text), url(text, unique), thumbnail(text), episode(text), rating(numeric), updated_at(timestamptz)
 */
async function upsertAnimesHomepage(items) {
  const TABLE = process.env.SUPABASE_TABLE || 'animes_homepage';

  // Validate and filter one more time on repo layer
  const isValidAnimeUrl = (u = '') => /\/anime\//.test(u) && !/\/ongoing-anime\//.test(u) && !/\/complete-anime\//.test(u);

  const payload = items
    .filter((x) => x && x.title && x.url && isValidAnimeUrl(x.url))
    .map((x) => ({
      title: x.title.trim(),
      url: x.url,
      thumbnail: x.thumbnail ?? null,
      episode: x.episode ?? null,
      rating: typeof x.rating === 'number' && !Number.isNaN(x.rating) ? x.rating : null,
      updated_at: x.updated_at || new Date().toISOString(),
    }));

  const { data, error } = await supabase
    .from(TABLE)
    .upsert(payload, { onConflict: 'url' })
    .select();

  return { data, error };
}

module.exports = { upsertAnimesHomepage };
