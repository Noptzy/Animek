const { scrapeAndStoreHomepage } = require('./animeService');
const { logger } = require('../utils/logger');

let timer = null;

function startScheduler() {
  const interval = Number(process.env.SCRAPE_INTERVAL_MS || 10 * 60 * 1000); // default 10 minutes
  const runOnStart = (process.env.SCRAPE_ON_START || 'true').toLowerCase() === 'true';

  const job = async () => {
    try {
      logger.info('Scheduler: running scrapeAndStoreHomepage()');
      await scrapeAndStoreHomepage({ live: true });
    } catch (err) {
      logger.error('Scheduler job error', { error: err.message });
    }
  };

  if (runOnStart) {
    job();
  }

  if (timer) clearInterval(timer);
  timer = setInterval(job, interval);
  logger.info(`Scheduler started. Interval=${interval}ms`);
}

module.exports = { startScheduler };
