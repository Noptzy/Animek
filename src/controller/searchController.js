const { searchOploverz } = require('../services/oploverzSearchService');
const { logger } = require('../utils/logger');

async function getSearchOploverz(req, res) {
  try {
    const q = String(req.query.q || '').trim();
    const pageLimit = Number(req.query.pages || process.env.SEARCH_PAGE_LIMIT || 5);
    const persist = (req.query.persist ?? '1') !== '0';
    const result = await searchOploverz({ query: q, pageLimit, persist });
    res.json({ message: 'ok', total: result.total, inserted: result.inserted, sample: result.items.slice(0, 5) });
  } catch (err) {
    logger.error('[getSearchOploverz] error', { error: err.message });
    res.status(400).json({ message: err.message });
  }
}

module.exports = { getSearchOploverz };
