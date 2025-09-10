const { scrapeAndStoreHomepage } = require('../services/animeService');
const { logger } = require('../utils/logger');

async function getScrapeOtakudesu(req, res) {
  try {
    const live = req.query.live === '1' || req.query.live === 'true';
    const result = await scrapeAndStoreHomepage({ live });
    res.json({ message: 'Success', inserted: result.count, sample: result.data?.slice(0, 3) });
  } catch (err) {
    logger.error('Controller getScrapeOtakudesu error', { error: err.message });
    res.status(500).json({ message: 'Scrape failed', error: err.message });
  }
}

module.exports = { getScrapeOtakudesu };
